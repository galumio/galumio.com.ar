import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {root} from '../scripts/catalog.mjs';
import {distRoot,publicPlan,listFiles,resetDist,inside} from '../scripts/public-output.mjs';
import {validateOutput} from '../scripts/validate-dist.mjs';
import {createServer} from '../scripts/serve.mjs';
function fixture(){
 const parent=fs.realpathSync(os.tmpdir());const dir=fs.mkdtempSync(path.join(parent,'galumio-dist-'));
 fs.cpSync(distRoot,dir,{recursive:true});
 return {dir,clean(){
  if(path.dirname(fs.realpathSync(dir))!==parent || !path.basename(dir).startsWith('galumio-dist-'))throw new Error('Limpieza de fixture fuera de su ubicación');
  fs.rmSync(dir,{recursive:true});
 }};
}
test('dist contiene exclusivamente la lista pública y ninguna fuente interna',()=>{
 const plan=publicPlan();assert.deepEqual(listFiles(distRoot),plan.files);assert.deepEqual(validateOutput(),[]);
 for(const file of listFiles(distRoot)){
  assert.ok(!/(^|\/)(data|templates|scripts|tests|docs|node_modules|\.git|\.github)(\/|$)/.test(file),file);
  assert.ok(!/\.(json|md|mjs|yml|yaml|ps1|map|pem|key|log)$/.test(file),file);
 }
 assert.equal(fs.readFileSync(path.join(distRoot,'CNAME'),'utf8'),fs.readFileSync(path.join(root,'CNAME'),'utf8'));
 assert.ok(fs.existsSync(path.join(distRoot,'.nojekyll')));
});
test('el validador rechaza filtraciones, incluso directorios internos vacíos',()=>{
 const {dir,clean}=fixture();try{
  fs.mkdirSync(path.join(dir,'docs'));assert.ok(validateOutput(dir).some(e=>e.includes('Directorio no autorizado')));
  fs.writeFileSync(path.join(dir,'.env'),'TEST_ONLY=true');assert.ok(validateOutput(dir).some(e=>e.includes('Archivo no autorizado')));
  fs.writeFileSync(path.join(dir,'assets/js/unexpected.js'),'// not a public entry');assert.ok(validateOutput(dir).some(e=>e.includes('unexpected.js')));
 }finally{clean();}
});
test('archivos permitidos también se revisan para claves y rutas locales',()=>{
 const {dir,clean}=fixture();try{
  const file=path.join(dir,'assets/js/site.js');const original=fs.readFileSync(file,'utf8');
  for(const marker of ['-----BEGIN PRIVATE KEY-----','file:///Users/private/example','ghp_'+'A'.repeat(36)]){
   fs.writeFileSync(file,original+'\n// '+marker);assert.ok(validateOutput(dir).some(e=>e.includes('patrón sensible')));
  }
 }finally{clean();}
});
test('detecta recursos y anclas rotas, diferencias de mayúsculas y sitemap incompleto',()=>{
 const {dir,clean}=fixture();try{
  const file=path.join(dir,'index.html');const original=fs.readFileSync(file,'utf8');
  for(const href of ['/tienda/#inexistente','/Tienda/','/assets/images/no-existe.jpg']){
   fs.writeFileSync(file,original+'<a href="'+href+'">Test</a>');assert.ok(validateOutput(dir).some(e=>e.includes('inexistente')));
  }
  fs.writeFileSync(file,original);fs.writeFileSync(path.join(dir,'sitemap.xml'),'<urlset></urlset>');assert.ok(validateOutput(dir).some(e=>e.includes('Sitemap incompleto')));
 }finally{clean();}
});
test('rechaza enlaces simbólicos y no limpia fuera de dist',()=>{
 for(const target of [root,path.dirname(root),path.join(root,'data'),path.join(distRoot,'nested')])assert.throws(()=>resetDist(target),/fuera de dist/);
 assert.throws(()=>inside(distRoot,'../data/products.json'),/inválida/);
 const {dir,clean}=fixture();const link=path.join(dir,'linked-source');try{
  fs.symlinkSync(path.join(root,'data'),link,'junction');assert.ok(validateOutput(dir).some(e=>e.includes('Enlace simbólico')));
 }finally{if(fs.existsSync(link))fs.unlinkSync(link);clean();}
});
test('reconstruir elimina restos previos de dist sin modificar archivos de origen',()=>{
 const sourceFiles=['index.html','CNAME','data/products.json','templates/site.mjs','templates/legacy/studio/safari-baby/index.html'];
 const original=Object.fromEntries(sourceFiles.map(file=>[file,fs.readFileSync(path.join(root,file))]));
 fs.mkdirSync(path.join(distRoot,'docs'));fs.writeFileSync(path.join(distRoot,'docs/leak.txt'),'test');
 fs.writeFileSync(path.join(distRoot,'obsolete.html'),'old output');
 execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,windowsHide:true});
 assert.equal(fs.existsSync(path.join(distRoot,'docs')),false);assert.equal(fs.existsSync(path.join(distRoot,'obsolete.html')),false);
 for(const file of sourceFiles)assert.deepEqual(fs.readFileSync(path.join(root,file)),original[file]);
 assert.deepEqual(validateOutput(),[]);
});
test('el paquete funciona fuera del repositorio: rutas y activos propios; archivos internos dan 404',async()=>{
 const {dir,clean}=fixture();const server=createServer({directory:dir});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const route of publicPlan().routes){const response=await fetch(base+route);assert.equal(response.status,200,route);assert.ok((await response.text()).includes('<h1'));}
  for(const asset of publicPlan().assets){const response=await fetch(base+'/'+asset);assert.equal(response.status,200,asset);assert.equal((await response.arrayBuffer()).byteLength,fs.statSync(path.join(dir,asset)).size);}
  for(const route of ['/templates/legacy/studio/safari-baby/','/scripts/serve.mjs','/data/products.json','/tests/catalog.test.mjs','/docs/IMPLEMENTACION.md','/README.md','/package.json','/assets/images/catalog/manifest.json'])assert.equal((await fetch(base+route)).status,404,route);
 }finally{await new Promise(resolve=>server.close(resolve));clean();}
});
