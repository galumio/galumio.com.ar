import fs from 'node:fs';
import path from 'node:path';
import { root, loadCatalog } from './catalog.mjs';
export const distRoot = path.resolve(root, 'dist');
export const legacyRoutes = ['astria/','astria/privacidad/','astria/soporte/','biblia-viva/','biblia-viva/privacidad/','studio/','studio/safari-baby/'];
export function inside(base, relative) {
  if (typeof relative !== 'string' || relative.includes('\\') || relative.includes('\0') || relative.split('/').includes('..') || path.isAbsolute(relative)) throw new Error('Ruta pública inválida');
  const target = path.resolve(base, relative);
  if (target === path.resolve(base) || !target.startsWith(path.resolve(base) + path.sep)) throw new Error('Ruta fuera del directorio permitido');
  return target;
}
export function assertRegularSource(relative) {
  const target = inside(root, relative);
  let current = root;
  for (const segment of relative.split('/')) {
    current = path.join(current, segment);
    if (fs.lstatSync(current).isSymbolicLink()) throw new Error('No se permiten enlaces simbólicos: '+relative);
  }
  const stat = fs.statSync(target);
  if (!stat.isFile() || stat.nlink !== 1) throw new Error('Recurso público no regular: '+relative);
  return target;
}
export function listFiles(directory) {
  const files = [];
  function visit(dir, prefix = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes:true })) {
      const relative = prefix + entry.name;
      const target = path.join(dir,entry.name);
      const stat = fs.lstatSync(target);
      if (stat.isSymbolicLink()) throw new Error('Enlace simbólico en salida: '+relative);
      if (stat.isDirectory()) visit(target, relative+'/');
      else if (stat.isFile() && stat.nlink === 1) files.push(relative);
      else throw new Error('Archivo no regular en salida: '+relative);
    }
  }
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('La salida debe ser un directorio real');
  visit(directory);
  return files.sort();
}
export function resetDist(target = distRoot) {
  // Solo puede borrarse el directorio dist inmediato de este repositorio.
  // Se comprueba el destino absoluto y su padre real antes de borrar recursivamente.
  if (path.resolve(target) !== distRoot || path.dirname(distRoot) !== root || fs.realpathSync(path.dirname(distRoot)) !== fs.realpathSync(root)) throw new Error('Limpieza fuera de dist rechazada');
  if (fs.existsSync(distRoot)) {
    listFiles(distRoot); // Rechaza junctions, symlinks y hardlinks antes de limpiar.
    fs.rmSync(distRoot, { recursive:true, maxRetries:5, retryDelay:100 });
  }
  fs.mkdirSync(distRoot);
}
export function publicPlan(data = loadCatalog()) {
  const manifestPath = assertRegularSource('assets/images/catalog/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8').replace(/^\uFEFF/,''));
  const assets = new Set(['assets/css/site.css','assets/css/legacy.css','assets/js/site.js']);
  for (const image of manifest) {
    if (!/^[a-z0-9-]+\.jpg$/.test(image.file)) throw new Error('Nombre de imagen inválido en manifest');
    assets.add('assets/images/catalog/'+image.file);
  }
  for (const product of data.products) {
    if (!product.image) continue;
    if (!/^\/assets\/images\/[a-z0-9/-]+\.(jpg|jpeg|png|webp|avif|gif)$/.test(product.image.display)) throw new Error('La imagen web debe estar en assets/images');
    assets.add(product.image.display.slice(1));
  }
  const routes = ['/', '/tienda/', '/apps-y-juegos/', '/links/', ...data.categories.map(c=>'/'+c.id+'/'), ...data.products.map(p=>'/productos/'+p.slug+'/'), ...legacyRoutes.map(p=>'/'+p)];
  const files = [...routes.map(r=>r.slice(1)+'index.html'), '404.html','sitemap.xml','robots.txt','CNAME','.nojekyll', ...assets];
  if (new Set(files).size !== files.length) throw new Error('Rutas de salida duplicadas');
  for (const file of files) inside(distRoot,file);
  return { files:files.sort(), assets:[...assets].sort(), routes, manifest };
}
export function copyPublicAssets(plan) {
  for (const file of [...plan.assets,'CNAME']) {
    const source = assertRegularSource(file);
    const target = inside(distRoot,file);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.copyFileSync(source,target);
  }
  fs.writeFileSync(path.join(distRoot,'.nojekyll'),'');
}
