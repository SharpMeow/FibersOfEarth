import test from 'node:test';
import assert from 'node:assert/strict';
import {materials,byId,networks,journeys,sources,getMaterials,distance,articles} from '../src/data.js';
import {diameterFromDenier} from '../src/science.js';
test('catalog has unique, complete entries with source references and histories',()=>{assert.equal(materials.length,100);assert.equal(new Set(materials.map(m=>m.id)).size,100);for(const m of materials){for(const f of ['name','family','composition','feel','uses','care','tradeoff','question','history'])assert.ok(m[f]?.length>0,`${m.id}: ${f}`);for(const s of m.sources)assert.ok(sources.some(x=>x.id===s),`${m.id}: ${s}`);if(m.brand)assert.ok(byId[m.base]);}});
test('every route follows its network, has valid coordinates and an origin and destination',()=>{assert.equal(journeys.length,115);assert.equal(new Set(journeys.map(j=>j.id)).size,journeys.length);for(const j of journeys){const n=networks[j.fiber];assert.equal(j.stops[0].role,'Origin');assert.equal(j.stops.at(-1).role,'Destination');assert.ok(j.km>0);for(const s of j.stops){assert.ok(Number.isFinite(s.lat)&&Math.abs(s.lat)<=90);assert.ok(Number.isFinite(s.lon)&&Math.abs(s.lon)<=180);assert.ok(s.country);}for(let i=1;i<j.keys.length;i++)assert.ok(n.flows.some(([a,b])=>a===j.keys[i-1]&&b===j.keys[i]));}});
test('search is accent-insensitive and aliases, filters and sorting compose',()=>{assert.ok(getMaterials({q:'vicuna'}).some(m=>m.id==='vicuna'));assert.ok(getMaterials({q:'pashmina'}).some(m=>m.id==='cashmere'));assert.ok(getMaterials({family:'Plant',q:'fiber'}).every(m=>m.family==='Plant'));const xs=getMaterials({sort:'az'});assert.deepEqual(xs.map(x=>x.name),[...xs].sort((a,b)=>a.name.localeCompare(b.name)).map(x=>x.name));assert.equal(getMaterials({q:'no-such-material-123'}).length,0);});
test('distance and filament dimensional model have independent reference values',()=>{assert.ok(Math.abs(distance({lat:0,lon:0},{lat:0,lon:90})-10007.543)<.01);assert.equal(distance({lat:20,lon:40},{lat:20,lon:40}),0);assert.ok(Math.abs(diameterFromDenier(5,1.38)-22.640)<.01);assert.ok(Math.abs(diameterFromDenier(20,1.38)/diameterFromDenier(5,1.38)-2)<1e-10);});
test('editorial cross references and public text are safe and coherent',()=>{for(const a of articles){for(const id of a.fibers)assert.ok(byId[id]);for(const s of a.sources)assert.ok(sources.some(x=>x.id===s));}const text=JSON.stringify({materials,journeys,sources,articles});assert.ok(!/\u2014/.test(text));assert.ok(sources.every(s=>new URL(s.url).protocol==='https:'));});

