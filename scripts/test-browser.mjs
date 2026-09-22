import {spawn} from 'node:child_process';
const port=process.env.PORT||'4178';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:port},stdio:['ignore','pipe','inherit']});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('Preview server exited: '+code)));});
try{const child=spawn(process.execPath,['tests/browser.mjs'],{env:{...process.env,TEST_URL:'http://127.0.0.1:'+port+'/'},stdio:'inherit'});process.exitCode=await new Promise(resolve=>child.once('exit',resolve));}finally{server.kill();}
