import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCatalog,validateCatalog,root,verifiedOffer} from '../scripts/catalog.mjs';
import {purchaseLinks,productCard,layout} from '../templates/site.mjs';
const source=loadCatalog();
const mutate=fn=>{const copy=structuredClone(source);fn(copy);return validateCatalog(copy);};
test('catálogo real válido con productos y proyectos solicitados',()=>{
 assert.deepEqual(validateCatalog(source),[]);
 for(const id of ['safari-baby-halloween-es','safari-baby-halloween-en','cuidar-alzheimer-demencia','ia-para-maestros','safari-baby-bedtime-stories','safari-baby-12-animales'])assert.ok(source.products.some(p=>p.id===id));
 for(const id of ['astria','biblia-viva','causelink','nexuscore','stack-overdrive','el-camino-ciego'])assert.ok(source.projects.some(p=>p.id===id));
});
test('rechaza IDs y slugs duplicados',()=>{assert.ok(mutate(d=>d.products.push(d.products[0])).some(e=>e.includes('duplicado')));});
test('rechaza categorías inexistentes y estados inventados',()=>{assert.ok(mutate(d=>d.products[0].category='fantasma').length);assert.ok(mutate(d=>d.projects[0].status='published').length);});
test('publicación necesita fuente; enlace verificado necesita fecha y URL',()=>{
 assert.ok(mutate(d=>d.products[0].publicationSource='pending').length);
 assert.ok(mutate(d=>{d.products[0].offers[0].verification='verified';d.products[0].offers[0].url=null;}).length);
 assert.ok(mutate(d=>d.products[0].offers[0].verifiedAt=null).length);
 assert.ok(mutate(d=>delete d.products[0].offers[0].verificationSource).length);
});
test('rechaza hosts ajenos, javascript, http, credenciales y falsos subdominios',()=>{
 for(const url of ['javascript:alert(1)','http://etsy.com/listing/1','https://etsy.com.evil.test/listing/1','https://evil.test/','https://user:pass@etsy.com/listing/1','#'])assert.ok(mutate(d=>d.products[0].offers[0].url=url).length,url);
});
test('no admite precio sin verificación, moneda o importe válidos',()=>{
 for(const price of [{amount:0,currency:'USD'},{amount:-1,currency:'USD',verifiedAt:'2026-10-08'},{amount:4.9,currency:'???',verifiedAt:'2026-10-08'}])assert.ok(mutate(d=>d.products[0].offers[0].price=price).length);
});
test('imágenes originales deben existir y tener alternativa y dimensiones',()=>{
 assert.ok(mutate(d=>d.products.find(p=>p.image).image.original='/missing.jpg').length);
 assert.ok(mutate(d=>d.products.find(p=>p.image).image.alt='').length);
 assert.ok(mutate(d=>d.products.find(p=>p.image).image.width=0).length);
});
test('pendientes no producen enlaces de compra ni precios ficticios',()=>{
 for(const original of source.products){const p=structuredClone(original);p.offers.forEach(o=>{o.verification='pending';o.verifiedAt=null;o.price=null;});const html=purchaseLinks(p);assert.ok(!html.includes('data-buy='));assert.ok(!html.includes('href="#"'));assert.ok(!html.includes('Gratis'));}
});
test('Etsy, Payhip y Amazon verificados pueden generar botones',()=>{
 for(const [platform,url] of [['etsy','https://www.etsy.com/listing/123'],['payhip','https://payhip.com/b/test'],['amazon','https://www.amazon.com/dp/TEST']]){
  const d=structuredClone(source);d.products[0].offers=[{platform,url,verification:'verified',verificationSource:'owner-provided',verifiedAt:'2026-10-08',price:null}];
  assert.deepEqual(validateCatalog(d),[]);assert.ok(purchaseLinks(d.products[0]).includes('data-buy="'+platform+'"'));
 }
});
test('contenido del catálogo se escapa al generar HTML',()=>{
 const p=structuredClone(source.products[0]);p.title='<img src=x onerror=alert(1)>';const html=productCard(p,source.categories);assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img src=x'));
 const doc=layout({title:'test',description:'test',url:'/',body:'',schema:{name:'</script><script>alert(1)</script>'}});assert.ok(!doc.includes('</script><script>alert(1)'));
});
test('CNAME y activos originales se conservan',()=>{
 assert.equal(fs.readFileSync(path.join(root,'CNAME'),'utf8').trim(),'galumio.com.ar');
 const originalImages=fs.readdirSync(path.join(root,'studio/safari-baby/images')).filter(n=>/\.(png|jpg)$/.test(n));assert.equal(originalImages.length,12);
 const sizes=originalImages.reduce((sum,n)=>sum+fs.statSync(path.join(root,'studio/safari-baby/images',n)).size,0);assert.equal(sizes,24331842);
});

test('datos incompletos producen errores útiles y fechas imposibles se rechazan',()=>{
 assert.ok(validateCatalog({}).length);assert.ok(validateCatalog({categories:[null],products:[],projects:[]}).length);
 assert.ok(mutate(d=>d.products[0].offers[0].price=undefined).length);
 assert.ok(mutate(d=>d.products[0].details=null).length);
 assert.ok(mutate(d=>{d.products[0].offers[0]={platform:'etsy',url:'https://www.etsy.com/listing/123',verification:'verified',verifiedAt:'2026-02-30',price:null};}).length);
});
