import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {loadCatalog,isPublicProduct,root} from '../scripts/catalog.mjs';
import {distRoot} from '../scripts/public-output.mjs';

const data=loadCatalog();
const editions=[
 ['ia-cotidiana-para-adultos-mayores','IA cotidiana para adultos mayores','es','CHPS9','Y9fCO'],
 ['everyday-ai-for-seniors','Everyday AI for Seniors','en','Y9fCO','CHPS9']
];
const read=route=>fs.readFileSync(path.join(distRoot,route),'utf8');

test('ebooks para adultos mayores: ediciones únicas, formatos y enlaces sin intercambiar',()=>{
 for(const [id,title,language,code,other] of editions){
  const matches=data.products.filter(p=>p.id===id);assert.equal(matches.length,1);
  const p=matches[0];assert.ok(isPublicProduct(p));assert.equal(p.title,title);
  assert.equal(p.language,language);assert.equal(p.format,'PDF + EPUB');
  assert.equal(p.offers.length,1);const offer=p.offers[0];
  assert.equal(offer.platform,'payhip');assert.equal(offer.url,'https://payhip.com/b/'+code);
  assert.equal(data.products.filter(p=>p.offers.some(o=>o.url===offer.url)).length,1);
  assert.deepEqual(offer.price,{amount:4.99,currency:'USD',verifiedAt:'2026-10-22',kind:'listed',source:'owner-provided'});
  assert.equal(offer.verificationSource,'owner-provided');assert.equal(offer.httpCheckedAt,null);
  const html=read('productos/'+id+'/index.html');
  assert.ok(html.includes(title));assert.ok(html.includes('PDF + EPUB'));
  const buttons=[...html.matchAll(/<a\b([^>]*data-buy="[^"]+"[^>]*)>/g)];
  assert.equal(buttons.length,1);assert.ok(buttons[0][1].includes('href="'+offer.url+'"'));
  assert.ok(!html.includes('https://payhip.com/b/'+other));
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema.offers[0].price,4.99);assert.equal(schema.offers[0].priceCurrency,'USD');assert.equal(schema.offers[0].url,offer.url);
  for(const route of ['tienda/index.html','educacion-ia/index.html','sitemap.xml'])assert.ok(read(route).includes('/productos/'+id+'/'),route);
 }
 assert.equal(data.products.find(p=>p.id===editions[0][0]).group,data.products.find(p=>p.id===editions[1][0]).group);
});

test('portadas originales conservadas y copias web asociadas a cada edición',()=>{
 const hashes={
  'ia-cotidiana-para-adultos-mayores':'1ef0047a59da3566f16702841452469ce4324f13e73a36fe342dab503819f7dc',
  'everyday-ai-for-seniors':'0dcd10f9aebb8ade233cb0d52297e9bd6de41ddc640fb77f4f43bf58fcf4aec3'
 };
 for(const [id] of editions){
  const p=data.products.find(p=>p.id===id);
  assert.equal(p.image.original,`/assets/images/products/${id}/cover.jpg`);
  assert.equal(p.image.display,`/assets/images/products/${id}/cover-web.jpg`);
  assert.equal(p.image.width,800);assert.equal(p.image.height,1280);
  const original=fs.readFileSync(path.join(root,p.image.original));
  assert.equal(crypto.createHash('sha256').update(original).digest('hex'),hashes[id]);
  const web=fs.readFileSync(path.join(root,p.image.display));
  assert.ok(web.length<original.length);
  assert.deepEqual(fs.readFileSync(path.join(distRoot,p.image.display)),web);
  assert.ok(!fs.existsSync(path.join(distRoot,p.image.original)));
  for(const route of ['tienda/index.html','educacion-ia/index.html',`productos/${id}/index.html`]){
   assert.ok(read(route).includes(`src="${p.image.display}"`),route);
  }
  const html=read(`productos/${id}/index.html`);
  assert.ok(!html.includes('Portada pendiente'));
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema.image,'https://galumio.com.ar'+p.image.display);
 }
});
