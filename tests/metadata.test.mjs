import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCatalog,languages,validateCatalog} from '../scripts/catalog.mjs';
import {productCard,productPage,catalogPage} from '../templates/site.mjs';
import {distRoot} from '../scripts/public-output.mjs';
const data=loadCatalog();
const expected=[["safari-baby-halloween-es","es","Ebook PDF"],["safari-baby-halloween-en","en","Ebook PDF"],["cuidar-alzheimer-demencia","es","Ebook PDF"],["ia-para-maestros","es","Ebook PDF"],["ai-for-teachers-en","en","Ebook PDF"],["safari-baby-cuentos-para-dormir-es","es","Ebook PDF"],["safari-baby-bedtime-stories","en","Ebook PDF"],["safari-baby-12-animales","not-applicable","PNG digital"],["safari-baby-activity-book","en","PDF imprimible"],["leo-luciernagas-es","es","Ebook PDF"],["leo-fireflies-en","en","Ebook PDF"],["leo-bundle-bilingue","es-en","Ebook PDF"]];
test('metadatos confirmados se conservan en catálogo, tarjetas y fichas',()=>{
 for(const [id,language,format] of expected){
  const p=data.products.find(p=>p.id===id);assert.equal(p.language,language,id);assert.equal(p.format,format,id);
  for(const html of [productCard(p,data.categories),productPage(p,data),fs.readFileSync(path.join(distRoot,'productos',p.slug,'index.html'),'utf8')]){
   assert.ok(html.includes(languages[language]),id);assert.ok(html.includes(format),id);
   assert.doesNotMatch(html,/Idioma por confirmar|Formato por confirmar/);
  }
 }
});
test('No aplica es un valor distinto de desconocido y conserva el filtrado',()=>{
 const pack=data.products.find(p=>p.id==='safari-baby-12-animales');
 assert.match(productCard(pack,data.categories),/data-language="not-applicable"/);
 const html=catalogPage(data);assert.ok(html.includes('<option value="not-applicable">No aplica</option>'));
 for(const format of ['Ebook PDF','PDF imprimible','PNG digital'])assert.ok(html.includes('<option>'+format+'</option>'));
 const copy=structuredClone(data);copy.products[0].language=null;assert.deepEqual(validateCatalog(copy),[]);
 assert.match(productCard(copy.products[0],copy.categories),/Idioma por confirmar/);
});
