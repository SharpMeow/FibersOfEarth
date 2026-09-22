import {glossaryEntries,glossarySources} from './glossary.js';
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Link the first mention of each glossary term inside already-escaped text. `used` carries across
// paragraphs so a term is linked once per page; `skip` excludes the term being defined.
const reEscape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Terms that are also everyday words ("on the other hand") are not auto-linked.
const ambiguous=new Set(['Hand','Top']);
const linkable=[...glossaryEntries].filter(t=>t.term.length>3&&!ambiguous.has(t.term)).sort((a,b)=>b.term.length-a.term.length);
const linkPattern=new RegExp('\\b('+linkable.map(t=>reEscape(escapeHTML(t.term))).join('|')+')\\b','gi');
const byLower=Object.fromEntries(linkable.map(t=>[escapeHTML(t.term).toLowerCase(),t]));
// Same word, different science: keratin "intermediate filaments" are not textile filaments.
const notTextile=(t,before)=>t.term==='Filament'&&/intermediate\s$/i.test(before);
export function linkTerms(html,link=id=>'#/glossary/'+id,used=new Set(),skip=''){
 return html.replace(linkPattern,(match,_,offset,whole)=>{const t=byLower[match.toLowerCase()];if(!t||t.id===skip||used.has(t.id)||notTextile(t,whole.slice(Math.max(0,offset-14),offset)))return match;used.add(t.id);return `<a class="term-link" href="${escapeHTML(link(t.id))}" title="${escapeHTML(t.definition)}">${match}</a>`;});
}
export function termRefs(t){return [...t.sources.map(id=>glossarySources[id]),...(t.refs||[])].filter(Boolean).filter((s,i,a)=>a.findIndex(x=>x.url===s.url)===i);}
export function termBody(t,link=id=>'#/glossary/'+id){
 const e=escapeHTML,used=new Set(),p=text=>`<p>${linkTerms(e(text),link,used,t.id)}</p>`;
 const section=(heading,text)=>text?`<section><h2>${heading}</h2>${p(text)}</section>`:'';
 return `<p class="definition-lead">${e(t.definition)}</p>${section('In detail',t.explanation)}${section('The science and numbers',t.deeper)}${section('A practical example',t.example)}${section('What to distinguish',t.caution)}${section('Origins and history',t.origins)}<section><h2>Related terms</h2><ul class="related-terms">${t.related.map(name=>{const r=glossaryEntries.find(x=>x.term===name);return `<li><a href="${e(link(r.id))}">${e(name)}</a></li>`;}).join('')}</ul></section><section><h2>Sources & further reading</h2><ul class="source-links">${termRefs(t).map(s=>`<li><a href="${e(s.url)}" rel="noopener noreferrer">${e(s.title)}</a></li>`).join('')}</ul><p class="editorial-note">Technical references reviewed ${t.reviewed}. Examples are illustrative. Industry organizations and manufacturers describe their own fields; their references are not independent product endorsements. Figures are approximate and depend on the stated test conditions.</p></section>`;
}
