import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {loadCatalog,isPublicProduct,root} from '../scripts/catalog.mjs';
import {distRoot} from '../scripts/public-output.mjs';
const {products}=loadCatalog();
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const read=route=>fs.readFileSync(path.join(distRoot,route),'utf8');
const editions=[['ia-para-todos-los-dias','IA para el día a día','es','FmX4P','DvYKc','6a26d0232f6a3185a1e0180ca6b8dd88f6beb2e713e4da2b1c2e9ed7cf062ba2'],['everyday-ai','AI for Everyday Life','en','DvYKc','FmX4P','1934a1ac6ec321c2426c6db0e43152304538eac0e0905eb6f2a2460efaa19f32']];
test('everyday AI: conserva íntegros los quince productos previos',()=>{
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/pre-everyday-ai-hashes.json'),'utf8'));
 assert.equal(Object.keys(baseline).length,15);assert.equal(products.length,17);
 for(const [id,expected] of Object.entries(baseline))assert.equal(hash(JSON.stringify(products.find(p=>p.id===id))),expected,id);
 assert.equal(new Set(products.map(p=>p.id)).size,17);assert.equal(new Set(products.map(p=>p.slug)).size,17);
});
test('everyday AI: fichas independientes, precios centralizados y destinos exclusivos',()=>{
 for(const [id,title,language,code,other] of editions){
 const p=products.find(p=>p.id===id);assert.ok(isPublicProduct(p));assert.equal(p.title,title);assert.equal(p.slug,id);assert.equal(p.seo.title,title);assert.ok(p.image.alt.endsWith(title));assert.equal(p.language,language);assert.equal(p.format,null);assert.equal(p.category,'educacion-ia');
 assert.equal(p.offers.length,1);const o=p.offers[0];assert.equal(o.platform,'payhip');assert.equal(o.url,'https://payhip.com/b/'+code);assert.equal(o.price.amount,4.99);assert.equal(o.price.currency,'USD');
 assert.equal(products.filter(p=>p.offers.some(x=>x.url===o.url)).length,1);
 const html=read(`productos/${id}/index.html`);assert.ok(html.includes(title));assert.ok(html.includes(`<title>${title}`));assert.ok(html.includes(`property="og:title" content="${title}`));assert.ok(!html.includes('https://payhip.com/b/'+other));
 const buttons=[...html.matchAll(/<a\b([^>]*data-buy="[^"]+"[^>]*)>/g)];assert.equal(buttons.length,1);assert.ok(buttons[0][1].includes('href="'+o.url+'"'));
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(schema.offers[0].price,4.99);assert.equal(schema.offers[0].priceCurrency,'USD');assert.equal(schema.offers[0].url,o.url);
 for(const route of ['tienda/index.html','educacion-ia/index.html','sitemap.xml'])assert.ok(read(route).includes(`/productos/${id}/`),route);
 }
});
test('everyday AI: originales intactos y portadas web presentes en fichas y categorías',()=>{
 for(const [id,,,,,originalHash] of editions){
 const p=products.find(p=>p.id===id);const original=fs.readFileSync(path.join(root,p.image.original));assert.equal(hash(original),originalHash);
 const web=fs.readFileSync(path.join(root,p.image.display));assert.ok(web.length<original.length);assert.deepEqual(fs.readFileSync(path.join(distRoot,p.image.display)),web);
 assert.equal(p.image.width,800);assert.equal(p.image.height,1280);assert.ok(!fs.existsSync(path.join(distRoot,p.image.original)));
 for(const route of ['tienda/index.html','educacion-ia/index.html',`productos/${id}/index.html`])assert.ok(read(route).includes(`src="${p.image.display}"`),route);
 }
});
