import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from './serve.mjs';
import { loadCatalog, loadDrafts, validateDrafts } from './catalog.mjs';
import { layout, productPage, esc } from '../templates/site.mjs';
export function createReviewServer({drafts=loadDrafts()}={}){
 const data=loadCatalog();
 const errors=validateDrafts(drafts,data);if(errors.length)throw Error(errors.join('\n'));
 const server=createServer();const publicHandler=server.listeners('request')[0];server.removeAllListeners('request');
 server.on('request',(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const draft=drafts.find(p=>pathname==='/revision/'+p.slug+'/');
  if(!draft){publicHandler(req,res);return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
  const draftData={...data,categories:[...data.categories,{id:draft.category,title:draft.categoryTitle}],products:[]};
  const notice='<aside class="shell review-notice"><strong>Borrador privado · no publicado</strong><p>Contenido proporcionado por el propietario, pendiente de contraste con el original. La portada es un marcador de posición, no una imagen definitiva.</p><p>Archivo esperado: '+esc(draft.expectedImage)+'</p></aside>';
  const html=layout({title:draft.title,description:draft.description,url:pathname,image:null,noindex:true,body:notice+productPage(draft,draftData)}).replace(/<link rel="canonical"[^>]+>/,'').replace(/<meta property="og:url"[^>]+>/,'').replace('<a href="/educacion-estudio/">Educación y estudio</a>','<span>Educación y estudio</span>').replace(/<div class="share-row">[\s\S]*?<\/div><p class="share-status"[^>]*><\/p>/,'');
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});res.end(req.method==='HEAD'?undefined:html);
 });return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 createReviewServer().listen(4180,'127.0.0.1',()=>console.log('Revisión local: http://127.0.0.1:4180/tienda/ — borrador: http://127.0.0.1:4180/revision/como-estudiar-para-un-final/'));
}
