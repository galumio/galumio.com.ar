import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {loadCatalog,loadDrafts,isPublicProduct,root} from '../scripts/catalog.mjs';
import {distRoot,listFiles,publicPlan} from '../scripts/public-output.mjs';
const data=loadCatalog();
const id='como-estudiar-para-un-final';
const product=data.products.find(p=>p.id===id);
const read=route=>fs.readFileSync(path.join(distRoot,route),'utf8');
test('nuevo ebook conserva exactamente los doce productos anteriores',()=>{
 const hashes=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/pre-estudiar-final-hashes.json'),'utf8'));
 assert.equal(data.products.length,Object.keys(hashes).length+5);
 for(const [id,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(JSON.stringify(data.products.find(p=>p.id===id))).digest('hex'),hash,id);
 assert.equal(data.products.filter(isPublicProduct).length,16);
 assert.equal(data.products.flatMap(p=>p.offers).filter(o=>o.verification==='verified').length,19);
});
test('final publicado tiene contenido confirmado, precio y solo Payhip',()=>{
 assert.ok(isPublicProduct(product));assert.equal(product.category,'educacion-estudio');assert.equal(product.language,'es');assert.equal(product.format,'Ebook PDF');
 assert.equal(product.offers.length,1);const offer=product.offers[0];assert.equal(offer.platform,'payhip');assert.equal(offer.url,'https://payhip.com/b/pSUB0');assert.equal(offer.price.amount,3.99);assert.equal(offer.price.currency,'USD');assert.equal(offer.price.kind,'listed');assert.equal(offer.verificationSource,'owner-provided');assert.equal(offer.httpCheckedAt,null);
 assert.ok(!loadDrafts().some(p=>p.id===id));
 const html=read('productos/'+id+'/index.html');for(const text of ['55 páginas','10 capítulos','8 plantillas','PDF independiente','Comprar en Payhip'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/Comprar en Etsy|Comprar en Amazon|Borrador privado|noindex/);
 const schema=JSON.parse(html.split('<script type="application/ld+json">')[1].split('</script>')[0]);
 assert.equal(schema['@type'],'Product');assert.equal(schema.offers[0].price,3.99);assert.equal(schema.offers[0].priceCurrency,'USD');assert.equal(schema.offers[0].url,offer.url);assert.equal(schema.image,'https://galumio.com.ar'+product.image.display);
 assert.ok(read('sitemap.xml').includes('/productos/'+id+'/'));assert.ok(read('sitemap.xml').includes('/educacion-estudio/'));
});
test('tienda, categoría y filtros permiten encontrar el ebook',()=>{
 for(const route of ['tienda/index.html','educacion-estudio/index.html']){const html=read(route);assert.ok(html.includes('/productos/'+id+'/'));assert.ok(html.includes('data-category="educacion-estudio"'));assert.ok(html.includes('data-language="es" data-format="Ebook PDF"'));}
 const element=(extra={})=>({hidden:false,value:'',textContent:'',events:{},addEventListener(k,fn){this.events[k]=fn;},focus(){},...extra});
 const cards=data.products.filter(isPublicProduct).map(p=>element({id:p.id,dataset:{search:p.title+' '+p.description+' '+p.tags.join(' '),language:p.language,format:p.format}}));
 const selectors={'[data-filters]':element(),'#search':element(),'#language':element(),'#format':element(),'#reset-filters':element(),'[data-results]':element(),'[data-empty]':element()};
 vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/site.js'),'utf8'),{document:{querySelector:s=>selectors[s]||null,querySelectorAll:()=>cards},navigator:{}});
 selectors['#search'].value='como estudiar para un final';selectors['#language'].value='es';selectors['#format'].value='Ebook PDF';selectors['#search'].events.input();assert.deepEqual(cards.filter(p=>!p.hidden).map(p=>p.id),[id]);
 selectors['#language'].value='en';selectors['#language'].events.change();assert.ok(cards.every(p=>p.hidden));
});
test('portada original intacta y ningún PDF premium en salida',()=>{
 const original=fs.readFileSync(path.join(root,product.image.original));assert.equal(crypto.createHash('sha256').update(original).digest('hex'),'d19b8d3ddf771bbd1b2040d7eb628055f18eabdf9b84c5a51a2a1937e48c75e6');
 assert.equal(original.readUInt32BE(16),1131);assert.equal(original.readUInt32BE(20),1600);assert.equal(product.image.width,800);assert.equal(product.image.height,1132);
 assert.ok(publicPlan().assets.includes(product.image.display.slice(1)));assert.ok(!publicPlan().assets.includes(product.image.original.slice(1)));
 for(const file of listFiles(distRoot))assert.doesNotMatch(file,/\.(pdf|zip)$/i);
 assert.ok(!fs.existsSync(path.join(distRoot,'data/drafts.json')));
 assert.deepEqual(fs.readdirSync(path.join(root,'assets/images/products',id)).sort(),['cover-web.jpg','cover.png']);
});
