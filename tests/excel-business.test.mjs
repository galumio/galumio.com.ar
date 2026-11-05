import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {root,loadCatalog} from '../scripts/catalog.mjs';
import {distRoot} from '../scripts/public-output.mjs';
const data=loadCatalog();
const read=p=>fs.readFileSync(path.join(distRoot,p),'utf8');
test('Excel: conserva íntegros los diecisiete productos previos',()=>{
 const before=JSON.parse(fs.readFileSync(new URL('./fixtures/catalog-before-excel.json',import.meta.url)));
 assert.equal(data.products.length,before.length+2);
 for(const p of before)assert.deepEqual(data.products.find(x=>x.id===p.id),p);
});
test('Excel: fichas, requisitos, precios, botones, categoría y SEO',()=>{
 for(const [id,amount,etsy,payhip] of [['photography-job-payment-tracker',4.9,'4609675290','3FAqk'],['service-estimate-profit-manager',6.9,'4610518135','qg6cQ']]){
 const p=data.products.find(p=>p.id===id);assert.equal(p.category,'herramientas-para-negocios');assert.equal(p.language,'en');
 assert.equal(p.offers.length,2);assert.ok(p.offers[0].url.includes(etsy));assert.equal(p.offers[1].url,'https://payhip.com/b/'+payhip);
 for(const o of p.offers){assert.equal(o.price.amount,amount);assert.equal(o.price.currency,'USD');assert.equal(o.verificationSource,'owner-provided');}
 const html=read('productos/'+id+'/index.html');assert.match(html,/Requisitos y compatibilidad/);assert.match(html,/Excel de escritorio/);
 assert.equal([...html.matchAll(/data-buy=/g)].length,2);
 for(const o of p.offers)assert.ok(html.includes('href="'+o.url+'"'));
 for(const page of ['tienda/index.html','herramientas-para-negocios/index.html','sitemap.xml'])assert.ok(read(page).includes('/productos/'+id+'/'));
 assert.ok(html.includes('https://galumio.com.ar/productos/'+id+'/'));
 }
});
test('Excel: originales comerciales intactos y solo copias web en salida',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('./fixtures/excel-image-sources.json',import.meta.url)));
 for(const item of manifest){const p=data.products.find(p=>p.id===item.id);
 const original=fs.readFileSync(path.join(root,p.image.original));assert.equal(crypto.createHash('sha256').update(original).digest('hex'),item.sha256);
 assert.ok(!fs.existsSync(path.join(distRoot,p.image.original)));
 assert.deepEqual(fs.readFileSync(path.join(root,p.image.display)),fs.readFileSync(path.join(distRoot,p.image.display)));
 }
});

test('Excel: conserva categorías anteriores y texto UTF-8 sin corrupción',()=>{
 const before=JSON.parse(fs.readFileSync(new URL('./fixtures/categories-before-excel.json',import.meta.url)));
 assert.deepEqual(data.categories.filter(c=>c.id!=='herramientas-para-negocios'),before);
 for(const p of data.products.filter(p=>p.category==='herramientas-para-negocios')){
  assert.doesNotMatch(JSON.stringify(p),/\uFFFD|\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]/);
 }
});

test('Excel: 36 rutas coherentes y sin caracteres mal codificados en HTML',()=>{
 const htmlFiles=[];
 function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))htmlFiles.push(p);}}
 walk(distRoot);assert.equal(htmlFiles.length,37); // 36 páginas y 404.
 const sitemap=read('sitemap.xml');assert.equal([...sitemap.matchAll(/<loc>/g)].length,36);
 for(const file of htmlFiles)assert.doesNotMatch(fs.readFileSync(file,'utf8'),/\uFFFD|\u00C3[\u0080-\u00BF]|\u00C2[\u0080-\u00BF]/,file);
 for(const id of ['photography-job-payment-tracker','service-estimate-profit-manager']){
  const html=read('herramientas-para-negocios/index.html');assert.ok(html.includes('href="/productos/'+id+'/"'));
 }
});
