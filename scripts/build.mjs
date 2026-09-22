// Builds the static site into dist/: a small HTML shell with content-hashed JS and CSS assets, the
// JavaScript-free glossary pages, the sitemap, on-demand map geometry and an optional single-file
// offline copy (dist/offline.html). Build output is not committed; CI builds and deploys it.
import {build} from 'esbuild';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Script} from 'node:vm';
const hash=text=>createHash('sha256').update(text).digest('hex').slice(0,10);
const result=await build({entryPoints:['src/app.js'],bundle:true,write:false,format:'iife',target:['es2022'],minify:true,legalComments:'eof'});
const js=result.outputFiles[0].text;new Script(js);
const css=await fs.readFile('src/styles.css','utf8');
const template=await fs.readFile('src/index.html','utf8');
await fs.rm('dist',{recursive:true,force:true});
await fs.mkdir('dist/assets',{recursive:true});
const jsFile=`assets/app-${hash(js)}.js`,cssFile=`assets/styles-${hash(css)}.css`;
await fs.writeFile('dist/'+jsFile,js);await fs.writeFile('dist/'+cssFile,css);
const page=template.replace('<!--STYLE-->',()=>`<link rel="stylesheet" href="${cssFile}">`).replace('<!--SCRIPT-->',()=>`<script defer src="${jsFile}"></script>`);
await fs.writeFile('dist/index.html',page);
// Single-file copy for reading without a server: everything inlined, base map only.
const offline=template.replace('<!--STYLE-->',()=>'<style>'+css+'</style>').replace('<!--SCRIPT-->',()=>'<script>'+js.replaceAll('</script','<\\/script')+'</script>');
await fs.writeFile('dist/offline.html',offline);
// Detailed coastlines load on demand when the hosted globe is zoomed in.
await fs.mkdir('dist/geo',{recursive:true});
for(const name of ['countries-50m.json','countries-10m.json'])await fs.copyFile('node_modules/world-atlas/'+name,'dist/geo/'+name);
const kb=s=>Math.round(Buffer.byteLength(s)/1024)+' KB';
console.log(`Built dist/index.html (${kb(page)}), ${jsFile} (${kb(js)}), ${cssFile} (${kb(css)}) and dist/offline.html (${kb(offline)})`);
// Reading editions and sitemap share one canonical base.
const base=new URL(process.env.SITE_URL||'https://sharpmeow.github.io/FibersOfEarth/');
if(!['http:','https:'].includes(base.protocol)||base.search||base.hash)throw Error('SITE_URL must be an HTTP(S) site URL without a query or fragment');
if(!base.pathname.endsWith('/'))base.pathname+='/';
const {buildGlossary}=await import('./glossary-build.mjs'),{buildMaterials}=await import('./materials-build.mjs'),{reviewed}=await import('../src/glossary.js');
const paths=['',...await buildMaterials(cssFile,base),...await buildGlossary(cssFile,base)];
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
await fs.writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${esc(new URL(p,base).href)}</loc><lastmod>${reviewed}</lastmod></url>`).join('')}</urlset>`);
console.log(`Sitemap: ${paths.length} URLs for ${base.href}`);
