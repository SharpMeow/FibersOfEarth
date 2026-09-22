import {geoOrthographic,geoNaturalEarth1,geoPath,geoGraticule10,geoDistance,geoInterpolate,geoRotation} from 'd3-geo';
import {feature,mesh} from 'topojson-client';
import world from 'world-atlas/countries-110m.json' with {type:'json'};
const land=feature(world,world.objects.countries),borders=mesh(world,world.objects.countries,(a,b)=>a!==b);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CX=350,CY=287,BASE=235,SAMPLES=56,SPIN=.004; // SPIN in degrees per millisecond: one turn in 90 seconds.
const stageColor=t=>t===1?'#285942':t===2?'#ad773f':'#68888b';
const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let instances=0;
// Route arcs are drawn in three dimensions: each great-circle sample is lifted above the sphere by a
// height that grows with the route's angular length, then projected orthographically. A lifted point
// is hidden only when it is behind the globe and inside its silhouette.
function arcGeometry(a,b,rotation,r){
 const from=[a.lon,a.lat],to=[b.lon,b.lat],interp=geoInterpolate(from,to),rot=geoRotation(rotation);
 const lift=Math.min(.32,.05+.24*geoDistance(from,to)/Math.PI);
 const pts=[];
 for(let i=0;i<=SAMPLES;i++){
  const t=i/SAMPLES,[l,p]=rot(interp(t)).map(v=>v*Math.PI/180),k=1+lift*Math.sin(Math.PI*t);
  const x=Math.cos(p)*Math.sin(l),y=Math.sin(p),z=Math.cos(p)*Math.cos(l);
  pts.push({x:CX+r*k*x,y:CY-r*k*y,visible:z>=0||k*k*(x*x+y*y)>1});
 }
 return pts;
}
function flatArc(proj,a,b){
 const [x0,y0]=proj([a.lon,a.lat]),[x1,y1]=proj([b.lon,b.lat]),len=Math.hypot(x1-x0,y1-y0),cx=(x0+x1)/2,cy=(y0+y1)/2-Math.min(90,.28*len);
 return Array.from({length:SAMPLES+1},(_,i)=>{const t=i/SAMPLES,u=1-t;return {x:u*u*x0+2*u*t*cx+t*t*x1,y:u*u*y0+2*u*t*cy+t*t*y1,visible:true};});
}
function toPath(pts){let d='',pen=false;for(const p of pts){if(!p.visible){pen=false;continue;}d+=(pen?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1);pen=true;}return d;}
// A chevron at the arc's visible midpoint points in the direction of travel, even without animation.
function chevron(pts){const i=SAMPLES/2;const a=pts[i-2],b=pts[i+2];if(!pts[i].visible||!a.visible||!b.visible)return null;return {x:pts[i].x,y:pts[i].y,angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};}
export class Globe{
 constructor(el,network,journey,onSelect,{spin=true}={}){this.el=el;this.n=network;this.j=journey;this.onSelect=onSelect;this.rotation=[-65,-12,0];this.zoom=1;this.flat=false;this.all=false;this.drag=null;this.hover=false;this.raf=0;this.spinning=false;this.uid='g'+(++instances);this.render();if(spin&&!reducedMotion())this.startSpin();}
 projection(){return this.flat?geoNaturalEarth1().fitExtent([[18,82],[682,500]],{type:'Sphere'}):geoOrthographic().translate([CX,CY]).scale(BASE*this.zoom).rotate(this.rotation).clipAngle(90);}
 edges(){const active=new Set(this.j.keys.slice(1).map((k,i)=>this.j.keys[i]+'|'+k));return this.n.flows.filter(f=>this.all||active.has(f[0]+'|'+f[1])).map(([a,b,t])=>({a,b,t,active:active.has(a+'|'+b),step:this.j.keys.indexOf(b)}));}
 arc(proj,e){const x=this.n.nodes[e.a],y=this.n.nodes[e.b];return this.flat?flatArc(proj,x,y):arcGeometry(x,y,this.rotation,BASE*this.zoom);}
 render(){
  if(!this.el.isConnected)return;
  const w=700,h=590,r=BASE*this.zoom,proj=this.projection(),path=geoPath(proj),center=[-this.rotation[0],-this.rotation[1]];
  const visible=n=>this.flat||geoDistance(center,[n.lon,n.lat])<Math.PI/2-.025;
  const nodes=Object.values(this.n.nodes).filter(n=>(this.all||this.j.keys.includes(n.id))&&visible(n));
  const colors={Origin:'#245640',Processing:'#ab733d',Destination:'#547782'},motion=!reducedMotion();
  const lineSVG=this.edges().map((e,i)=>{
   const x=this.n.nodes[e.a],y=this.n.nodes[e.b],pts=this.arc(proj,e),id=`${this.uid}-arc-${i}`,color=stageColor(e.t),mid=chevron(pts);
   const ground=path({type:'LineString',coordinates:[[x.lon,x.lat],[y.lon,y.lat]]})||'';
   return `<g class="route ${e.active?'active':''}" style="--route:${color}"><path class="route-shadow" d="${ground}"/><path id="${id}" class="route-line" d="${toPath(pts)}" fill="none" stroke="${color}" stroke-width="${e.active?2.2:1}" opacity="${e.active?.95:.35}"/>${e.active?`<path class="route-flow" d="${toPath(pts)}" style="animation-delay:${(-e.step*.45).toFixed(2)}s"/><path class="route-chevron" d="M-5 -4.5L3 0L-5 4.5" ${mid?`transform="translate(${mid.x.toFixed(1)} ${mid.y.toFixed(1)}) rotate(${mid.angle.toFixed(1)})"`:'visibility="hidden"'}/>${motion?`<g class="route-traveler"><circle r="6" class="traveler-glow"/><path d="M-4.5 -3.6L5 0L-4.5 3.6z"/><animateMotion dur="2.8s" begin="${(-e.step*.5).toFixed(2)}s" repeatCount="indefinite" rotate="auto" keyTimes="0;1" keySplines=".42 0 .58 1" calcMode="spline"><mpath href="#${id}"/></animateMotion></g>`:''}`:''}</g>`;}).join('');
  const boxes=[];
  const dotSVG=nodes.sort((a,b)=>Number(this.j.keys.includes(b.id))-Number(this.j.keys.includes(a.id))).map(n=>{const [x,y]=proj([n.lon,n.lat]);const label=n.name;const left=x>510;const lx=left?x-12:x+12;const width=label.length*6.2+12;let ly=y-12;let box;let show=false;
   for(const off of [-12,24,-30,42]){ly=y+off;box={l:left?lx-width:lx,r:left?lx:lx+width,t:ly-12,b:ly+9};if(box.l>8&&box.r<692&&box.t>70&&box.b<515&&!boxes.some(b=>box.l<b.r+4&&box.r>b.l-4&&box.t<b.b+4&&box.b>b.t-4)){show=true;boxes.push(box);break;}}
   return `<g class="map-node" role="button" tabindex="0" aria-label="Explore ${esc(n.name)}, ${esc(n.sub)}" data-node="${esc(n.id)}"><title>${esc(n.name)} · ${esc(n.sub)}</title><circle cx="${x}" cy="${y}" r="15" fill="transparent"/><circle cx="${x}" cy="${y}" r="7" fill="${colors[n.role]}" fill-opacity=".13"/><circle cx="${x}" cy="${y}" r="3.3" fill="${colors[n.role]}" stroke="#fcfcf5" stroke-width="1.5"/>${show?`<text x="${lx}" y="${ly}" text-anchor="${left?'end':'start'}" class="city-label">${esc(n.name)}</text>`:''}</g>`;}).join('');
  this.el.innerHTML=`<svg class="globe-svg" viewBox="0 0 ${w} ${h}" role="group" aria-label="Interactive ${this.flat?'world map':'globe'} showing an illustrative fiber journey. Raised arcs and moving arrows show the direction of travel from origin to destination. Use rotate and zoom buttons or drag to explore."><defs><radialGradient id="ocean" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#f3f6ed"/><stop offset=".74" stop-color="#e8eee1"/><stop offset="1" stop-color="#d6dfcc"/></radialGradient><radialGradient id="shade" cx="35%" cy="28%" r="75%"><stop offset=".7" stop-color="#173f30" stop-opacity="0"/><stop offset="1" stop-color="#173f30" stop-opacity=".13"/></radialGradient><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter></defs>${!this.flat?`<ellipse cx="360" cy="536" rx="173" ry="13" fill="#536648" opacity=".12" filter="url(#shadow)"/><circle cx="${CX}" cy="${CY}" r="${r+15}" class="orbit"/><circle cx="${CX}" cy="${CY}" r="${r+27}" class="orbit outer"/>`:''}<path class="sphere" d="${path({type:'Sphere'})}" fill="url(#ocean)" stroke="#c5cfbc" stroke-width=".8"/><path class="graticule" d="${path(geoGraticule10())}"/><path class="land" d="${path(land)}" fill="#b7c9ac" stroke="#aabf9f" stroke-width=".35"/><path class="borders" d="${path(borders)}" fill="none" stroke="#edf2e8" stroke-width=".55"/>${!this.flat?`<path class="terminator" d="${path({type:'Sphere'})}" fill="url(#shade)" pointer-events="none"/>`:''}${dotSVG}${lineSVG}<text class="ocean-label" x="350" y="566" text-anchor="middle">${this.flat?'THE WORLD, CONNECTED':'ONE PLANET. COUNTLESS THREADS.'}</text></svg>`;
  const svg=this.el.querySelector('svg');
  // Routes sit above the markers visually but must not block clicks on them.
  svg.querySelectorAll('.route').forEach(g=>g.setAttribute('pointer-events','none'));
  svg.addEventListener('pointerdown',e=>{if(e.target.closest('[data-node]')||this.flat)return;this.drag=[e.clientX,e.clientY,...this.rotation];svg.setPointerCapture(e.pointerId);svg.classList.add('dragging');});
  svg.addEventListener('pointermove',e=>{if(!this.drag)return;const [x,y,a,b]=this.drag;this.rotation=[a+(e.clientX-x)*.28,Math.max(-80,Math.min(80,b-(e.clientY-y)*.28)),0];this.paint();});
  const end=()=>{if(this.drag){this.drag=null;this.render();}};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  // Pause the spin while the pointer or keyboard focus is on the globe, so markers hold still to be chosen.
  svg.addEventListener('pointerenter',()=>{this.hover=true;});svg.addEventListener('pointerleave',()=>{this.hover=false;});
  svg.addEventListener('focusin',()=>{this.hover=true;});svg.addEventListener('focusout',()=>{this.hover=false;});
  this.el.querySelectorAll('[data-node]').forEach(node=>{const select=()=>this.onSelect(this.n.nodes[node.dataset.node]);node.addEventListener('click',select);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});});
 }
 paint(){ // Update geometry in place during drags and spin, keeping listeners and animations alive.
  const svg=this.el.querySelector('svg');if(!svg||this.flat)return;
  const p=this.projection(),path=geoPath(p),center=[-this.rotation[0],-this.rotation[1]];
  svg.querySelector('.sphere').setAttribute('d',path({type:'Sphere'}));svg.querySelector('.terminator')?.setAttribute('d',path({type:'Sphere'}));
  svg.querySelector('.graticule').setAttribute('d',path(geoGraticule10()));svg.querySelector('.land').setAttribute('d',path(land));svg.querySelector('.borders').setAttribute('d',path(borders));
  const routes=svg.querySelectorAll('.route');
  this.edges().forEach((e,i)=>{const g=routes[i];if(!g)return;const x=this.n.nodes[e.a],y=this.n.nodes[e.b],pts=this.arc(p,e),d=toPath(pts);
   g.querySelector('.route-shadow').setAttribute('d',path({type:'LineString',coordinates:[[x.lon,x.lat],[y.lon,y.lat]]})||'');g.querySelector('.route-line').setAttribute('d',d);g.querySelector('.route-flow')?.setAttribute('d',d);
   const c=g.querySelector('.route-chevron');if(c){const mid=chevron(pts);if(mid){c.setAttribute('transform',`translate(${mid.x.toFixed(1)} ${mid.y.toFixed(1)}) rotate(${mid.angle.toFixed(1)})`);c.removeAttribute('visibility');}else c.setAttribute('visibility','hidden');}
   const t=g.querySelector('.route-traveler');if(t)t.style.visibility=d?'visible':'hidden';});
  svg.querySelectorAll('.map-node').forEach(el=>{const n=this.n.nodes[el.dataset.node];const point=p([n.lon,n.lat]);el.style.visibility=geoDistance(center,[n.lon,n.lat])<Math.PI/2-.025?'visible':'hidden';const circles=el.querySelectorAll('circle');const dx=point[0]-Number(circles[0].getAttribute('cx')),dy=point[1]-Number(circles[0].getAttribute('cy'));el.setAttribute('transform',`translate(${dx} ${dy})`);});
 }
 paintDrag(){this.paint();}
 startSpin(){if(this.spinning)return;this.spinning=true;let last=performance.now();
  const tick=now=>{if(!this.spinning)return;if(!this.el.isConnected){this.spinning=false;return;}const dt=Math.min(64,now-last);last=now;if(!this.flat&&!this.drag&&!this.hover){this.rotation[0]+=dt*SPIN;this.paint();}this.raf=requestAnimationFrame(tick);};
  this.raf=requestAnimationFrame(tick);}
 stopSpin(){this.spinning=false;cancelAnimationFrame(this.raf);}
 toggleSpin(){if(this.spinning)this.stopSpin();else this.startSpin();return this.spinning;}
 rotate(amount){this.rotation[0]+=amount;this.render();}
 scale(amount){this.zoom=Math.max(.7,Math.min(1.35,this.zoom+amount));this.render();}
 reset(){this.rotation=[-65,-12,0];this.zoom=1;this.render();}
 focus(n){this.stopSpin();this.rotation=[-n.lon,-n.lat,0];this.render();}
 destroy(){this.stopSpin();}
}
