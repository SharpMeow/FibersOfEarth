import {geoOrthographic,geoNaturalEarth1,geoPath,geoGraticule,geoGraticule10,geoDistance,geoInterpolate,geoRotation,geoCentroid,geoBounds,geoArea} from 'd3-geo';
import {feature,mesh} from 'topojson-client';
import world from 'world-atlas/countries-110m.json' with {type:'json'};
// Level of detail rises with zoom: Natural Earth 1:110m for the whole globe (bundled, works offline), then
// 1:50m from 1.8x and 1:10m from 4x, fetched from the same site the first time they are needed. When they
// cannot load (for example when opened from a local file), the globe keeps the best detail it has.
// Detailed tiers draw only polygons whose bounding cap reaches the visible part of the globe.
const TIERS=[{zoom:0,topo:world},{zoom:1.8,url:'geo/countries-50m.json'},{zoom:4,url:'geo/countries-10m.json'}];
const loading=new Map();
function loadTier(i){const t=TIERS[i];if(t.topo)return Promise.resolve(true);if(t.failed)return Promise.resolve(false);
 if(!loading.has(i))loading.set(i,(typeof fetch==='function'&&typeof location!=='undefined'&&location.protocol!=='file:'?fetch(new URL(t.url,document.baseURI)).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}):Promise.reject(Error('offline file'))).then(j=>{t.topo=j;return true;}).catch(()=>{t.failed=true;return false;}));
 return loading.get(i);}
const loadedTier=i=>{while(i>0&&!TIERS[i].topo)i--;return i;};
const DETAIL_ZOOM=TIERS[1].zoom,cache=[];
// While dragging or swaying, lighter geometry keeps frames fast; 1:50m is used in motion only once the view is small.
const MOTION_DETAIL_ZOOM=8;
const tierFor=zoom=>TIERS.reduce((t,d,i)=>zoom>=d.zoom?i:t,0);
// Countries are split into single polygons for culling, so a far-flung territory does not force the whole
// country to be drawn; the largest polygon keeps the country name for labels.
function bounded(f,name){const c=geoCentroid(f),[[x0,y0],[x1,y1]]=geoBounds(f),x2=x1<x0?x1+360:x1;
 const wide=x2-x0>180,corners=[[x0,y0],[x2,y0],[x0,y1],[x2,y1],[(x0+x2)/2,y0],[(x0+x2)/2,y1],[x0,(y0+y1)/2],[x2,(y0+y1)/2]];
 return {f,c,name,radius:wide?Math.PI:Math.max(...corners.map(p=>geoDistance(c,p)))};}
function layer(i){
 if(cache[i])return cache[i];const w=TIERS[i].topo,o=w.objects.countries;
 const feats=feature(w,o).features.flatMap(f=>{const name=f.properties?.name||'';
  if(i===0)return [bounded(f,name)];
  const polys=f.geometry?.type==='MultiPolygon'?f.geometry.coordinates:f.geometry?.type==='Polygon'?[f.geometry.coordinates]:[];
  if(!polys.length)return [bounded(f,name)];
  // A ring stored with reversed winding reads as the whole sphere minus the island (a few 1:10m Maldives
  // islets do this), which floods the view with land color; such rings are turned back around.
  const parts=polys.map(poly=>{let g={type:'Polygon',coordinates:poly};if(geoArea(g)>2*Math.PI)g={type:'Polygon',coordinates:poly.map(ring=>[...ring].reverse())};return bounded({type:'Feature',properties:{},geometry:g},'');});
  parts.reduce((a,b)=>b.radius>a.radius&&b.radius<Math.PI?b:a).name=name;return parts;});
 return cache[i]={feats,borders:i===0?mesh(w,o,(a,b)=>a!==b):null};
}
// Angular radius of the globe that can appear in the panel at a given screen radius.
// The panel can be wider than the 700 by 590 viewBox, so clipping and culling cover a wider frame around it.
const CLIP=[[-360,-160],[1060,750]],VIEW_RADIUS=Math.hypot(710,455);
const visibleCap=R=>R<=VIEW_RADIUS?Math.PI/2:Math.asin(VIEW_RADIUS/R);
function geometry(i,center,R){const L=layer(i);if(i===0)return {land:{type:'FeatureCollection',features:L.feats.map(x=>x.f)},borders:L.borders,feats:L.feats};
 const cap=visibleCap(R),feats=L.feats.filter(x=>geoDistance(center,x.c)-x.radius<cap+.03);
 return {land:{type:'FeatureCollection',features:feats.map(x=>x.f)},borders:null,feats};}
