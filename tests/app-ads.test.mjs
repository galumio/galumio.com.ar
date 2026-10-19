import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {root} from '../scripts/catalog.mjs';
import {distRoot,publicPlan} from '../scripts/public-output.mjs';
import {createServer} from '../scripts/serve.mjs';

test('app-ads.txt conserva la entrada AdMob y se sirve como texto plano desde dist',async()=>{
 const expected='google.com, pub-2507605563072309, DIRECT, f08c47fec0942fa0\n';
 const original=fs.readFileSync(path.join(root,'app-ads.txt'));
 assert.equal(original.toString('utf8'),expected);
 assert.deepEqual(fs.readFileSync(path.join(distRoot,'app-ads.txt')),original);
 assert.ok(publicPlan().assets.includes('app-ads.txt'));
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const response=await fetch('http://127.0.0.1:'+server.address().port+'/app-ads.txt');
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^text\/plain/);
  assert.equal(await response.text(),expected);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
