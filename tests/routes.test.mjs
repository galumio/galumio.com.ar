import {distRoot} from '../scripts/public-output.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root,loadCatalog,isPublicProduct} from '../scripts/catalog.mjs';
import {createServer} from '../scripts/serve.mjs';
const data=loadCatalog();
const legacy=['/astria/','/astria/privacidad/','/astria/soporte/','/biblia-viva/','/biblia-viva/privacidad/','/studio/','/studio/safari-baby/'];
const routes=['/','/tienda/','/apps-y-juegos/','/causelink/','/links/',...data.categories.map(c=>'/'+c.id+'/'),...data.products.filter(isPublicProduct).map(p=>'/productos/'+p.slug+'/'),...legacy];
const read=url=>fs.readFileSync(path.join(distRoot,url,'index.html'),'utf8');
function tags(html,name){return [...html.matchAll(new RegExp('<'+name+'\\b[^>]*>','g'))].map(m=>m[0]);}
function attr(tag,name){return tag.match(new RegExp('(?:^|\\s)'+name+'="([^"]*)"'))?.[1];}
test('todas las rutas tienen SEO, semántica y acceso al contenido',()=>{
 for(const url of routes){const html=read(url);assert.ok(html.startsWith('<!DOCTYPE html>'),url);assert.ok(/<html lang="es">/.test(html),url);assert.equal(tags(html,'h1').length,1,url);assert.ok(html.includes('rel="canonical" href="https://galumio.com.ar'+url+'"'),url);assert.ok(html.includes('name="description"'),url);assert.ok(html.includes('property="og:title"'),url);assert.ok(html.includes('href="#contenido"'),url);assert.ok(html.includes('id="contenido"'),url);assert.ok(!html.includes('Agregá aquí'),url);assert.ok(!html.includes('\x60\x60\x60'),url);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,url+' IDs duplicados');}
});
test('rutas, anclas, estilos, scripts e imágenes internas resuelven',()=>{
 for(const url of routes){const html=read(url);for(const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
   const value=m[1];if(/^(https?:|mailto:)/.test(value))continue;
   const target=new URL(value,'https://galumio.com.ar'+url);let file=path.join(distRoot,decodeURIComponent(target.pathname));
   assert.ok(fs.existsSync(file),url+' → '+value);if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');assert.ok(fs.existsSync(file),file);
   if(target.hash)assert.ok(fs.readFileSync(file,'utf8').includes('id="'+target.hash.slice(1)+'"'),url+' ancla '+value);
 }}
});
test('imágenes con alternativas, dimensiones y activos web pequeños',()=>{
 for(const url of routes){for(const tag of tags(read(url),'img')){
   assert.ok(attr(tag,'alt')?.trim(),url);assert.ok(Number(attr(tag,'width'))>0,url);assert.ok(Number(attr(tag,'height'))>0,url);
   const src=attr(tag,'src');assert.ok(fs.statSync(path.join(distRoot,src)).size<400000,src);
 }}
});
test('enlaces que abren pestañas protegen opener y avisan al lector',()=>{
 for(const url of routes){for(const tag of tags(read(url),'a')){if(attr(tag,'target')==='_blank')assert.ok(attr(tag,'rel')?.includes('noopener'),url);}}
});
test('se preservan secciones históricas y se agrega privacidad de Biblia Viva',()=>{
 for(const route of legacy){const original=fs.readFileSync(path.join(root,'templates/legacy',route,'index.html'),'utf8');for(const m of original.matchAll(/\bid="([^"]+)"/g))assert.ok(read(route).includes(m[0]),route+' '+m[0]);}
 assert.ok(read('/biblia-viva/').includes('href="/biblia-viva/privacidad/"'));
 for(const id of ['inicio','destacados','amazon','redes','contacto'])assert.ok(read('/').includes('id="'+id+'"'));
});
test('portada simplificada: cuatro compras y navegación por anclas',()=>{
 const html=read('/');
 assert.equal((html.match(/aria-label="Comprar /g)||[]).length,4);
 assert.ok(!/Astria|Biblia Viva/.test(html));
 for(const text of ['USD 5,90','USD 4,90','Novelas de Gael Beltra','Libros de Galumio Studio','https://www.instagram.com/galumiostudio/','https://ar.pinterest.com/galumiostudio/'])assert.ok(html.includes(text));
 for(const nav of html.matchAll(/<nav\b[^>]*>([\s\S]*?)<\/nav>/g))for(const link of nav[1].matchAll(/href="([^"]+)"/g))assert.ok(link[1].startsWith('#'));
 for(const asin of ['B0HPZLBH4D','B0HNDY9RVM','B0HP83C3NP','B0HBND5DYW','B0HMJJFK2V','B0HMJN3QQK','B0HN2LDBXD','B0HN2DZ2GV','B0HMJRKF8X','B0HNGSM89H'])assert.ok(html.includes('https://www.amazon.com/dp/'+asin));
});

test('sitemap incluye todas las rutas y no usa ofertas inventadas',()=>{
 const xml=fs.readFileSync(path.join(distRoot,'sitemap.xml'),'utf8');for(const route of routes)assert.ok(xml.includes('<loc>https://galumio.com.ar'+route+'</loc>'));
 for(const p of data.products.filter(isPublicProduct)){
  const html=read('/productos/'+p.slug+'/');
  const schema=JSON.parse(html.split('<script type="application/ld+json">')[1].split('</script>')[0]);
  const confirmed=p.offers.filter(o=>o.verification==='verified'&&o.price&&o.price.kind!=='reference');
  assert.equal((schema.offers||[]).length,confirmed.length,p.id);
  for(const offer of schema.offers||[]){const source=confirmed.find(o=>o.url===offer.url);assert.ok(source,p.id);assert.equal(offer.price,source.price.amount);assert.equal(offer.priceCurrency,source.price.currency);assert.equal(offer['@type'],'Offer');}
  assert.ok(!html.includes('"availability":'));
 }
});
test('servidor local: rutas HTTP, redirección, 404, HEAD y protección de archivos',async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const route of routes){const res=await fetch(base+route);assert.equal(res.status,200,route);assert.ok((await res.text()).includes('<h1'));}
  const redirect=await fetch(base+'/tienda',{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'/tienda/');
  assert.equal((await fetch(base+'/no-existe/')).status,404);
  assert.equal((await fetch(base+'/.git/config')).status,403);
  assert.equal((await fetch(base+'/templates/site.mjs')).status,404);
  assert.equal((await fetch(base+'/tienda/',{method:'HEAD'})).status,200);
  assert.equal((await fetch(base+'/tienda/',{method:'POST'})).status,405);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
