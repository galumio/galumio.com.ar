import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {loadCatalog,validateCatalog} from '../scripts/catalog.mjs';
import {distRoot,listFiles} from '../scripts/public-output.mjs';
const data=loadCatalog();
test('solo tres apps públicas; proyectos ocultos se conservan en datos',()=>{
 assert.deepEqual(data.projects.filter(p=>p.public).map(p=>p.id).sort(),['astria','biblia-viva','causelink']);
 for(const id of ['nexuscore','stack-overdrive','el-camino-ciego'])assert.equal(data.projects.find(p=>p.id===id).public,false);
 for(const f of listFiles(distRoot).filter(f=>f.endsWith('.html'))){assert.doesNotMatch(fs.readFileSync(path.join(distRoot,f),'utf8'),/NexusCore|Stack Overdrive|El Camino Ciego/);}
});
test('fichas y catálogo enlazan estados reales sin descargas ni capturas ficticias',()=>{
 const catalog=fs.readFileSync(path.join(distRoot,'apps-y-juegos/index.html'),'utf8');
 for(const p of data.projects.filter(p=>p.public)){
  assert.ok(catalog.includes('href="'+p.detailPath+'"'));
  const html=fs.readFileSync(path.join(distRoot,p.detailPath,'index.html'),'utf8');
  assert.ok(html.includes(p.note));assert.ok(html.includes(p.statusTitle));
  assert.doesNotMatch(html,/href="[^"]*(?:\.apk|play.google.com)/);
 }
 assert.equal(data.products.length,12);assert.ok(data.products.every(p=>p.image));
 assert.equal(data.products.flatMap(p=>p.offers).filter(o=>o.verification==='verified').length,14);
});
test('se rechazan recursos, visibilidad y descargas sin validación',()=>{
 for(const change of [p=>p.public='yes',p=>p.detailPath='/../bad/',p=>p.downloads=['https://example.com/app.apk'],p=>p.icon={display:'/data/projects.json'}]){
  const copy=structuredClone(data);change(copy.projects[0]);assert.ok(validateCatalog(copy).length);
 }
});

test('Astria usa marca original y banner promocional, sin publicar sus originales',()=>{
 const app=data.projects.find(p=>p.id==='astria');
 const html=fs.readFileSync(path.join(distRoot,'astria/index.html'),'utf8');
 assert.equal(app.icon.display,'/assets/images/apps/astria/icon.png');
 assert.equal(app.banner.display,'/assets/images/apps/astria/banner.jpg');
 assert.ok(html.includes('og:image" content="https://galumio.com.ar'+app.banner.display));
 assert.ok(html.includes('Imagen promocional de Astria.'));
 assert.ok(html.includes('versión 3.1.0'));
 assert.ok(html.includes('Esto no confirma la versión publicada'));
 assert.ok(html.includes('Oráculo simbólico con respuestas locales.'));
 assert.ok(fs.existsSync(path.join(distRoot,app.banner.display)));
 assert.ok(!listFiles(distRoot).some(f=>f.includes('/originals/')));
 for(const change of [p=>p.banner.display='/data/projects.json',p=>p.banner.width=0,p=>p.banner.alt='']){
  const copy=structuredClone(data);change(copy.projects.find(p=>p.id==='astria'));assert.ok(validateCatalog(copy).length);
 }
});
test('CauseLink usa identidad oficial y atribuye validación al propietario',()=>{
 const app=data.projects.find(p=>p.id==='causelink');
 const html=fs.readFileSync(path.join(distRoot,'causelink/index.html'),'utf8');
 assert.equal(app.icon.display,'/assets/images/apps/causelink/icon.png');
 assert.ok(fs.existsSync(path.join(distRoot,app.icon.display)));
 assert.ok(!app.banner);
 assert.ok(html.includes('og:image" content="https://galumio.com.ar'+app.icon.display));
 assert.ok(html.includes('src="'+app.icon.display+'"'));
 const catalog=fs.readFileSync(path.join(distRoot,'apps-y-juegos/index.html'),'utf8');
 assert.ok(catalog.includes('src="'+app.icon.display+'"'));
 assert.doesNotMatch(html,/causelink_banner_concept|banner.jpg/);
 assert.ok(html.includes('El propietario confirmó su validación en Android'));
 assert.ok(html.includes('no procede de pruebas automáticas'));
 assert.ok(html.includes('Registros de alimentación y sueño.'));
 assert.ok(html.includes('detección automática de patrones y los experimentos no están disponibles'));
 assert.doesNotMatch(html,/expo-logo|expo-symbol|android-icon/);
});

test('Biblia Viva presenta seis historias infantiles verificadas y conserva privacidad y estado',()=>{
 const app=data.projects.find(p=>p.id==='biblia-viva');
 assert.deepEqual(app.children.stories.map(s=>s.title),['La Creación','El Arca de Noé','Moisés y el Mar Rojo','David y Goliat','El Buen Samaritano','El nacimiento de Jesús']);
 const html=fs.readFileSync(path.join(distRoot,'biblia-viva/index.html'),'utf8');
 assert.ok(html.includes('<h2 id="biblia-ninos">Biblia interactiva para niños</h2>'));
 for(const s of app.children.stories){assert.ok(html.includes(s.title));assert.ok(html.includes(s.activity));}
 const catalog=fs.readFileSync(path.join(distRoot,'apps-y-juegos/index.html'),'utf8');
 assert.ok(catalog.includes('Una aplicación para toda la familia'));
 assert.ok(catalog.includes('Biblia interactiva para niños con seis historias y juegos.'));
 assert.ok(html.includes('href="/biblia-viva/privacidad/"'));
 assert.equal(app.statusTitle,'Pruebas cerradas pendientes');
 assert.equal(app.icon.display,'/assets/images/apps/biblia-viva/icon.png');
 const copy=structuredClone(data);copy.projects.find(p=>p.id==='biblia-viva').children.stories=[{title:'Incompleta'}];
 assert.ok(validateCatalog(copy).length);
});
