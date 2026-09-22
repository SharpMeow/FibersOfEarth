// JavaScript-free reading edition of every material profile: one indexable page per entry with the full
// reader guide, research layer, history, labeling notes, references and citation, plus a materials index.
import fs from 'node:fs/promises';
import {materials,byId,journeys,sources,families} from '../src/data.js';
import {glossaryEntries,reviewed} from '../src/glossary.js';
import {linkTerms,emphasize,escapeHTML as e} from '../src/glossary-render.js';
import {scienceFor} from '../src/science.js';
export async function buildMaterials(cssFile,base){
 const url=p=>new URL(p,base).href;
 const json=x=>JSON.stringify(x).replaceAll('<','\\u003c');
 function page({name,description,path,body,schema,depth}){const home=depth?'../../':'../';return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(name)} | Fibers of Earth</title><meta name="description" content="${e(description)}"><link rel="canonical" href="${e(url(path))}"><meta property="og:type" content="article"><meta property="og:site_name" content="Fibers of Earth"><meta property="og:title" content="${e(name)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${e(url(path))}"><meta name="twitter:card" content="summary"><link rel="stylesheet" href="${home}${cssFile}"><script type="application/ld+json">${json(schema)}</script></head><body><a class="skip" href="#main">Skip to content</a><header><nav class="glossary-static-nav" aria-label="Main navigation"><a href="${home}index.html">Fibers of Earth</a><a href="${depth?'../index.html':'index.html'}">Materials</a><a href="${home}glossary/index.html">Textile glossary</a><a href="${home}index.html#/science">Science lab</a></nav></header><main id="main" class="page ${depth?'glossary-article material-article':''}">${body}</main><footer class="site-footer"><p>Fibers of Earth · An independent field guide by Chaos.</p><a href="${home}index.html#/sources">Sources & method</a></footer></body></html>`;}
 const files=new Map(),paths=['materials/'];
 const termLink=id=>'../../glossary/'+id+'/';
 for(const m of materials){
  const d=m.detail||{},g=m.guide,path='materials/'+m.id+'/',used=new Set();
  const p=text=>text?`<p>${linkTerms(emphasize(e(text)),termLink,used)}</p>`:'';
  const sec=(id,heading,html)=>html?`<section id="${id}"><h2>${heading}</h2>${html}</section>`:'';
  const list=items=>items?.length?`<ul>${items.map(x=>`<li>${linkTerms(e(x),termLink,used)}</li>`).join('')}</ul>`:'';
  const refs=[...m.sources.map(id=>sources.find(s=>s.id===id)).filter(Boolean).map(s=>({title:s.name+': '+s.title,url:s.url})),...(d.refs||[]),...(g?.refs||[])].filter((r,i,a)=>a.findIndex(x=>x.url===r.url)===i);
  const routes=journeys.filter(j=>j.fiber===m.id);
  const sci=scienceFor(m.brand?byId[m.base]:m);
  const description=`${m.name}: ${m.tagline} Types, fabrics, buying and care guide, structure and chemistry, history, labeling law and sources.`.slice(0,300);
  const body=`<nav class="breadcrumb" aria-label="Breadcrumb"><a href="../index.html">Materials</a><span> / ${e(m.name)}</span></nav><div class="eyebrow">${e(m.family)}${m.brand?' · '+e(m.type):''}</div><h1>${e(m.name)}</h1><p class="definition-lead">${e(m.tagline)}</p>
<p class="muted">Reviewed ${reviewed}. Evidence level: ${e(d.evidence||'editorial')}. <a href="../../index.html#/fiber/${m.id}">Open the interactive profile${routes.length?' and route map':''}</a>.</p>
<div class="reading">
${d.facts?.length?`<section class="fact-box key-figures"><h2>Key figures</h2><dl class="card-facts">${d.facts.map(([k,v])=>`<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join('')}</dl><p class="muted">Approximate values under the stated conditions.</p></section>`:''}
<nav class="toc" aria-label="On this page"><h2>On this page</h2><ol>${[['overview','Overview'],g&&['types','Types, grades and fabrics'],g&&['buying','Buying and care'],['science','Science'],['history','History'],['law','Labeling and law'],g?.faq?.length&&['faq','Frequently asked'],['sources','Sources']].filter(Boolean).map(([id,t])=>`<li><a href="#${id}">${t}</a></li>`).join('')}</ol></nav>
${sec('overview','Overview',`${p(m.composition)}<h3>Feel and behavior</h3>${p(m.feel)}<h3>Where you find it</h3>${p(m.uses)}${d.origin?`<h3>Source and geography</h3>${p(d.origin)}`:''}${g?`<div class="pros-cons"><section><h3>Advantages</h3>${list(g.pros)}</section><section><h3>Drawbacks</h3>${list(g.cons)}</section></div>${g.notable?.length?`<h3>Worth knowing</h3>${list(g.notable)}`:''}`:''}`)}
${g?sec('types','Types, grades and fabrics',`<h3>Types and grades</h3>${p(g.types)}<h3>Fabrics and products</h3>${p(g.fabrics)}`):''}
${g?sec('buying','Buying and care',`<h3>How to judge quality</h3>${p(g.quality)}<h3>Care in detail</h3>${p(g.care)}<h3>Care at a glance</h3>${p(m.care)}<h3>Environmental and social footprint</h3>${p(g.impact)}<h3>Tradeoffs</h3>${p(m.tradeoff)}<p><strong>A useful question to ask:</strong> ${e(m.question)}</p>`):''}
${sec('science','Science',`<h3>${e(sci[0])}</h3>${p(sci[1])}${d.structure?`<h3>Structure and chemistry</h3>${p(d.structure)}`:''}${d.process?`<h3>From source to yarn</h3>${p(d.process)}`:''}${d.performance?`<h3>Performance in use</h3>${p(d.performance)}`:''}${d.identify?`<h3>How it is identified</h3>${p(d.identify)}`:''}`)}
${sec('history','History',`${p(m.history)}${d.past?`<h3>The deeper record</h3>${p(d.past)}`:''}`)}
${sec('law','Labeling and law',`${p(d.labeling)}<p class="muted">This describes what rules and standards cover. It is not legal advice; jurisdiction, product form and current rule text control.</p>`)}
${g?.faq?.length?sec('faq','Frequently asked',g.faq.map(([q,a])=>`<h3>${e(q)}</h3>${p(a)}`).join('')):''}
${sec('sources','Sources',`<ul class="source-links">${refs.map(r=>`<li><a href="${e(r.url)}" rel="noopener noreferrer">${e(r.title)}</a></li>`).join('')}</ul><h3>Cite this page</h3><p class="cite-text">Chaos. (2026). ${e(m.name)}. In Fibers of Earth: An independent textile atlas. ${e(url(path))}</p>`)}
</div>`;
  const schema={'@context':'https://schema.org','@graph':[{'@type':'Article','@id':url(path)+'#article',headline:m.name,description,url:url(path),dateModified:reviewed,inLanguage:'en',about:{'@type':'Thing',name:m.name,alternateName:m.aliases?m.aliases.split(' '):undefined},author:{'@type':'Person',name:'Chaos'},publisher:{'@type':'Organization',name:'Fibers of Earth'},citation:refs.slice(0,20).map(r=>r.url)},
   ...(g?.faq?.length?[{'@type':'FAQPage','@id':url(path)+'#faq',mainEntity:g.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}]:[]),
   {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Materials',item:url('materials/')},{'@type':'ListItem',position:2,name:m.name,item:url(path)}]}]};
  files.set(path+'index.html',page({name:`${m.name}: types, fabrics, care, science and history`,description,path,body,schema,depth:1}));paths.push(path);
 }
 const groups=families.filter(f=>f!=='All materials').map(f=>[f,materials.filter(m=>(f==='Brands & technologies'?m.brand:m.family===f&&!m.brand)).sort((a,b)=>a.name.localeCompare(b.name))]).filter(([,l])=>l.length);
 files.set('materials/index.html',page({name:'Textile materials: fibers, fabrics and technologies',description:`In-depth guides to ${materials.length} textile fibers, materials and branded technologies: types, fabrics, buying and care, science, history and labeling law, with sources.`,path:'materials/',depth:0,
  schema:{'@context':'https://schema.org','@type':'CollectionPage',name:'Fibers of Earth materials',url:url('materials/'),hasPart:materials.map(m=>({'@type':'Article',headline:m.name,url:url('materials/'+m.id+'/')}))},
  body:`<div class="page-intro"><div class="eyebrow">THE MATERIAL LIBRARY</div><h1>Textile materials.</h1><p>In-depth guides to ${materials.length} fibers, materials and branded technologies. Each covers types and fabrics, how to buy and care for it, its science and history, labeling law and sources.</p><a href="../index.html#/materials">Search and filter in the interactive library ↗</a></div><nav class="family-chips" aria-label="Jump to family">${groups.map(([f])=>`<a class="chip" href="#${f.toLowerCase().replace(/[^a-z]+/g,'-')}">${e(f)}</a>`).join('')}</nav>${groups.map(([f,l])=>`<section id="${f.toLowerCase().replace(/[^a-z]+/g,'-')}"><h2>${e(f)}</h2><ul class="glossary-static-list">${l.map(m=>`<li><h3><a href="${m.id}/index.html">${e(m.name)}</a></h3><p>${e(m.tagline)}</p></li>`).join('')}</ul></section>`).join('')}`}));
 for(const [path,html] of files){await fs.mkdir('dist/'+path.slice(0,path.lastIndexOf('/')),{recursive:true});await fs.writeFile('dist/'+path,html);}
 console.log(`Built ${files.size} readable material pages`);
 return paths;
}
