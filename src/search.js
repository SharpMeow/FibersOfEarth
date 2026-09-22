// Offline ranked search. Field-weighted BM25F scoring with typo tolerance, prefix completion,
// quoted phrases, exclusions and field filters. Documents and queries share one normalizer,
// so British and American spellings and simple plurals meet in the same index.
const STOP=new Set('a an and are as at be by for from has have in into is it its of on or that the their this to was were which with'.split(' '));
const SPELLING=[[/fibre/g,'fiber'],[/colour/g,'color'],[/lustre/g,'luster'],[/metre/g,'meter'],[/centre/g,'center'],[/grey/g,'gray'],[/mould/g,'mold'],[/woollen/g,'woolen'],[/isation/g,'ization'],[/ise(d|s)?$/,'ize$1'],[/yse(d|s)?$/,'yze$1']];
export const fold=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function stem(t){
 if(/^\d/.test(t))return t;
 for(const [re,to] of SPELLING)t=t.replace(re,to);
 if(t.length>4&&t.endsWith('ies'))return t.slice(0,-3)+'y';
 if(t.length>4&&/(sses|xes|ches|shes)$/.test(t))return t.slice(0,-2);
 if(t.length>3&&t.endsWith('s')&&!/(ss|us|is)$/.test(t))return t.slice(0,-1);
 return t;
}
export function tokenize(s,{keepStop=false}={}){return fold(s).split(/[^a-z0-9]+/).filter(t=>t&&(keepStop||!STOP.has(t))).map(stem);}
// Damerau-Levenshtein (optimal string alignment) with an early exit once max is exceeded.
export function editDistance(a,b,max=2){
 if(Math.abs(a.length-b.length)>max)return max+1;
 let prev2=null,prev=Array.from({length:b.length+1},(_,j)=>j);
 for(let i=1;i<=a.length;i++){
  const cur=[i];let best=i;
  for(let j=1;j<=b.length;j++){
   let v=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
   if(prev2&&i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])v=Math.min(v,prev2[j-2]+1);
   cur.push(v);if(v<best)best=v;
  }
  if(best>max)return max+1;
  prev2=prev;prev=cur;
 }
 return prev[b.length];
}
const fuzzyLimit=t=>/\d/.test(t)||t.length<4?0:t.length<8?1:2;
// Query syntax: "exact phrase", -excluded, field:value (field keys or their aliases).
export function parseQuery(q,fieldAliases={}){
 const out={terms:[],phrases:[],exclude:[],fields:[]};
 const re=/(-?)(?:([a-z]+):)?(?:"([^"]*)"?|(\S+))/gi;let m;
 const raw=fold(q);
 while((m=re.exec(raw))){
  const [,neg,field,phrase,word]=m;const key=field&&fieldAliases[field];
  if(phrase!=null){const toks=tokenize(phrase,{keepStop:true});if(toks.length)(neg?out.exclude:out.phrases).push(toks);continue;}
  if(field&&!key){for(const t of tokenize(field+' '+word))(neg?out.exclude:out.terms).push([t]);continue;}
  const toks=tokenize(word);
  if(key){for(const t of toks)(neg?out.exclude:out.fields).push({field:key,term:t});continue;}
  for(const t of toks)(neg?out.exclude:out.terms).push([t]);
 }
 return out;
}
export function createIndex(docs,fields,{aliases={},k1=1.2,b=0.75}={}){
 const keys=Object.keys(fields);const fieldAliases={...Object.fromEntries(keys.map(k=>[k.toLowerCase(),k])),...aliases};
 const postings=new Map(),lengths=keys.map(()=>0),records=[];
 docs.forEach((doc,d)=>{
  const rec={doc,tf:{},len:{},text:{}};
  keys.forEach((k,f)=>{
   const value=[].concat(doc[k]??[]).flat(2).join(' ');const toks=tokenize(value,{keepStop:true});
   rec.text[k]=' '+toks.join(' ')+' ';const content=toks.filter(t=>!STOP.has(t));rec.len[k]=content.length;lengths[f]+=content.length;
   for(const t of content){rec.tf[t]??={};rec.tf[t][k]=(rec.tf[t][k]||0)+1;if(!postings.has(t))postings.set(t,new Set());postings.get(t).add(d);}
  });
  records.push(rec);
 });
 const avg=Object.fromEntries(keys.map((k,f)=>[k,lengths[f]/Math.max(1,docs.length)||1]));
 const vocab=[...postings.keys()].sort();
 const idf=t=>{const n=postings.get(t)?.size||0;return Math.log(1+(docs.length-n+.5)/(n+.5));};
 function expand(term,last){
  const out=new Map();if(postings.has(term))out.set(term,1);
  if(last&&term.length>=2&&!/^\d+$/.test(term)){let i=lowerBound(vocab,term),n=0;while(i<vocab.length&&vocab[i].startsWith(term)&&n<40){if(!out.has(vocab[i]))out.set(vocab[i],.72);i++;n++;}}
  const lim=fuzzyLimit(term);
  if(!out.size&&lim)for(const v of vocab){const d=editDistance(term,v,lim);if(d<=lim)out.set(v,d===1?.55:.35);}
  return out;
 }
 function fieldScore(rec,t,only){let tf=0;for(const [k,n] of Object.entries(rec.tf[t]||{}))if(!only||only===k)tf+=fields[k]*n/(1-b+b*rec.len[k]/avg[k]);return tf?idf(t)*tf*(k1+1)/(tf+k1):0;}
 function search(q,{filter=()=>true}={}){
  const pq=parseQuery(q,fieldAliases);
  if(!pq.terms.length&&!pq.phrases.length&&!pq.fields.length&&!pq.exclude.length)return docs.filter(filter).map(doc=>({doc,score:0,matched:{}}));
  const groups=pq.terms.map(([t],i)=>({t,exp:expand(t,i===pq.terms.length-1&&!/\s$/.test(q))}));
  const fieldGroups=pq.fields.map(({field,term})=>({field,exp:expand(term,false)}));
  const results=[];
  records.forEach((rec,d)=>{
   if(!filter(rec.doc))return;
   let score=0;const matched={},hits=[];
   const note=(t)=>{for(const k of Object.keys(rec.tf[t]||{})){(matched[k]??=new Set()).add(t);}};
   for(const g of groups){let best=0,hit=null;for(const [t,w] of g.exp){const s=fieldScore(rec,t)*w;if(s>best){best=s;hit=t;}}if(!hit)return;score+=best;hits.push(hit);for(const [t] of g.exp)if(rec.tf[t])note(t);}
   for(const g of fieldGroups){let best=0;for(const [t,w] of g.exp){const s=fieldScore(rec,t,g.field)*w;if(s>best)best=s;}if(!best)return;score+=best*1.5;for(const [t] of g.exp)if(rec.tf[t]?.[g.field])(matched[g.field]??=new Set()).add(t);}
   for(const p of pq.phrases){const needle=' '+p.join(' ')+' ';const hitFields=keys.filter(k=>rec.text[k].includes(needle));if(!hitFields.length)return;score+=Math.max(...hitFields.map(k=>fields[k]))*p.length;p.filter(t=>!STOP.has(t)).forEach(note);}
   for(const ex of pq.exclude){const needle=' '+ex.join(' ')+' ';if(keys.some(k=>rec.text[k].includes(needle)))return;}
   // Title boosts use each group's best-scoring expansion, so a corrected typo still ranks its exact name first.
   const title=keys[0],qt=hits.join(' ');
   if(qt&&rec.text[title].trim()===qt)score*=3;else if(qt&&rec.text[title].startsWith(' '+qt))score*=1.8;else if(hits.length&&hits.every(t=>rec.tf[t]?.[title]))score*=1.5;
   results.push({doc:rec.doc,score,matched:Object.fromEntries(Object.entries(matched).map(([k,v])=>[k,[...v]]))});
  });
  return results.sort((a,b)=>b.score-a.score);
 }
 // Suggest a corrected query from the index vocabulary when a term has no close match.
 function suggest(q){
  const pq=parseQuery(q,fieldAliases);if(!pq.terms.length)return null;let changed=false;
  const words=pq.terms.map(([t])=>{if(postings.has(t))return t;let best=null,bd=3,bn=0;for(const v of vocab){const d=editDistance(t,v,2);const n=postings.get(v).size;if(d<bd||(d===bd&&n>bn)){best=v;bd=d;bn=n;}}if(best&&bd<=2){changed=true;return best;}return t;});
  return changed?words.join(' '):null;
 }
 return {search,suggest,vocab,size:docs.length,fields:keys};
}
function lowerBound(arr,x){let lo=0,hi=arr.length;while(lo<hi){const mid=(lo+hi)>>1;if(arr[mid]<x)lo=mid+1;else hi=mid;}return lo;}
// Snippet around the first matched word, with matches wrapped in <mark>. Text is HTML-escaped.
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function snippet(text,terms,max=180){
 text=String(text??'');const words=[...text.matchAll(/[\p{L}\p{N}]+/gu)];const set=new Set(terms);
 const isHit=w=>set.has(stem(fold(w)))||[...set].some(t=>t.length>=3&&stem(fold(w)).startsWith(t));
 const first=words.find(w=>isHit(w[0]));
 let start=0;if(first&&first.index>max/3){start=text.lastIndexOf(' ',first.index-Math.floor(max/3))+1;}
 let end=Math.min(text.length,start+max);if(end<text.length){const sp=text.lastIndexOf(' ',end);if(sp>start)end=sp;}
 let html='',pos=start;
 for(const w of words){if(w.index<start)continue;if(w.index+w[0].length>end)break;if(isHit(w[0])){html+=escapeHTML(text.slice(pos,w.index))+'<mark>'+escapeHTML(w[0])+'</mark>';pos=w.index+w[0].length;}}
 html+=escapeHTML(text.slice(pos,end));
 return (start>0?'… ':'')+html+(end<text.length?' …':'');
}
