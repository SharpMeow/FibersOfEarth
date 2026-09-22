import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{try{let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name.endsWith('/'))name+='index.html';const target=path.resolve(root,'.'+name);if(!target.startsWith(root)||!['.html','.xml'].includes(path.extname(target)))throw Error('Not found');const body=await fs.readFile(target);res.writeHead(200,{'Content-Type':target.endsWith('.xml')?'application/xml; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log('Fibers of Earth: http://127.0.0.1:'+port));
