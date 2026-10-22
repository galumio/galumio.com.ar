import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCatalog,loadDrafts,validateCatalog,validateDrafts,validFreeReading,isPublicProduct,root} from '../scripts/catalog.mjs';
import {distRoot,listFiles} from '../scripts/public-output.mjs';
import {productEditorial,purchaseLinks} from '../templates/site.mjs';
import {createReviewServer} from '../scripts/preview-review.mjs';
const data=loadCatalog();
const testDraft={...structuredClone(data.products[0]),id:'ejemplo-privado',slug:'ejemplo-privado',title:'Ejemplo de prueba',category:'educacion-estudio',categoryTitle:'Educación y estudio',visibility:'draft',publicationStatus:'unknown',publicationSource:'pending',offers:[],featured:false,linksFeatured:false,image:null,freeReading:{url:null,verification:'pending'}};
test('descripciones conservan ediciones, imágenes, disponibilidad y ofertas originales',()=>{
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/catalog-preserved.json'),'utf8'));
 assert.equal(data.products.filter(p=>!['como-estudiar-para-un-final','ia-cotidiana-para-adultos-mayores','everyday-ai-for-seniors'].includes(p.id)).length,baseline.length);
 for(const previous of baseline){const p=data.products.find(p=>p.id===previous.id);for(const key of Object.keys(previous))assert.deepEqual(p[key],previous[key],p.id+': '+key);}
});
test('cada ficha muestra contenido ampliado, público, beneficios y SEO propio',()=>{
 for(const p of data.products.filter(isPublicProduct)){const html=fs.readFileSync(path.join(distRoot,'productos',p.slug,'index.html'),'utf8');
 for(const text of [p.subtitle,p.audience,...p.longDescription,...p.benefits,...p.details])assert.ok(html.includes(text),p.id+': '+text);
 assert.ok(html.includes('name="description" content="'+p.seo.description+'"'));
 }
 const bad=structuredClone(data);bad.products[0].longDescription=[];assert.ok(validateCatalog(bad).length);
 const p=structuredClone(data.products[0]);p.longDescription=['<script>unsafe</script>'];assert.ok(productEditorial(p).includes('&lt;script&gt;'));
});
test('borrador privado jamás entra en salida pública, sitemap ni ofertas',()=>{
 assert.deepEqual(validateDrafts(loadDrafts()),[]);
 const drafts=[structuredClone(testDraft)];assert.deepEqual(validateDrafts(drafts),[]);
 for(const file of listFiles(distRoot).filter(f=>/\.(html|xml|json)$/.test(f))){const text=fs.readFileSync(path.join(distRoot,file),'utf8');for(const p of drafts)assert.ok(!text.includes(p.slug),file);}
 assert.ok(!fs.existsSync(path.join(distRoot,'data/drafts.json')));
 const bad=structuredClone(data);bad.products.push({...drafts[0],category:'educacion-ia'});assert.ok(validateCatalog(bad).length);
 const published=structuredClone(drafts);published[0].publicationStatus='published';assert.ok(validateDrafts(published).length);
 assert.doesNotMatch(purchaseLinks(drafts[0]),/data-buy|href=/);
 assert.equal(validFreeReading({url:'javascript:alert(1)',verification:'owner-confirmed',verificationSource:'owner-provided'}),false);
 assert.equal(validFreeReading({url:'https://example.com/read',verification:'pending'}),false);
});
test('vista previa privada sirve el borrador con noindex sin exponer fuentes ni archivos premium',async()=>{
 const server=createReviewServer({drafts:[testDraft]});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const base='http://127.0.0.1:'+server.address().port;
 const r=await fetch(base+'/revision/ejemplo-privado/');assert.equal(r.status,200);assert.match(r.headers.get('x-robots-tag'),/noindex/);
 const html=await r.text();assert.match(html,/Borrador privado/);assert.match(html,/Portada pendiente/);assert.doesNotMatch(html,/data-buy=|href="[^"]+\.pdf|href="\/educacion-estudio\/"/);
 for(const url of ['/data/drafts.json','/scripts/preview-review.mjs','/productos/ejemplo-privado/'])assert.equal((await fetch(base+url)).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});

test('bundle pendiente se conserva privado y no aparece en ninguna página o recurso público',()=>{
 const p=data.products.find(p=>p.id==='leo-bundle-bilingue');assert.equal(p.visibility,'hidden');assert.equal(p.publicationStatus,'unknown');assert.equal(data.products.length,15);assert.equal(data.products.filter(isPublicProduct).length,14);
 for(const file of listFiles(distRoot)){
  assert.doesNotMatch(file,/leo-bilingual-bundle|leo-bundle-bilingue/);
  if(/\.(html|xml)$/.test(file))assert.doesNotMatch(fs.readFileSync(path.join(distRoot,file),'utf8'),/leo-bilingual-bundle|leo-bundle-bilingue|3D0xE|4586417743/);
 }
});
