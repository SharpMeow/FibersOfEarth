import {build} from 'esbuild';
import fs from 'node:fs/promises';
import {Script} from 'node:vm';
const result=await build({entryPoints:['src/app.js'],bundle:true,write:false,format:'iife',target:['es2022'],minify:true,legalComments:'eof'});
const css=await fs.readFile('src/styles.css','utf8');
let html=await fs.readFile('src/index.html','utf8');
html=html.replace('<!--STYLE-->',()=>'<style>'+css+'</style>').replace('<!--SCRIPT-->',()=>'<script>'+result.outputFiles[0].text.replaceAll('</script','<\\/script')+'</script>');
new Script(html.match(/<script>([\s\S]*)<\/script>/)[1]);
await fs.mkdir('dist',{recursive:true});await fs.writeFile('dist/index.html',html);await fs.writeFile('index.html',html);
// Detailed coastlines load on demand when the hosted globe is zoomed in; the bundle keeps 1:110m for offline use.
await fs.mkdir('dist/geo',{recursive:true});
for(const name of ['countries-50m.json','countries-10m.json'])await fs.copyFile('node_modules/world-atlas/'+name,'dist/geo/'+name);
console.log('Built dist/index.html, offline-capable core ('+Math.round(Buffer.byteLength(html)/1024)+' KB)');
const {buildGlossary}=await import('./glossary-build.mjs');
await buildGlossary(css);
