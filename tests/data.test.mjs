import test from 'node:test';
import assert from 'node:assert/strict';
import {materials,byId,networks,journeys,sources,getMaterials,distance,articles} from '../src/data.js';
import {diameterFromDenier} from '../src/science.js';
test('catalog has unique, complete entries with source references and histories',()=>{assert.equal(materials.length,100);assert.equal(new Set(materials.map(m=>m.id)).size,100);for(const m of materials){for(const f of ['name','family','composition','feel','uses','care','tradeoff','question','history'])assert.ok(m[f]?.length>0,`${m.id}: ${f}`);for(const s of m.sources)assert.ok(sources.some(x=>x.id===s),`${m.id}: ${s}`);if(m.brand)assert.ok(byId[m.base]);}});
test('every route follows its network, has valid coordinates and an origin and destination',()=>{assert.equal(journeys.length,115);assert.equal(new Set(journeys.map(j=>j.id)).size,journeys.length);for(const j of journeys){const n=networks[j.fiber];assert.equal(j.stops[0].role,'Origin');assert.equal(j.stops.at(-1).role,'Destination');assert.ok(j.km>0);for(const s of j.stops){assert.ok(Number.isFinite(s.lat)&&Math.abs(s.lat)<=90);assert.ok(Number.isFinite(s.lon)&&Math.abs(s.lon)<=180);assert.ok(s.country);}for(let i=1;i<j.keys.length;i++)assert.ok(n.flows.some(([a,b])=>a===j.keys[i-1]&&b===j.keys[i]));}});
test('search is accent-insensitive and aliases, filters and sorting compose',()=>{assert.ok(getMaterials({q:'vicuna'}).some(m=>m.id==='vicuna'));assert.ok(getMaterials({q:'pashmina'}).some(m=>m.id==='cashmere'));assert.ok(getMaterials({family:'Plant',q:'fiber'}).every(m=>m.family==='Plant'));const xs=getMaterials({sort:'az'});assert.deepEqual(xs.map(x=>x.name),[...xs].sort((a,b)=>a.name.localeCompare(b.name)).map(x=>x.name));assert.equal(getMaterials({q:'no-such-material-123'}).length,0);});
test('distance and filament dimensional model have independent reference values',()=>{assert.ok(Math.abs(distance({lat:0,lon:0},{lat:0,lon:90})-10007.543)<.01);assert.equal(distance({lat:20,lon:40},{lat:20,lon:40}),0);assert.ok(Math.abs(diameterFromDenier(5,1.38)-22.640)<.01);assert.ok(Math.abs(diameterFromDenier(20,1.38)/diameterFromDenier(5,1.38)-2)<1e-10);});
test('editorial cross references and public text are safe and coherent',()=>{for(const a of articles){for(const id of a.fibers)assert.ok(byId[id]);for(const s of a.sources)assert.ok(sources.some(x=>x.id===s));}const text=JSON.stringify({materials,journeys,sources,articles});assert.ok(!/\u2014/.test(text));assert.ok(sources.every(s=>new URL(s.url).protocol==='https:'));});

import {glossaryEntries,glossarySources,findTerms} from '../src/glossary.js';
import {glossary as originalTerms} from '../src/content.js';
test('glossary preserves terms, valid references, detailed content and composed search',()=>{
 assert.deepEqual(glossaryEntries.map(t=>t.term).sort(),Object.keys(originalTerms).sort());
 assert.equal(new Set(glossaryEntries.map(t=>t.id)).size,32);
 for(const t of glossaryEntries){assert.match(t.id,/^[a-z]+(?:-[a-z]+)*$/);for(const k of ['explanation','example','caution'])assert.ok(t[k].split(/\s+/).length>=25,t.term+' '+k);for(const s of t.sources)assert.equal(new URL(glossarySources[s].url).protocol,'https:');for(const name of t.related)assert.ok(glossaryEntries.some(x=>x.term===name));assert.ok(!/\u2014/.test(JSON.stringify(t)));}
 assert.ok(findTerms({q:'spandex'}).some(t=>t.id==='elastane'));
 assert.ok(findTerms({q:'cottonisation'}).some(t=>t.id==='cottonization'));
 assert.deepEqual(findTerms({category:'Measurements',letter:'D'}).map(t=>t.id),['denier']);
 assert.equal(findTerms({q:'<script>nothing'}).length,0);
});
