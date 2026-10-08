import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCatalog} from '../scripts/catalog.mjs';
import {distRoot} from '../scripts/public-output.mjs';
import {commercialSummary,productImage} from '../templates/site.mjs';
const data=loadCatalog();
test('estado comercial y precio no se inventan ante datos pendientes',()=>{
 const p=structuredClone(data.products[0]);p.offers=[];p.publicationStatus='unknown';
 assert.match(commercialSummary(p),/Información pendiente/);assert.doesNotMatch(commercialSummary(p),/USD|Compra disponible/);
 p.publicationStatus='published';assert.match(commercialSummary(p),/Publicado · enlaces pendientes/);
 const confirmed=data.products.find(p=>p.id==='safari-baby-cuentos-para-dormir-es');
 assert.match(commercialSummary(confirmed),/Compra disponible/);assert.doesNotMatch(commercialSummary(confirmed),/USD/);
 assert.match(commercialSummary(data.products[0]),/Precio de referencia/);
});
test('portadas ausentes no heredan imagen de otro producto al compartir',()=>{
 for(const p of data.products){
  const html=fs.readFileSync(path.join(distRoot,'productos',p.slug,'index.html'),'utf8');
  if(p.image){assert.ok(html.includes('property="og:image" content="https://galumio.com.ar'+p.image.display+'"'));assert.ok(productImage(p).includes('height="'+p.image.height+'"'));}
  else{assert.doesNotMatch(html,/property="og:image"/);assert.match(productImage(p),/Portada pendiente/);assert.doesNotMatch(productImage(p),/<img/);}
 }
});

const covers=[["safari-baby-halloween-es","05202044a658b386713a72388ef3c2af7ca485f9e02286af93bfc30173b147ce"],["safari-baby-halloween-en","6723d76cc76c9a59ec4ad58a5612a0480f62cdf08095a6e09e64ce1d73200d32"],["cuidar-alzheimer-demencia","379128ce987b9aafec71ff41d14f90111fc686eb1bd829b0e4090249ee1e59ad"],["ia-para-maestros","cfd66230aa879a8842a5a1e807f804c6c8e27ef971aff70db5195b00b20bab03"],["ai-for-teachers-en","d4f5680e69647c89ca9105ac4dd40b1540c1380eb6bd725e6328b656f2615986"],["safari-baby-cuentos-para-dormir-es","4757639a848a6c01eab0cdb3f4c2b2b993682010230cf27c8003b56a9f69a39f"],["safari-baby-bedtime-stories","8f5dd4ec2188bc1d4cc85c1ceef504d0194184bdf8f801dee131649cc2082445"]];
test('siete portadas conservan originales, asociación y exclusión de originales en dist',async()=>{
 const {createHash}=await import('node:crypto');
 const {root}=await import('../scripts/catalog.mjs');
 for(const [id,hash] of covers){
  const p=data.products.find(p=>p.id===id);
  assert.equal(p.image.original,'/assets/images/products/'+id+'/cover.jpg');
  assert.equal(p.image.display,'/assets/images/products/'+id+'/cover-web.jpg');
  assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,p.image.original))).digest('hex'),hash);
  assert.equal(fs.existsSync(path.join(distRoot,p.image.original)),false);
  assert.ok(fs.existsSync(path.join(distRoot,p.image.display)));
  const html=fs.readFileSync(path.join(distRoot,'productos',p.slug,'index.html'),'utf8');
  assert.ok(html.includes('src="'+p.image.display+'"'));
 }
});
