import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {root} from '../scripts/catalog.mjs';
// JSON es un subconjunto de YAML: permite validar la estructura sin dependencias.
const workflow=JSON.parse(fs.readFileSync(path.join(root,'.github/workflows/pages.yml'),'utf8'));
const build=workflow.jobs.build;const deploy=workflow.jobs.deploy;
const upload=build.steps.find(step=>step.uses?.startsWith('actions/upload-pages-artifact@'));
test('workflow válido con permisos mínimos separados por trabajo',()=>{
 assert.deepEqual(workflow.permissions,{});assert.deepEqual(build.permissions,{contents:'read'});
 assert.deepEqual(deploy.permissions,{pages:'write','id-token':'write'});assert.equal(deploy.needs,'build');assert.equal(deploy.environment.name,'github-pages');
 assert.ok(!workflow.on.pull_request_target);assert.deepEqual(workflow.on.push.branches,['main','feature/galumio-tienda']);assert.deepEqual(workflow.on.pull_request.branches,['main']);
 assert.equal(build.steps.find(step=>step.uses?.startsWith('actions/checkout@')).with['persist-credentials'],false);
 const configure=deploy.steps.find(step=>step.uses?.startsWith('actions/configure-pages@'));assert.equal(configure.with.enablement,false);
 assert.ok(!JSON.stringify(workflow).includes('secrets.'));assert.ok(!deploy.steps.some(step=>step.uses?.startsWith('actions/checkout@')));
});
test('subida y despliegue solo se permiten en main por push o ejecución manual',()=>{
 for(const condition of [upload.if,deploy.if]){
  assert.equal(typeof condition,'string');
  for(const ref of ['refs/heads/main','refs/heads/feature/galumio-tienda','refs/heads/other','refs/tags/main','refs/pull/1/merge'])for(const event_name of ['push','workflow_dispatch','pull_request','pull_request_target']){
   const actual=vm.runInNewContext(condition,{github:{ref,event_name}},{timeout:1000});
   assert.equal(actual,ref==='refs/heads/main' && ['push','workflow_dispatch'].includes(event_name),ref+' '+event_name);
  }
 }
});
test('solo se sube dist después de construir, validar y probar',()=>{
 assert.equal(upload.with.path,'dist');assert.ok(!JSON.stringify(upload).includes('include-hidden-files'));
 const checks=build.steps.findIndex(step=>step.run==='npm run check');const finalCheck=build.steps.findIndex(step=>step.run==='npm run validate:dist');const uploaded=build.steps.indexOf(upload);
 assert.ok(checks>=0 && finalCheck>checks && uploaded>finalCheck);
 assert.ok(deploy.steps.some(step=>step.uses==='actions/deploy-pages@v4'));
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.equal(pkg.scripts.check,'npm run validate && npm run build && npm run validate:dist && npm test');
});
