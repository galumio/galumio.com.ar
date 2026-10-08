import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { distRoot } from './public-output.mjs';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.gif':'image/gif','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
export function createServer({directory=distRoot}={}){
 const publicRoot=path.resolve(directory);
 return http.createServer(async(req,res)=>{
  const notFound=async()=>{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(req.method==='HEAD'?undefined:await fs.readFile(path.join(publicRoot,'404.html')).catch(()=>Buffer.from('Página no encontrada')));};
  try {
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
   const requestUrl=new URL(req.url,'http://localhost');
   const pathname=decodeURIComponent(requestUrl.pathname);
   if(pathname.split(/[\\/]/).some(p=>p.startsWith('.')) || pathname.includes('\\') || pathname.includes('\0')){res.writeHead(403);res.end('Acceso no permitido');return;}
   let target=path.resolve(publicRoot,'.'+pathname);
   if(target!==publicRoot && !target.startsWith(publicRoot+path.sep)){res.writeHead(403);res.end();return;}
   const stat=await fs.stat(target);
   if(stat.isDirectory()){
    if(!pathname.endsWith('/')){res.writeHead(301,{Location:pathname+'/'+requestUrl.search});res.end();return;}
    target=path.join(target,'index.html');
   }
   const realRoot=await fs.realpath(publicRoot);const realTarget=await fs.realpath(target);
   if(!realTarget.startsWith(realRoot+path.sep)){res.writeHead(403);res.end();return;}
   const body=await fs.readFile(target);
   res.writeHead(200,{'Content-Type':types[path.extname(target)]||'text/plain; charset=utf-8','Content-Length':body.length,'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:body);
  }catch{await notFound();}
 });
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try {await fs.access(path.join(distRoot,'index.html'));}
 catch {console.error('No existe dist/index.html. Ejecutá npm run build primero.');process.exit(1);}
 const port=Number(process.env.PORT||4173);
 createServer().listen(port,'127.0.0.1',()=>console.log('Galumio Studio desde dist/: http://127.0.0.1:'+port+' (Ctrl+C para detener)'));
}
