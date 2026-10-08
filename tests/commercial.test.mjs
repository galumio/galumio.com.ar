import {distRoot} from '../scripts/public-output.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root,loadCatalog,validateCatalog} from '../scripts/catalog.mjs';
import {purchaseLinks} from '../templates/site.mjs';
const data=loadCatalog();
const expected=[
 ['safari-baby-halloween-es','es',4.90,{etsy:'https://www.etsy.com/es/listing/4590685161/safari-baby-cuentos-de-halloween-7',payhip:'https://payhip.com/b/463o5'}],
 ['safari-baby-halloween-en','en',4.90,{etsy:'https://www.etsy.com/es/listing/4590656261/cuentos-de-halloween-para-bebes-en-la',payhip:'https://payhip.com/b/gRrV4'}],
 ['cuidar-alzheimer-demencia',null,7.90,{etsy:'https://www.etsy.com/es/listing/4590736319/cuidar-a-mama-o-papa-con-alzheimer-o',payhip:'https://payhip.com/b/O8QHv'}],
 ['ia-para-maestros','es',6.90,{payhip:'https://payhip.com/b/hPo6v'}],
 ['ai-for-teachers-en','en',6.90,{payhip:'https://payhip.com/b/jwF9l'}]
];
test('enlaces y precios del propietario corresponden a cada edición sin cruzar idiomas',()=>{
 for(const [id,language,amount,urls] of expected){
  const p=data.products.find(p=>p.id===id);assert.ok(p,id);assert.equal(p.language,language);
  assert.deepEqual(Object.fromEntries(p.offers.map(o=>[o.platform,o.url])),urls);
  for(const o of p.offers){assert.equal(o.verification,'verified');assert.equal(o.verificationSource,'owner-provided');assert.equal(o.verifiedAt,'2026-10-08');assert.equal(o.httpCheckedAt,null);assert.deepEqual(o.price,{amount,currency:'USD',verifiedAt:'2026-10-08',kind:'reference',source:'owner-provided'});}
 }
 assert.equal(data.products.find(p=>p.id==='ia-para-maestros').group,data.products.find(p=>p.id==='ai-for-teachers-en').group);
});
test('las fichas generadas muestran solo los botones comerciales autorizados',()=>{
 for(const [id,,,urls] of expected){
  const html=fs.readFileSync(path.join(distRoot,'productos',id,'index.html'),'utf8');
  const buttons=[...html.matchAll(/<a\b([^>]*data-buy="[^"]+"[^>]*)>/g)].map(m=>({url:m[1].match(/href="([^"]+)"/)[1],platform:m[1].match(/data-buy="([^"]+)"/)[1]}));
  assert.deepEqual(Object.fromEntries(buttons.map(b=>[b.platform,b.url])),urls,id);
  assert.ok(html.includes('Precio de referencia proporcionado por el propietario'));assert.ok(html.includes('USD'));
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema.offers,undefined,'Un precio de referencia no debe publicarse como precio final en JSON-LD');
 }
});
test('links destaca las cinco fichas antes de las categorías y conserva los otros destinos',()=>{
 const html=fs.readFileSync(path.join(distRoot,'links/index.html'),'utf8');const start=html.indexOf('aria-label="Destinos de Galumio"');const nav=html.slice(start,html.indexOf('</nav>',start));
 for(const [id] of expected){const index=nav.indexOf('href="/productos/'+id+'/"');assert.ok(index>=0);assert.ok(index<nav.indexOf('href="/libros-infantiles/"'));}
 for(const url of ['/tienda/','/studio/safari-baby/','/apps-y-juegos/'])assert.ok(nav.includes('href="'+url+'"'));
});
test('tiendas sin URL o sin evidencia no producen botones',()=>{
 const p=structuredClone(data.products[0]);p.offers[0].url=null;assert.equal(purchaseLinks(p).includes('data-buy="etsy"'),false);
 p.offers[1].verificationSource=undefined;assert.equal(purchaseLinks(p).includes('data-buy="payhip"'),false);
});
test('referencia y comprobación HTTP son datos separados y validados',()=>{
 const copy=structuredClone(data);copy.products[0].offers[0].httpCheckedAt='2026-02-30';assert.ok(validateCatalog(copy).some(e=>e.includes('HTTP')));
 const other=structuredClone(data);delete other.products[0].offers[0].price.source;assert.ok(validateCatalog(other).some(e=>e.includes('referencia')));
});
test('se conservan todos los productos y proyectos previos y la URL española de IA',()=>{
 for(const id of ['safari-baby-halloween-es','safari-baby-halloween-en','cuidar-alzheimer-demencia','ia-para-maestros','safari-baby-bedtime-stories','safari-baby-12-animales','safari-baby-activity-book','leo-luciernagas-es','leo-fireflies-en','leo-bundle-bilingue'])assert.ok(data.products.some(p=>p.id===id));
 for(const id of ['astria','biblia-viva','causelink','nexuscore','stack-overdrive','el-camino-ciego'])assert.ok(data.projects.some(p=>p.id===id));
 assert.equal(data.products.find(p=>p.id==='ia-para-maestros').slug,'ia-para-maestros');
});
