import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {root} from '../scripts/catalog.mjs';
const code=fs.readFileSync(path.join(root,'assets/js/site.js'),'utf8');
function element(extra={}){return {hidden:false,value:'',textContent:'',dataset:{},events:{},addEventListener(name,fn){this.events[name]=fn;},focus(){this.focused=true;},...extra};}
function boot({filters=true,navigator={}}={}){
 const cards=[element({dataset:{search:'Educación e inteligencia artificial',language:'es',format:'PDF'}}),element({dataset:{search:'Safari Baby Halloween',language:'en',format:'unknown'}})];
 const map={'[data-filters]':filters?element({hidden:true}):null,'#search':element(),'#language':element(),'#format':element(),'#reset-filters':element(),'[data-results]':element(),'[data-empty]':element({hidden:true}),'[data-share]':element({hidden:true,dataset:{share:'Título'}}),'[data-share-status]':element(),'link[rel="canonical"]':{href:'https://galumio.com.ar/productos/test/'}};
 vm.runInNewContext(code,{document:{querySelector:s=>map[s]||null,querySelectorAll:()=>cards},navigator});return {cards,map};
}
test('filtros combinan búsqueda sin tildes, idioma y formato; reset recupera todo',()=>{
 const {cards,map}=boot();assert.equal(map['[data-filters]'].hidden,false);
 map['#search'].value='educacion';map['#search'].events.input();assert.equal(cards[0].hidden,false);assert.equal(cards[1].hidden,true);assert.equal(map['[data-results]'].textContent,'1 producto');
 map['#language'].value='en';map['#language'].events.change();assert.ok(cards.every(c=>c.hidden));assert.equal(map['[data-empty]'].hidden,false);
 map['#reset-filters'].events.click();assert.ok(cards.every(c=>!c.hidden));assert.equal(map['[data-empty]'].hidden,true);assert.equal(map['#search'].focused,true);
 map['#format'].value='unknown';map['#format'].events.change();assert.equal(cards[0].hidden,true);assert.equal(cards[1].hidden,false);
});
test('compartir copia la URL canónica cuando no existe Web Share',async()=>{
 let copied;const {map}=boot({filters:false,navigator:{clipboard:{writeText:async s=>{copied=s;}}}});assert.equal(map['[data-share]'].hidden,false);await map['[data-share]'].events.click();assert.equal(copied,'https://galumio.com.ar/productos/test/');assert.equal(map['[data-share-status]'].textContent,'Enlace copiado.');
});
test('compartir maneja cancelación y errores sin prometer éxito',async()=>{
 const {map}=boot({filters:false,navigator:{share:async()=>{throw {name:'AbortError'};}}});await map['[data-share]'].events.click();assert.equal(map['[data-share-status]'].textContent,'');
 const failed=boot({filters:false,navigator:{clipboard:{writeText:async()=>{throw new Error('denied');}}}});await failed.map['[data-share]'].events.click();assert.ok(failed.map['[data-share-status]'].textContent.includes('enlace permanente'));
});
test('sin APIs de compartir, el control progresivo permanece oculto',()=>{const {map}=boot({filters:false});assert.equal(map['[data-share]'].hidden,true);});
