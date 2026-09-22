import legacy from './legacy.json' with {type:'json'};
import {profiles,sources as coreSources,articles,glossary,regions} from './content.js';
import {extended,extraSources,histories,aliases} from './extended.js';
import {brands,brandSources} from './brands.js';
// Generated research layers live as JSON data; see docs/CONTENT.md for the method and evidence levels.
import details from './data/details.json' with {type:'json'};
import guide from './data/guide.json' with {type:'json'};
import datasheet from './data/datasheet.json' with {type:'json'};
import {createIndex,fold} from './search.js';
export {articles,glossary,regions};
export const sources=[...coreSources,...extraSources,...brandSources];
export const materials=Object.values({...profiles,...extended,...brands}).map((m,i)=>({...m,index:i+1,history:m.history||histories[m.id],aliases:aliases[m.id]||'',detail:details[m.id]||null,guide:guide[m.id]||null,data:datasheet[m.id]||null,color:['#a6b49e','#c8b89d','#b6c0ae','#aeacb1','#c0a18d','#a4b6b3'][i%6]}));
export const byId=Object.fromEntries(materials.map(m=>[m.id,m]));
export const families=['All materials','Plant','Animal','Cellulosic','Synthetic','Recycled','Technical','Mineral & metal','Bio-based','Regenerated protein','Specialty','Brands & technologies'];
export const networks=Object.fromEntries(Object.entries(legacy.FIBRES).map(([id,f])=>[id,{nodes:Object.fromEntries(Object.entries({...f.nodes,...legacy.RETAIL}).map(([k,n])=>[k,{...n,id:k,country:legacy.GEO[n.name]||'China',role:n.src?'Origin':n.hub?'Processing':'Destination'}])),flows:f.flows.map(x=>x.slice(0,3)),camera:f.camera}]));
function addNetwork(id,rows,paths){
 const nodes=Object.fromEntries(rows.map(([key,name,country,lat,lon,sub,role])=>[key,{id:key,name,country,lat,lon,sub,role,src:role==='Origin',ret:role==='Destination',hub:role==='Processing'}]));
 const flows=[];for(const path of paths)for(let i=1;i<path.length;i++)if(!flows.some(f=>f[0]===path[i-1]&&f[1]===path[i]))flows.push([path[i-1],path[i],i===1?1:(i===path.length-1?3:2)]);
 networks[id]={nodes,flows,camera:[20,20]};
}
const retail=[['paris','Paris','France',48.86,2.35,'Illustrative market','Destination'],['london','London','United Kingdom',51.51,-.12,'Illustrative market','Destination'],['nyc','New York','United States',40.71,-74.01,'Illustrative market','Destination']];
addNetwork('lyocell', [['pulp','Eunápolis','Brazil',-16.37,-39.58,'Cellulose feedstock','Origin'],['fiber','Lenzing','Austria',48.27,13.55,'Fiber formation','Processing'],['fabric','Kaunas','Lithuania',54.90,23.90,'Yarn & fabric model','Processing'],...retail],[['pulp','fiber','fabric','paris'],['pulp','fiber','fabric','london'],['pulp','fiber','fabric','nyc']]);
addNetwork('modal',[['wood','Lenzing region','Austria',48.27,13.55,'Wood & pulp model','Origin'],['fiber','Upper Austria','Austria',48.1,14.0,'Fiber formation','Processing'],['fabric','Prato','Italy',43.88,11.1,'Yarn & fabric model','Processing'],...retail],[['wood','fiber','fabric','paris'],['wood','fiber','fabric','london'],['wood','fiber','fabric','nyc']]);
addNetwork('ramie',[['plant','Hunan','China',28.23,112.94,'Cultivation model','Origin'],['fiber','Changsha','China',28.2,113.05,'Separation & degumming','Processing'],['fabric','Shanghai','China',31.23,121.47,'Yarn & fabric model','Processing'],...retail],[['plant','fiber','fabric','paris'],['plant','fiber','fabric','london'],['plant','fiber','fabric','nyc']]);
addNetwork('recycled-wool',[['collect','Prato collection area','Italy',43.7,10.9,'Textile collection model','Origin'],['sort','Prato','Italy',43.88,11.1,'Sort & mechanically open','Processing'],['yarn','Biella','Italy',45.57,8.05,'Blending & textile model','Processing'],...retail],[['collect','sort','yarn','paris'],['collect','sort','yarn','london'],['collect','sort','yarn','nyc']]);
addNetwork('recycled-polyester',[['collect','Shanghai collection area','China',31.1,121.2,'PET collection model','Origin'],['polymer','Ningbo','China',29.87,121.54,'Sort & reprocess model','Processing'],['fabric','Shaoxing','China',30,120.58,'Yarn & fabric model','Processing'],...retail],[['collect','polymer','fabric','paris'],['collect','polymer','fabric','london'],['collect','polymer','fabric','nyc']]);
export function distance(a,b){const r=Math.PI/180;const p=(b.lat-a.lat)*r,q=(b.lon-a.lon)*r;const h=Math.sin(p/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(q/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));}
export const journeys=[];
for(const [fiber,n] of Object.entries(networks)){
 const paths=[];
 function walk(path){const last=path.at(-1);if(n.nodes[last].ret){paths.push(path);return;}if(path.length>7)return;for(const f of n.flows.filter(f=>f[0]===last&&!path.includes(f[1])))walk([...path,f[1]]);}
 Object.values(n.nodes).filter(x=>x.src).forEach(x=>walk([x.id]));
 paths.sort((a,b)=>(b.length-a.length)||((a.at(-1)==='milan'?-1:0)-(b.at(-1)==='milan'?-1:0)));
 const chosen=[];const starts=new Set();for(const path of paths)if(!starts.has(path[0])&&chosen.length<4){chosen.push(path);starts.add(path[0]);}
 for(const path of paths)if(chosen.length<4&&!chosen.includes(path))chosen.push(path);
 chosen.forEach((path,i)=>{const stops=path.map(k=>n.nodes[k]);journeys.push({id:fiber+'-'+(i+1),fiber,stops,keys:path,title:stops[0].name+' to '+stops.at(-1).name,km:Math.round(stops.slice(1).reduce((sum,p,j)=>sum+distance(stops[j],p),0)),countries:[...new Set(stops.map(x=>x.country))],status:byId[fiber].legacyOnly?'Legacy concept':'Illustrative route'});});
}
export const journeyById=Object.fromEntries(journeys.map(j=>[j.id,j]));
export const locations=Object.values(Object.fromEntries(Object.values(networks).flatMap(n=>Object.values(n.nodes)).map(n=>[n.name,n])));
export function normalize(s){return fold(s).trim();}
// Field weights for ranked search. The first field is the title used for exact-name boosts.
const materialFields={name:10,aliases:7,id:5,type:3,base:2.5,family:2,tagline:2,composition:3,uses:2.5,feel:1.5,history:1.1,origin:1.6,structure:1.1,process:1.1,performance:1.1,identify:.9,labeling:1.1,past:1,facts:1.2,care:.5,tradeoff:.5,types:1.4,fabrics:1.6,quality:.8,careGuide:.6,impact:.8,faq:1,notable:.6,pros:.6,cons:.6,timeline:.9,production:.8};
const materialFieldAliases={family:'family',name:'name',use:'uses',uses:'uses',history:'past',origin:'origin',source:'origin',chemistry:'structure',structure:'structure',process:'process',processing:'process',performance:'performance',identify:'identify',law:'labeling',legal:'labeling',label:'labeling',labeling:'labeling',care:'care',types:'types',grade:'types',fabric:'fabrics',fabrics:'fabrics',buy:'quality',quality:'quality',impact:'impact',faq:'faq'};
export const fieldLabels={name:'Name',aliases:'Search terms',id:'Identifier',type:'Entry type',base:'Underlying material',family:'Family',tagline:'Summary',composition:'Composition',uses:'Uses',feel:'Feel',history:'History',origin:'Source & geography',structure:'Structure & chemistry',process:'From source to yarn',performance:'Performance in use',identify:'Identification',labeling:'Labeling, law & standards',past:'Deeper history',facts:'Key figures',care:'Care',tradeoff:'Tradeoffs',types:'Types & grades',fabrics:'Fabrics & products',quality:'Buying guide',careGuide:'Care guide',impact:'Footprint',faq:'FAQ',notable:'Notable facts',pros:'Advantages',cons:'Drawbacks',timeline:'Timeline',production:'Production'};
let materialIndex;
function index(){return materialIndex??=createIndex(materials.map(m=>({...m,...(m.detail||{}),history:m.history,m,base:m.base?byId[m.base]?.name:'',facts:(m.detail?.facts||[]).map(f=>f.join(' ')),timeline:(m.data?.timeline||[]).map(t=>t.year+' '+t.event),production:m.data?.production?[m.data.production.figure,m.data.production.scope,m.data.production.countries].join(' '):'',...(m.guide?{types:m.guide.types,fabrics:m.guide.fabrics,quality:m.guide.quality,careGuide:m.guide.care,impact:m.guide.impact,faq:m.guide.faq.flat(),notable:m.guide.notable,pros:m.guide.pros,cons:m.guide.cons}:{})})),materialFields,{aliases:materialFieldAliases});}
// Ranked results with the fields each result matched, for snippets and explanations.
export function searchMaterials(q,filter=()=>true){return index().search(q,{filter:d=>filter(d.m)}).map(r=>({material:r.doc.m,score:r.score,matched:r.matched}));}
export function suggestMaterials(q){return index().suggest(q);}
export function materialSearch(m,q){return !String(q).trim()||searchMaterials(q,x=>x===m).length>0;}
export function getMaterials({q='',family='All materials',sort='featured',mapped=false}={}){
 const keep=m=>(family==='All materials'||m.family===family)&&(!mapped||networks[m.id]);
 let list=String(q).trim()?searchMaterials(q,keep).map(r=>r.material):materials.filter(keep);
 if(sort==='az')list.sort((a,b)=>a.name.localeCompare(b.name));
 if(sort==='za')list.sort((a,b)=>b.name.localeCompare(a.name));
 if(sort==='family')list.sort((a,b)=>a.family.localeCompare(b.family)||a.name.localeCompare(b.name));
 if(sort==='sources'){const n=m=>new Set([...m.sources,...(m.detail?.refs||[]).map(r=>r.url),...(m.guide?.refs||[]).map(r=>r.url)]).size;list.sort((a,b)=>n(b)-n(a)||a.name.localeCompare(b.name));}
 if(sort==='routes')list.sort((a,b)=>journeys.filter(j=>j.fiber===b.id).length-journeys.filter(j=>j.fiber===a.id).length||a.name.localeCompare(b.name));
 return list;
}
export function processNote(n,m){
 if(n.role==='Destination')return 'A possible market for finished textiles. The map does not identify a retailer or establish that a shipment reached this destination.';
 if(n.role==='Origin')return 'The model begins with '+m.name.toLowerCase()+' at this approximate location. Confirm the actual producer, collection method and material grade before treating an origin as traceable.';
 if(/scour|combing/i.test(n.sub))return 'Raw material is cleaned and prepared for yarn production. Washing removes contaminants; combing aligns longer fibers and removes shorter material in a worsted route.';
 if(/dehair/i.test(n.sub))return 'Fine undercoat is separated from coarse guard hairs. Clean yield and fiber length affect what can be spun into the next product.';
 if(/auction|consolidation|collection|market/i.test(n.sub))return 'Material may be sorted, aggregated and traded before further processing. Ask what records preserve the link between original lots and the outgoing product.';
 if(/spinning|knitting|weaving|yarn|fabric/i.test(n.sub))return 'Prepared fiber becomes yarn and then fabric, or arrives as an intermediate material for the next operation. Dyeing and finishing can occur at several points and are simplified in this model.';
 return 'This marker represents '+n.sub.toLowerCase()+'. The exact facility, process inputs, energy source and handling records would need to be established for a real supply chain.';
}
// Comparable property columns. Values are normalized to one unit per column so the table can sort;
// a value in an unexpected unit is shown as published but left out of numeric sorting.
export const propertyColumns=[
 {key:'density',label:'Density',unit:'g/cm3'},
 {key:'moisture_regain',label:'Moisture regain',unit:'%'},
 {key:'tenacity',label:'Tenacity',unit:'cN/tex'},
 {key:'elongation',label:'Elongation at break',unit:'%'},
 {key:'heat',label:'Melting or decomposition',unit:'C'},
 {key:'loi',label:'Limiting oxygen index',unit:'%'}
];
const UNIT_FACTORS={density:{'g/cm3':1,'g/cc':1,'kg/m3':.001},tenacity:{'cn/tex':1,'g/den':8.83,'g/denier':8.83,'gf/den':8.83,'n/tex':100},moisture_regain:{'%':1},elongation:{'%':1},heat:{'c':1,'degrees c':1},loi:{'%':1,'':1}};
function numbers(text){return [...String(text).replace(/,/g,'').matchAll(/-?\d+(?:\.\d+)?/g)].map(x=>Number(x[0]));}
// One comparable cell per column: the first matching property row, its midpoint in the column's unit, and its source.
export function propertyCell(m,col){
 const rows=m.data?.properties||[];const row=col.key==='heat'?rows.find(p=>p.key==='melting_point')||rows.find(p=>p.key==='decomposition'):rows.find(p=>p.key===col.key);
 if(!row)return null;const factor=UNIT_FACTORS[col.key]?.[row.unit.toLowerCase().trim()];const ns=numbers(row.value);
 const mid=factor!=null&&ns.length?(Math.min(...ns.slice(0,2))+Math.max(...ns.slice(0,2)))/2*factor:NaN;
 return {row,value:Number.isFinite(mid)?mid:NaN,normalized:factor!=null&&factor!==1,ref:m.data.refs[row.ref],kind:col.key==='heat'?(row.key==='melting_point'?'melts':'decomposes'):''};
}
