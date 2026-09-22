import {geoOrthographic,geoNaturalEarth1,geoPath,geoGraticule10,geoDistance} from 'd3-geo';
import {feature,mesh} from 'topojson-client';
import world from 'world-atlas/countries-110m.json' with {type:'json'};
const land=feature(world,world.objects.countries),borders=mesh(world,world.objects.countries,(a,b)=>a!==b);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class Globe{
 constructor(el,network,journey,onSelect){this.el=el;this.n=network;this.j=journey;this.onSelect=onSelect;this.rotation=[-65,-12,0];this.zoom=1;this.flat=false;this.all=false;this.auto=false;this.drag=null;this.raf=0;this.render();}
 render(){
  if(!this.el.isConnected)return;
  const w=700,h=590,r=235*this.zoom;
  const proj=this.flat?geoNaturalEarth1().fitExtent([[18,82],[682,500]],{type:'Sphere'}):geoOrthographic().translate([350,287]).scale(r).rotate(this.rotation).clipAngle(90);
  const path=geoPath(proj);const center=[-this.rotation[0],-this.rotation[1]];
  const visible=n=>this.flat||geoDistance(center,[n.lon,n.lat])<Math.PI/2-.025;
  const activeEdges=new Set(this.j.keys.slice(1).map((k,i)=>this.j.keys[i]+'|'+k));
  const edges=this.n.flows.filter(f=>this.all||activeEdges.has(f[0]+'|'+f[1]));
  const nodes=Object.values(this.n.nodes).filter(n=>(this.all||this.j.keys.includes(n.id))&&visible(n));
  const colors={Origin:'#245640',Processing:'#ab733d',Destination:'#547782'};
  let lineSVG=edges.map(([a,b,t])=>{const x=this.n.nodes[a],y=this.n.nodes[b];return `<path class="route-line ${activeEdges.has(a+'|'+b)?'active':''}" d="${path({type:'LineString',coordinates:[[x.lon,x.lat],[y.lon,y.lat]]})||''}" fill="none" stroke="${t===1?'#285942':t===2?'#ad773f':'#68888b'}" stroke-width="${activeEdges.has(a+'|'+b)?2:1}" opacity="${activeEdges.has(a+'|'+b)?.9:.3}"/>`;}).join('');
  const boxes=[];
  const dotSVG=nodes.sort((a,b)=>Number(this.j.keys.includes(b.id))-Number(this.j.keys.includes(a.id))).map(n=>{const [x,y]=proj([n.lon,n.lat]);const label=n.name;const left=x>510;const lx=left?x-12:x+12;const width=label.length*6.2+12;let ly=y-12;let box;let show=false;
   for(const off of [-12,24,-30,42]){ly=y+off;box={l:left?lx-width:lx,r:left?lx:lx+width,t:ly-12,b:ly+9};if(box.l>8&&box.r<692&&box.t>70&&box.b<515&&!boxes.some(b=>box.l<b.r+4&&box.r>b.l-4&&box.t<b.b+4&&box.b>b.t-4)){show=true;boxes.push(box);break;}}
   return `<g class="map-node" role="button" tabindex="0" aria-label="Explore ${esc(n.name)}, ${esc(n.sub)}" data-node="${esc(n.id)}"><title>${esc(n.name)} · ${esc(n.sub)}</title><circle cx="${x}" cy="${y}" r="15" fill="transparent"/><circle cx="${x}" cy="${y}" r="7" fill="${colors[n.role]}" fill-opacity=".13"/><circle cx="${x}" cy="${y}" r="3.3" fill="${colors[n.role]}" stroke="#fcfcf5" stroke-width="1.5"/>${show?`<text x="${lx}" y="${ly}" text-anchor="${left?'end':'start'}" class="city-label">${esc(n.name)}</text>`:''}</g>`;}).join('');
  this.el.innerHTML=`<svg class="globe-svg" viewBox="0 0 ${w} ${h}" role="group" aria-label="Interactive ${this.flat?'world map':'globe'} showing an illustrative fiber journey. Use rotate and zoom buttons or drag to explore."><defs><radialGradient id="ocean" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#f3f6ed"/><stop offset=".74" stop-color="#e8eee1"/><stop offset="1" stop-color="#d6dfcc"/></radialGradient><radialGradient id="shade" cx="35%" cy="28%" r="75%"><stop offset=".7" stop-color="#173f30" stop-opacity="0"/><stop offset="1" stop-color="#173f30" stop-opacity=".13"/></radialGradient><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter></defs>${!this.flat?`<ellipse cx="360" cy="536" rx="173" ry="13" fill="#536648" opacity=".12" filter="url(#shadow)"/><circle cx="350" cy="287" r="${r+15}" class="orbit"/><circle cx="350" cy="287" r="${r+27}" class="orbit outer"/>`:''}<path d="${path({type:'Sphere'})}" fill="url(#ocean)" stroke="#c5cfbc" stroke-width=".8"/><path d="${path(geoGraticule10())}" class="graticule"/><path d="${path(land)}" fill="#b7c9ac" stroke="#aabf9f" stroke-width=".35"/><path d="${path(borders)}" fill="none" stroke="#edf2e8" stroke-width=".55"/>${!this.flat?`<path d="${path({type:'Sphere'})}" fill="url(#shade)" pointer-events="none"/>`:''}${lineSVG}${dotSVG}<text class="ocean-label" x="350" y="566" text-anchor="middle">${this.flat?'THE WORLD, CONNECTED':'ONE PLANET. COUNTLESS THREADS.'}</text></svg>`;
  const svg=this.el.querySelector('svg');
  svg.addEventListener('pointerdown',e=>{if(e.target.closest('[data-node]')||this.flat)return;this.drag=[e.clientX,e.clientY,...this.rotation];svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');});
  svg.addEventListener('pointermove',e=>{if(!this.drag)return;const [x,y,a,b]=this.drag;this.rotation=[a+(e.clientX-x)*.28,Math.max(-80,Math.min(80,b-(e.clientY-y)*.28)),0];this.paintDrag();});
  const end=()=>{if(this.drag){this.drag=null;this.render();}};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  this.el.querySelectorAll('[data-node]').forEach(node=>{const select=()=>this.onSelect(this.n.nodes[node.dataset.node]);node.addEventListener('click',select);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});});
 }
 paintDrag(){ // Keep the captured SVG in place while its geometry changes.
  const p=geoOrthographic().translate([350,287]).scale(235*this.zoom).rotate(this.rotation).clipAngle(90),path=geoPath(p),svg=this.el.querySelector('svg');
  const paths=svg.querySelectorAll(':scope > path');
  paths[0].setAttribute('d',path({type:'Sphere'}));paths[1].setAttribute('d',path(geoGraticule10()));paths[2].setAttribute('d',path(land));paths[3].setAttribute('d',path(borders));
  const active=new Set(this.j.keys.slice(1).map((k,i)=>this.j.keys[i]+'|'+k));
  const edges=this.n.flows.filter(f=>this.all||active.has(f[0]+'|'+f[1]));svg.querySelectorAll('.route-line').forEach((el,i)=>{const [a,b]=edges[i];el.setAttribute('d',path({type:'LineString',coordinates:[[this.n.nodes[a].lon,this.n.nodes[a].lat],[this.n.nodes[b].lon,this.n.nodes[b].lat]]})||'');});
  svg.querySelectorAll('.map-node').forEach(el=>{const n=this.n.nodes[el.dataset.node];const point=p([n.lon,n.lat]);el.style.visibility=geoDistance([-this.rotation[0],-this.rotation[1]],[n.lon,n.lat])<Math.PI/2-.025?'visible':'hidden';const circles=el.querySelectorAll('circle');const dx=point[0]-Number(circles[0].getAttribute('cx')),dy=point[1]-Number(circles[0].getAttribute('cy'));el.setAttribute('transform',`translate(${dx} ${dy})`);});
 }
 rotate(amount){this.rotation[0]+=amount;this.render();}
 scale(amount){this.zoom=Math.max(.7,Math.min(1.35,this.zoom+amount));this.render();}
 reset(){this.rotation=[-65,-12,0];this.zoom=1;this.render();}
 focus(n){this.rotation=[-n.lon,-n.lat,0];this.render();}
 destroy(){cancelAnimationFrame(this.raf);}
}