import {glossaryEntries,glossarySources,findTerms,searchTerms,suggestTerms} from '../src/glossary.js';
import {termRefs,linkTerms} from '../src/glossary-render.js';
import {glossary as originalTerms} from '../src/content.js';
import {searchMaterials,suggestMaterials} from '../src/data.js';
import {toTex,fromTex,toGsm,fromGsm} from '../src/science.js';
import {editDistance,parseQuery,tokenize} from '../src/search.js';
const words=s=>String(s).split(/\s+/).filter(Boolean).length;
const noDash=x=>!/[–—]/.test(JSON.stringify(x));
test('glossary preserves terms, valid references, detailed content and composed search',()=>{
 for(const term of Object.keys(originalTerms))assert.ok(glossaryEntries.some(t=>t.term===term),term);
 assert.ok(glossaryEntries.length>=90);
 assert.equal(new Set(glossaryEntries.map(t=>t.id)).size,glossaryEntries.length);
 for(const t of glossaryEntries){assert.match(t.id,/^[a-z]+(?:-[a-z]+)*$/);assert.ok(words(t.definition)>=5,t.term+' definition');for(const k of ['explanation','example','caution'])assert.ok(words(t[k])>=25,t.term+' '+k);for(const k of ['deeper','origins'])assert.ok(words(t[k])>=30,t.term+' '+k);assert.ok(termRefs(t).length>=2,t.term+' refs');for(const r of termRefs(t))assert.equal(new URL(r.url).protocol,'https:');assert.ok(t.related.length>=2,t.term+' related');for(const name of t.related)assert.ok(glossaryEntries.some(x=>x.term===name));assert.ok(noDash(t),t.term+' dash');}
 for(const s of Object.values(glossarySources))assert.equal(new URL(s.url).protocol,'https:');
 assert.equal(findTerms({q:'spandex'})[0].id,'elastane');
 assert.equal(findTerms({q:'cottonisation'})[0].id,'cottonization');
 const md=findTerms({category:'Measurements',letter:'D'});assert.ok(md.some(t=>t.id==='denier'));assert.ok(md.every(t=>t.category==='Measurements'&&t.term[0]==='D'));
 assert.equal(findTerms({q:'<script>nothing'}).length,0);
 assert.equal(findTerms({q:'denier'})[0].id,'denier');
 assert.equal(suggestTerms('dennier'),'denier');
});
test('every catalog entry has a complete, sourced research profile',()=>{
 for(const m of materials){const d=m.detail;assert.ok(d,m.id+' detail');for(const k of ['origin','structure','process','performance','identify','labeling','past'])assert.ok(words(d[k])>=30,`${m.id}: ${k}`);assert.ok(Array.isArray(d.facts)&&d.facts.length>=2,m.id+' facts');for(const f of d.facts)assert.ok(f.length===2&&f[0]&&f[1],m.id+' fact');assert.ok(d.refs.length>=1,m.id+' refs');for(const r of d.refs){assert.ok(r.title);assert.equal(new URL(r.url).protocol,'https:');}assert.ok(['verified','editorial'].includes(d.evidence),m.id+' evidence');assert.ok(noDash(d),m.id+' dash');}
});
test('ranked search tolerates typos and spelling variants and supports phrases, exclusions and fields',()=>{
 assert.equal(editDistance('cashmer','cashmere'),1);assert.equal(editDistance('ab','ba'),1);assert.equal(editDistance('wool','silk',1),2);
 assert.deepEqual(tokenize('Colour of the fibres'),['color','fiber']);
 assert.deepEqual(parseQuery('"artificial silk" -muga family:plant',{family:'family'}),{terms:[],phrases:[['artificial','silk']],exclude:[['muga']],fields:[{field:'family',term:'plant'}]});
 assert.equal(searchMaterials('cashmer')[0].material.id,'cashmere');
 assert.equal(searchMaterials('sillk')[0].material.id,'silk');
 assert.equal(searchMaterials('kevlar')[0].material.id,'kevlar');
 assert.ok(searchMaterials('silk -muga').every(r=>r.material.id!=='muga-silk'));
 assert.ok(searchMaterials('family:plant rope').every(r=>r.material.family==='Plant'));
 const phrase=searchMaterials('"artificial silk"');assert.ok(phrase.length>0);
 const top=searchMaterials('wool')[0];assert.ok(top.matched.name||top.matched.aliases);
 assert.equal(suggestMaterials('polyestr'),'polyester');
 assert.ok(searchMaterials('law:cites').every(r=>/cites/i.test(r.material.detail.labeling)));
 assert.ok(getMaterials({q:'fibre'}).length===getMaterials({q:'fiber'}).length);
});
test('unit converters match exact reference conversions',()=>{
 assert.ok(Math.abs(fromTex(toTex(30,'ne'),'tex')-19.6847)<1e-3);
 assert.ok(Math.abs(fromTex(toTex(150,'denier'),'dtex')-166.667)<1e-3);
 assert.ok(Math.abs(fromTex(toTex(50,'nm'),'tex')-20)<1e-9);
 assert.ok(Math.abs(toGsm(1,'oz')-33.9057)<1e-3);assert.ok(Math.abs(toGsm(1,'momme')-4.33994)<1e-4);
 for(const u of ['tex','dtex','denier','nm','ne'])assert.ok(Math.abs(fromTex(toTex(7.3,u),u)-7.3)<1e-9);
 assert.ok(Number.isNaN(toTex(0,'tex'))&&Number.isNaN(toGsm(-1,'oz')));
});
test('glossary auto-links escape safely and link each term once',()=>{
 assert.ok(!linkTerms('keratin intermediate filaments').includes('glossary/filament'));assert.ok(linkTerms('a continuous filament').includes('term-link'));
 const html=linkTerms('Carding &amp; carding precede combing.');assert.equal((html.match(/term-link/g)||[]).length,2);assert.ok(html.includes('&amp;'));
});