// Finer grid lines as zoom rises, generated only for the visible patch so close zoom stays fast.
// Scale bar: a round distance whose length on screen at the globe's center falls between 60 and 140 px.
const EARTH_KM=6371;
function scaleBar(R){const kmPerPx=EARTH_KM/R;for(const mag of [1,10,100,1000,10000])for(const m of [1,2,5]){const km=m*mag,px=km/kmPerPx;if(px>=60&&px<=140)return {km,px};}return {km:1000,px:1000/kmPerPx};}
function graticuleFor(zoom,center){
 if(zoom<DETAIL_ZOOM)return geoGraticule10();
 const step=zoom>=8?1:5,cap=visibleCap(BASE*zoom)*180/Math.PI+step;
 if(cap>=80)return geoGraticule().step([step,step])();
 const [lon,lat]=center,dLon=Math.min(180,cap/Math.max(.1,Math.cos(Math.min(89,Math.abs(lat)+cap)*Math.PI/180)));
 const snap=v=>Math.floor(v/step)*step;
 return geoGraticule().step([step,step]).extent([[snap(lon-dLon),Math.max(-90,snap(lat-cap))],[snap(lon+dLon)+step,Math.min(90,snap(lat+cap)+step)]])();
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CX=350,CY=287,BASE=235,SAMPLES=56;
const ZOOM_MIN=.6,ZOOM_MAX=16,TRAVEL_MS=2800,MIN_ARC_PX=40; // Arcs shorter than MIN_ARC_PX on screen get no arrows.
const stageColor=t=>t===1?'#285942':t===2?'#ad773f':'#68888b';
// Motion is reduced when the operating system asks for it or the reader turns it off in Display settings.
const reducedMotion=()=>(typeof document!=='undefined'&&document.documentElement.classList.contains('a11y-still'))||(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
let instances=0;
// Route arcs are drawn in three dimensions: each great-circle sample is lifted above the sphere by a
// height that grows with the route's angular length, then projected orthographically. A lifted point
// is hidden only when it is behind the globe and inside its silhouette.
function arcGeometry(a,b,rotation,r,zoom=1){
 const from=[a.lon,a.lat],to=[b.lon,b.lat],interp=geoInterpolate(from,to),rot=geoRotation(rotation);
 const lift=Math.min(.32,.05+.24*geoDistance(from,to)/Math.PI)*Math.min(1,1.6/zoom);
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
// Screen length of the visible parts of an arc, used to skip arrows on arcs too small to read.
function visibleLength(pts){let len=0;for(let i=1;i<pts.length;i++)if(pts[i].visible&&pts[i-1].visible)len+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);return len;}
// Position and heading at fraction t along an arc, or null when that point is hidden behind the globe.
function pointAt(pts,t){const f=t*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),a=pts[i],b=pts[i+1];if(!a.visible||!b.visible)return null;const u=f-i;return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u,angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};}
// Home view for a journey: the center of the smallest spherical cap holding every stop (approximated by
// Badoiu-Clarkson iterations from the centroid), zoomed so every stop fits on the visible face. Minimizing
// the farthest stop's distance keeps wide routes, such as New Zealand to Europe, on one face of the globe.
function homeView(nodes){
 const r=Math.PI/180,unit=n=>[Math.cos(n.lat*r)*Math.cos(n.lon*r),Math.cos(n.lat*r)*Math.sin(n.lon*r),Math.sin(n.lat*r)];
 const norm=v=>{const l=Math.hypot(...v);return l<1e-9?null:v.map(x=>x/l);},angle=(a,b)=>Math.acos(Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2])));
 const pts=nodes.map(unit);let c=pts.length?norm(pts.reduce((a,b)=>a.map((x,i)=>x+b[i]))):null;
 if(!c)return {rotation:[-65,-12,0],zoom:1};
 for(let i=1;i<300;i++){const far=pts.reduce((best,p)=>angle(p,c)>angle(best,c)?p:best);c=norm(c.map((x,k)=>x+(far[k]-x)/(i+1)))||c;}
 const lon=Math.atan2(c[1],c[0])/r,lat=Math.asin(c[2])/r,spread=Math.max(...pts.map(p=>angle(p,c)));
 // Keep stops within about 190px of the center, never closer than 1.75x (so the idle sway keeps running),
 // never farther out than the default view.
 const zoom=Math.max(1,Math.min(1.75,190/(BASE*Math.sin(Math.min(Math.PI/2,Math.max(spread,.05))))));
 return {rotation:[-lon,Math.max(-70,Math.min(70,-lat)),0],zoom};
}
const SWAY_DEG=18,SWAY_MS=40000; // The idle motion sways around the route instead of carrying it out of view.
const ease=t=>t<.5?2*t*t:1-2*(1-t)*(1-t);
// Country names for large enough, front-facing countries, avoiding place labels already placed.
function countryLabels(feats,proj,center,R,boxes){
 const out=[];
 for(const x of [...feats].sort((a,b)=>b.radius-a.radius)){
  if(!x.name||R*Math.min(x.radius,.6)<55||geoDistance(center,x.c)>Math.PI/2-.2)continue;
  const p=proj(x.c);if(!p)continue;const [cx,cy]=p,half=x.name.length*3.4+6;
  const box={l:cx-half,r:cx+half,t:cy-9,b:cy+5};
  if(box.l<8||box.r>692||box.t<70||box.b>515||boxes.some(b=>box.l<b.r+6&&box.r>b.l-6&&box.t<b.b+6&&box.b>b.t-6))continue;
  boxes.push(box);out.push(`<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" class="country-label">${esc(x.name.toUpperCase())}</text>`);
 }
 return `<g class="country-labels" pointer-events="none">${out.join('')}</g>`;
}
function toPath(pts){let d='',pen=false;for(const p of pts){if(!p.visible){pen=false;continue;}d+=(pen?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1);pen=true;}return d;}
// A chevron at the arc's visible midpoint points in the direction of travel, even without animation.
function chevron(pts){const i=SAMPLES/2;const a=pts[i-2],b=pts[i+2];if(!pts[i].visible||!a.visible||!b.visible)return null;return {x:pts[i].x,y:pts[i].y,angle:Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI};}
export class Globe{
 constructor(el,network,journey,onSelect,{spin=true,onStatus=()=>{},onSpin=()=>{}}={}){this.el=el;this.onStatus=onStatus;this.onSpin=onSpin;this.pointers=new Map();this.n=network;this.j=journey;this.onSelect=onSelect;this.home=homeView(journey.keys.map(k=>network.nodes[k]).filter(Boolean));this.rotation=[...this.home.rotation];this.zoom=this.home.zoom;this.swayBase=this.rotation[0];this.swayT=0;this.flat=false;this.all=false;this.drag=null;this.hover=false;this.raf=0;this.spinning=false;this.arcs=[];this.uid='g'+(++instances);this.motion=!reducedMotion();this.render();if(spin&&this.motion)this.spinning=true;if(this.motion)this.startLoop();}
 projection(){return this.flat?geoNaturalEarth1().fitExtent([[18,82],[682,500]],{type:'Sphere'}):geoOrthographic().translate([CX,CY]).scale(BASE*this.zoom).rotate(this.rotation).clipAngle(90).clipExtent(CLIP);}
 edges(){const active=new Set(this.j.keys.slice(1).map((k,i)=>this.j.keys[i]+'|'+k));return this.n.flows.filter(f=>this.all||active.has(f[0]+'|'+f[1])).map(([a,b,t])=>({a,b,t,active:active.has(a+'|'+b),step:this.j.keys.indexOf(b)}));}
 arc(proj,e){const x=this.n.nodes[e.a],y=this.n.nodes[e.b];return this.flat?flatArc(proj,x,y):arcGeometry(x,y,this.rotation,BASE*this.zoom,this.zoom);}
 render(){
  if(!this.el.isConnected)return;
  const w=700,h=590,r=BASE*this.zoom,proj=this.projection(),path=geoPath(proj),center=[-this.rotation[0],-this.rotation[1]];
  const want=this.flat?0:tierFor(this.zoom),tier=loadedTier(want),geo=geometry(tier,center,r),detail=tier>0;
  if(tier<want)loadTier(want).then(ok=>{if(ok&&this.el.isConnected&&!this.flat&&tierFor(this.zoom)>=want)this.render();});
  const bar=scaleBar(r),stops=[...new Set(this.j.keys)].map(k=>this.n.nodes[k]).filter(Boolean);
  const summary=`Route: ${stops.map(n=>`${n.name}, ${n.country} (${n.role}${n.sub?', '+n.sub:''})`).join(', then ')}.`;
  const visible=n=>this.flat||geoDistance(center,[n.lon,n.lat])<Math.PI/2-.025;
  const nodes=Object.values(this.n.nodes).filter(n=>(this.all||this.j.keys.includes(n.id))&&visible(n));
  const colors={Origin:'#245640',Processing:'#ab733d',Destination:'#547782'};this.arcs=[];
  const lineSVG=this.edges().map((e,i)=>{
   const x=this.n.nodes[e.a],y=this.n.nodes[e.b],pts=this.arc(proj,e),color=stageColor(e.t),big=visibleLength(pts)>=MIN_ARC_PX,mid=big?chevron(pts):null,d=toPath(pts);this.arcs.push(pts);
   const ground=path({type:'LineString',coordinates:[[x.lon,x.lat],[y.lon,y.lat]]})||'';
   return `<g class="route ${e.active?'active':''}" style="--route:${color}"><path class="route-shadow" d="${ground}"/><path class="route-line" d="${d}" fill="none" stroke="${color}" stroke-width="${e.active?2.2:1}" opacity="${e.active?.95:.35}"/>${e.active?`<path class="route-flow" d="${big?d:''}" style="animation-delay:${(-e.step*.45).toFixed(2)}s"/><path class="route-chevron" d="M-5 -4.5L3 0L-5 4.5" ${mid?`transform="translate(${mid.x.toFixed(1)} ${mid.y.toFixed(1)}) rotate(${mid.angle.toFixed(1)})"`:'visibility="hidden"'}/>${this.motion?`<g class="route-traveler" data-step="${e.step}" visibility="hidden"><circle r="6" class="traveler-glow"/><path d="M-4.5 -3.6L5 0L-4.5 3.6z"/></g>`:''}`:''}</g>`;}).join('');
  const boxes=[];
  const dotSVG=nodes.sort((a,b)=>Number(this.j.keys.includes(b.id))-Number(this.j.keys.includes(a.id))).map(n=>{const [x,y]=proj([n.lon,n.lat]);const label=n.name;const left=x>510;const lx=left?x-12:x+12;const width=label.length*6.2+12;let ly=y-12;let box;let show=false;
   for(const off of [-12,24,-30,42]){ly=y+off;box={l:left?lx-width:lx,r:left?lx:lx+width,t:ly-12,b:ly+9};if(box.l>8&&box.r<692&&box.t>70&&box.b<515&&!boxes.some(b=>box.l<b.r+4&&box.r>b.l-4&&box.t<b.b+4&&box.b>b.t-4)){show=true;boxes.push(box);break;}}
   return `<g class="map-node" role="button" tabindex="0" aria-label="Explore ${esc(n.name)}, ${esc(n.sub)}" data-node="${esc(n.id)}"><title>${esc(n.name)} · ${esc(n.sub)}</title><circle cx="${x}" cy="${y}" r="15" fill="transparent"/><circle cx="${x}" cy="${y}" r="7" fill="${colors[n.role]}" fill-opacity=".13"/><circle cx="${x}" cy="${y}" r="3.3" fill="${colors[n.role]}" stroke="#fcfcf5" stroke-width="1.5"/>${show?`<text x="${lx}" y="${ly}" text-anchor="${left?'end':'start'}" class="city-label">${esc(n.name)}${!this.flat&&this.zoom>=DETAIL_ZOOM&&n.sub?`<tspan class="city-sub" x="${lx}" dy="12">${esc(n.sub)}</tspan>`:''}</text>`:''}</g>`;}).join('');
  this.el.innerHTML=`<svg class="globe-svg" viewBox="0 0 ${w} ${h}" role="application" tabindex="0" aria-roledescription="${this.flat?'world map':'globe'}" aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - 0 P" aria-label="${esc(`Interactive ${this.flat?'world map':'globe'} of an illustrative fiber journey. ${summary} Arrow keys rotate, plus and minus zoom, 0 resets, P pauses motion.`)}"><defs><radialGradient id="ocean" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#f3f6ed"/><stop offset=".74" stop-color="#e8eee1"/><stop offset="1" stop-color="#d6dfcc"/></radialGradient><radialGradient id="shade" cx="35%" cy="28%" r="75%"><stop offset=".7" stop-color="#173f30" stop-opacity="0"/><stop offset="1" stop-color="#173f30" stop-opacity=".13"/></radialGradient><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter></defs>${!this.flat?`<ellipse cx="360" cy="536" rx="173" ry="13" fill="#536648" opacity=".12" filter="url(#shadow)"/>${this.zoom<=1.2?`<circle cx="${CX}" cy="${CY}" r="${r+15}" class="orbit"/><circle cx="${CX}" cy="${CY}" r="${r+27}" class="orbit outer"/>`:''}`:''}<path class="sphere" d="${path({type:'Sphere'})}" fill="url(#ocean)" stroke="#c5cfbc" stroke-width=".8"/><path class="graticule" d="${path(this.flat?geoGraticule10():graticuleFor(this.zoom,center))}"/><path class="land" d="${path(geo.land)}" fill="#b7c9ac" stroke="${detail?'#edf2e8':'#aabf9f'}" stroke-width="${detail?.6:.35}"/><path class="borders" d="${geo.borders?path(geo.borders):''}" fill="none" stroke="#edf2e8" stroke-width=".55"/>${detail?countryLabels(geo.feats,proj,center,r,boxes):''}${!this.flat?`<path class="terminator" d="${path({type:'Sphere'})}" fill="url(#shade)" pointer-events="none"/>`:''}${dotSVG}${lineSVG}${this.flat?'':`<g class="scale-bar" aria-hidden="true" transform="translate(24 548)"><path d="M0 -5V0H${bar.px.toFixed(1)}V-5"/><text x="0" y="-9">${bar.km.toLocaleString('en-US')} km</text></g>`}<text class="ocean-label" x="350" y="566" text-anchor="middle">${this.flat?'THE WORLD, CONNECTED':'ONE PLANET. COUNTLESS THREADS.'}</text></svg>`;
  const svg=this.el.querySelector('svg');
  // Routes sit above the markers visually but must not block clicks on them.
  svg.querySelectorAll('.route').forEach(g=>g.setAttribute('pointer-events','none'));
  // One pointer drags to rotate; two pointers pinch to zoom around their midpoint.
  const local=(x,y)=>{const m=svg.getScreenCTM();if(!m)return [CX,CY];const pt=svg.createSVGPoint();pt.x=x;pt.y=y;const q=pt.matrixTransform(m.inverse());return [q.x,q.y];};
  svg.addEventListener('pointerdown',e=>{if(e.target.closest('[data-node]')||this.flat)return;e.preventDefault();this.pointers.set(e.pointerId,[e.clientX,e.clientY]);svg.setPointerCapture(e.pointerId);
   if(this.pointers.size===2){const [a,b]=[...this.pointers.values()];this.drag=null;this.pinch={dist:Math.hypot(a[0]-b[0],a[1]-b[1])||1,zoom:this.zoom};}
   else{this.drag=[e.clientX,e.clientY,...this.rotation];svg.classList.add('dragging');}});
  svg.addEventListener('pointermove',e=>{if(!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,[e.clientX,e.clientY]);
   if(this.pinch&&this.pointers.size===2){const [a,b]=[...this.pointers.values()];const mid=local((a[0]+b[0])/2,(a[1]+b[1])/2);this.zoomAt(this.pinch.zoom*Math.hypot(a[0]-b[0],a[1]-b[1])/this.pinch.dist,mid,true);return;}
   if(!this.drag)return;const [x,y,a,b]=this.drag;const k=.28/this.zoom;this.rotation=[a+(e.clientX-x)*k,Math.max(-80,Math.min(80,b-(e.clientY-y)*k)),0];this.paint();});
  // The scroll wheel zooms toward the pointer; at the zoom limits the page scrolls as usual. Double-click zooms in.
  svg.addEventListener('wheel',e=>{if(this.flat)return;const dir=Math.sign(e.deltaY);if((dir<0&&this.zoom>=ZOOM_MAX)||(dir>0&&this.zoom<=ZOOM_MIN))return;e.preventDefault();
   const dy=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*400:e.deltaY;this.zoomAt(this.zoom*Math.exp(-Math.max(-120,Math.min(120,dy))*.0018),local(e.clientX,e.clientY),true);},{passive:false});
  svg.addEventListener('dblclick',e=>{if(this.flat||e.target.closest('[data-node]'))return;e.preventDefault();this.zoomAt(this.zoom*(e.shiftKey?.6:1.6),local(e.clientX,e.clientY));});
  const end=e=>{this.pointers.delete(e.pointerId);if(this.pinch&&this.pointers.size<2){this.pinch=null;this.drag=null;this.anchor();this.render();this.status();return;}if(this.drag){this.drag=null;this.anchor();this.render();}};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
  svg.addEventListener('keydown',e=>{if(e.target!==svg||e.altKey||e.ctrlKey||e.metaKey)return;const step=12/Math.sqrt(this.zoom);let handled=true;
   switch(e.key){case 'ArrowLeft':this.rotate(step);break;case 'ArrowRight':this.rotate(-step);break;case 'ArrowUp':this.tilt(-step);break;case 'ArrowDown':this.tilt(step);break;
    case '+':case '=':this.scale(1);break;case '-':case '_':this.scale(-1);break;case '0':case 'Home':this.reset();break;case 'p':case 'P':this.toggleSpin();this.onSpin(this.spinning);break;default:handled=false;}
   if(handled){e.preventDefault();this.status();this.el.querySelector('svg')?.focus({preventScroll:true});}});
  // Pause the spin while the pointer or keyboard focus is on the globe, so markers hold still to be chosen.
  svg.addEventListener('pointerenter',()=>{this.hover=true;});svg.addEventListener('pointerleave',()=>{this.hover=false;});
  svg.addEventListener('focusin',()=>{this.hover=true;});svg.addEventListener('focusout',()=>{this.hover=false;});
  this.el.querySelectorAll('[data-node]').forEach(node=>{const select=()=>this.onSelect(this.n.nodes[node.dataset.node]);node.addEventListener('click',select);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});});
 }
 paint(){ // Update geometry in place during drags and spin, keeping listeners and animations alive.
  const svg=this.el.querySelector('svg');if(!svg||this.flat)return;
  const p=this.projection(),path=geoPath(p),center=[-this.rotation[0],-this.rotation[1]];
  svg.querySelector('.sphere').setAttribute('d',path({type:'Sphere'}));svg.querySelector('.terminator')?.setAttribute('d',path({type:'Sphere'}));
  svg.querySelector('.graticule').setAttribute('d',path(this.zoom>=MOTION_DETAIL_ZOOM?graticuleFor(this.zoom,center):geoGraticule10()));const g=geometry(this.zoom>=MOTION_DETAIL_ZOOM?loadedTier(1):0,center,BASE*this.zoom);svg.querySelector('.land').setAttribute('d',path(g.land));svg.querySelector('.borders').setAttribute('d',g.borders?path(g.borders):'');svg.querySelector('.country-labels')?.setAttribute('visibility','hidden');
  const sb=svg.querySelector('.scale-bar');if(sb){const bar=scaleBar(BASE*this.zoom);sb.querySelector('path').setAttribute('d',`M0 -5V0H${bar.px.toFixed(1)}V-5`);sb.querySelector('text').textContent=bar.km.toLocaleString('en-US')+' km';}
  svg.querySelectorAll('.orbit').forEach((o,i)=>o.setAttribute('r',BASE*this.zoom+(i?27:15)));
  const routes=svg.querySelectorAll('.route');
  this.arcs=[];
  this.edges().forEach((e,i)=>{const g=routes[i];if(!g)return;const x=this.n.nodes[e.a],y=this.n.nodes[e.b],pts=this.arc(p,e),d=toPath(pts),big=visibleLength(pts)>=MIN_ARC_PX;this.arcs.push(pts);
   g.querySelector('.route-shadow').setAttribute('d',path({type:'LineString',coordinates:[[x.lon,x.lat],[y.lon,y.lat]]})||'');g.querySelector('.route-line').setAttribute('d',d);g.querySelector('.route-flow')?.setAttribute('d',big?d:'');
   const c=g.querySelector('.route-chevron');if(c){const mid=big&&chevron(pts);if(mid){c.setAttribute('transform',`translate(${mid.x.toFixed(1)} ${mid.y.toFixed(1)}) rotate(${mid.angle.toFixed(1)})`);c.removeAttribute('visibility');}else c.setAttribute('visibility','hidden');}});
  svg.querySelectorAll('.map-node').forEach(el=>{const n=this.n.nodes[el.dataset.node];const point=p([n.lon,n.lat]);el.style.visibility=geoDistance(center,[n.lon,n.lat])<Math.PI/2-.025?'visible':'hidden';const circles=el.querySelectorAll('circle');const dx=point[0]-Number(circles[0].getAttribute('cx')),dy=point[1]-Number(circles[0].getAttribute('cy'));el.setAttribute('transform',`translate(${dx} ${dy})`);});
 }
 paintDrag(){this.paint();}
 // One animation loop drives the slow spin and the traveling arrows. Each arrow is placed on the arc's
 // current geometry every frame and hidden when its point is behind the globe or the arc is too short.
 startLoop(){if(this.looping)return;this.looping=true;let last=performance.now();
  const tick=now=>{if(!this.el.isConnected||!this.looping){this.looping=false;return;}const dt=Math.min(64,now-last);last=now;
   if(this.spinning&&!this.flat&&!this.drag&&!this.hover&&this.zoom<DETAIL_ZOOM){this.swayT+=dt;this.rotation[0]=this.swayBase+SWAY_DEG*Math.sin(this.swayT*2*Math.PI/SWAY_MS);this.paint();}
   this.moveTravelers(now);this.raf=requestAnimationFrame(tick);};
  this.raf=requestAnimationFrame(tick);}
 moveTravelers(now){const svg=this.el.querySelector('svg');if(!svg)return;const routes=svg.querySelectorAll('.route');
  routes.forEach((g,i)=>{const t=g.querySelector('.route-traveler');if(!t)return;const pts=this.arcs[i];
   const at=pts&&visibleLength(pts)>=MIN_ARC_PX?pointAt(pts,ease(((now/TRAVEL_MS)+Number(t.dataset.step)*.18)%1)):null;
   if(!at){t.setAttribute('visibility','hidden');return;}t.setAttribute('transform',`translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) rotate(${at.angle.toFixed(1)})`);t.removeAttribute('visibility');});}
 startSpin(){this.spinning=true;this.startLoop();}
 stopSpin(){this.spinning=false;}
 toggleSpin(){if(this.spinning)this.stopSpin();else this.startSpin();return this.spinning;}
 setZoom(z){this.zoom=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,z));this.render();}
 // Zoom keeping the geographic point under (x, y) in view space fixed; light repaints while a gesture runs,
 // then one detailed render once it settles.
 zoomAt(z,[x,y],live=false){if(this.flat)return;z=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,z));const before=this.projection().invert([x,y]);this.zoom=z;
  if(before&&Number.isFinite(before[0]))for(let k=0;k<3;k++){const after=this.projection().invert([x,y]);if(!after||!Number.isFinite(after[0]))break;this.rotation=[this.rotation[0]+(after[0]-before[0]),Math.max(-80,Math.min(80,this.rotation[1]+(after[1]-before[1]))),0];}
  this.anchor();if(!live){this.render();this.status();return;}
  this.paint();clearTimeout(this.settle);this.settle=setTimeout(()=>{this.render();this.status();},180);}
 tilt(amount){this.rotation[1]=Math.max(-80,Math.min(80,this.rotation[1]+amount));this.render();}
 // A short, human-readable description of the current view for the live region.
 status(){const [lon,lat]=[-this.rotation[0],-this.rotation[1]],ew=((lon%360)+540)%360-180,fmt=(v,p,n)=>`${Math.abs(v).toFixed(0)} degrees ${v>=0?p:n}`;
  this.onStatus(this.flat?'World map view.':`Zoom ${this.zoom.toFixed(1)} times, centered near ${fmt(lat,'north','south')}, ${fmt(ew,'east','west')}.`);}
 anchor(){this.swayBase=this.rotation[0];this.swayT=0;}
 rotate(amount){this.rotation[0]+=amount;this.anchor();this.render();}
 scale(amount){this.setZoom(this.zoom*(amount>0?1.35:1/1.35));this.status();}
 reset(){this.rotation=[...this.home.rotation];this.zoom=this.home.zoom;this.anchor();this.render();this.status();}
 focus(n){this.stopSpin();this.rotation=[-n.lon,-n.lat,0];this.anchor();this.render();}
 destroy(){this.stopSpin();this.looping=false;cancelAnimationFrame(this.raf);}
}
