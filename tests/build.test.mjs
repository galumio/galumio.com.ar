import {distRoot} from '../scripts/public-output.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {root,loadCatalog} from '../scripts/catalog.mjs';
const digest=p=>createHash('sha256').update(fs.readFileSync(path.join(distRoot,p))).digest('hex');
test('generación repetible y fuentes históricas fieles al sitio anterior',()=>{
 const data=loadCatalog();
 const routes=['index.html','404.html','sitemap.xml','robots.txt','tienda/index.html','apps-y-juegos/index.html','links/index.html',...data.categories.map(c=>c.id+'/index.html'),...data.products.map(p=>'productos/'+p.slug+'/index.html'),'astria/index.html','astria/privacidad/index.html','astria/soporte/index.html','biblia-viva/index.html','biblia-viva/privacidad/index.html','studio/index.html','studio/safari-baby/index.html'];
 const before=Object.fromEntries(routes.map(p=>[p,digest(p)]));
 execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,windowsHide:true});
 for(const p of routes)assert.equal(digest(p),before[p],p+' cambió al regenerar');
 for(const route of ['astria/','astria/privacidad/','astria/soporte/','biblia-viva/','biblia-viva/privacidad/','studio/','studio/safari-baby/']){
  const original=fs.readFileSync(path.join(root,'templates/legacy',route,'index.html'),'utf8');const generated=fs.readFileSync(path.join(distRoot,route,'index.html'),'utf8');
  for(const heading of original.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g))assert.ok(generated.includes(heading[0]),route+' perdió un encabezado');
 }
});
