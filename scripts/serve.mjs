import http from 'node:http';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const html=await fs.readFile(fileURLToPath(new URL('../dist/index.html',import.meta.url)));
const port=Number(process.env.PORT||4173);
http.createServer((req,res)=>{if(req.url.split('?')[0]!=='/'&&req.url.split('?')[0]!=='/index.html'){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');return;}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(html);}).listen(port,'127.0.0.1',()=>console.log('Fibers of Earth: http://127.0.0.1:'+port));
