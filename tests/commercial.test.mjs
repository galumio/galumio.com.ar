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

const newPayhip=[
 ['safari-baby-cuentos-para-dormir-es','es','HJGdE'],
 ['safari-baby-bedtime-stories','en','KVDu2'],
 ['leo-luciernagas-es','es','rLfj8'],
 ['leo-fireflies-en','en','zqAP3'],
 ['safari-baby-activity-book',null,'cLazk'],
 ['safari-baby-12-animales',null,'5taEL']
];
test('seis enlaces Payhip nuevos respetan edición, evidencia y precios no informados',()=>{
 for(const [id,language,code] of newPayhip){
  const p=data.products.find(p=>p.id===id);assert.ok(p,id);assert.equal(p.language,language);
  assert.equal(p.publicationStatus,'published');assert.equal(p.publicationSource,'owner-confirmed-2026-10-08');
  const offer=p.offers.find(o=>o.platform==='payhip');
  assert.equal(offer.url,'https://payhip.com/b/'+code);assert.equal(offer.verification,'verified');
  assert.equal(offer.verificationSource,'owner-provided');assert.equal(offer.verifiedAt,'2026-10-08');
  assert.equal(offer.httpCheckedAt,null);assert.equal(offer.price,null);
 }
 assert.equal(data.products.flatMap(p=>p.offers).filter(o=>o.verification==='verified').length,14);
 const editions=data.products.filter(p=>p.group==='safari-baby-bedtime-stories');
 assert.deepEqual(editions.map(p=>p.language).sort(),['en','es']);
});
test('el pack confirmado de doce animales es único y conserva su ficha histórica',()=>{
 const packs=data.products.filter(p=>p.offers.some(o=>o.url==='https://payhip.com/b/5taEL'));
 assert.equal(packs.length,1);assert.equal(packs[0].id,'safari-baby-12-animales');
 assert.equal(packs[0].legacyPath,'/studio/safari-baby/#resources');
 assert.equal(data.products.filter(p=>p.category==='disenos-digitales').length,1);
 assert.equal(data.products.find(p=>p.id==='leo-bundle-bilingue').publicationStatus,'unknown');
});
test('nuevas fichas ofrecen solo Payhip y aparecen en tienda y categoría sin saturar links',()=>{
 const store=fs.readFileSync(path.join(distRoot,'tienda/index.html'),'utf8');
 const links=fs.readFileSync(path.join(distRoot,'links/index.html'),'utf8');
 assert.deepEqual(data.products.filter(p=>p.linksFeatured).map(p=>p.id),expected.map(p=>p[0]));
 for(const [id,,code] of newPayhip){
  const p=data.products.find(p=>p.id===id);
  const html=fs.readFileSync(path.join(distRoot,'productos',p.slug,'index.html'),'utf8');
  const buttons=[...html.matchAll(/<a\b([^>]*data-buy="[^"]+"[^>]*)>/g)];
  assert.equal(buttons.length,1,id);assert.ok(buttons[0][1].includes('data-buy="payhip"'));
  assert.ok(buttons[0][1].includes('href="https://payhip.com/b/'+code+'"'));
  const route='href="/productos/'+p.slug+'/"';assert.ok(store.includes(route),id);
  assert.ok(fs.readFileSync(path.join(distRoot,p.category,'index.html'),'utf8').includes(route),id);
  assert.equal(links.includes(route),false,id);
 }
});
