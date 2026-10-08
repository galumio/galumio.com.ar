import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { distRoot, publicPlan, listFiles, inside } from './public-output.mjs';
const domain = 'https://galumio.com.ar';
const sensitivePatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{24,})\b/,
  /(?:password|secret|api[_-]?key|access[_-]?token)\s*[=:]\s*["'][^"']{8,}["']/i,
  /(?:[A-Z]:[\\/]Users[\\/]|file:\/\/\/|\/home\/[^/]+\/|\/Users\/[^/]+\/)/i,
  /sourceMappingURL\s*=/
];
export function validateOutput(directory = distRoot, plan = publicPlan()) {
  const errors=[];
  let files;
  try {files=listFiles(directory);} catch(error) {return [error.message];}
  const expected=new Set(plan.files);const actual=new Set(files);
  for(const file of files)if(!expected.has(file))errors.push('Archivo no autorizado en salida: '+file);
  for(const file of expected)if(!actual.has(file))errors.push('Archivo público faltante: '+file);
  function checkDirectories(dir,prefix='') {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true}))if(entry.isDirectory()){
      const relative=prefix+entry.name+'/';
      if(!plan.files.some(file=>file.startsWith(relative)))errors.push('Directorio no autorizado en salida: '+relative);
      checkDirectories(path.join(dir,entry.name),relative);
    }
  }
  checkDirectories(directory);
  const read=file=>fs.readFileSync(inside(directory,file),'utf8');
  if(actual.has('CNAME') && read('CNAME').trim()!=='galumio.com.ar')errors.push('CNAME no conserva el dominio');
  const htmlFiles=files.filter(file=>file.endsWith('.html'));
  const ids=new Map(htmlFiles.map(file=>[file,new Set([...read(file).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))]));
  function checkReference(source,value) {
    value=value.replaceAll('&amp;','&');
    if(value.startsWith('mailto:'))return;
    let url;
    try {url=new URL(value,domain+'/'+source);}catch{errors.push(source+': URL inválida');return;}
    if(!['https:','http:'].includes(url.protocol)){errors.push(source+': protocolo no permitido');return;}
    if(url.origin!==domain)return;
    let relative;
    try {relative=decodeURIComponent(url.pathname).replace(/^\//,'');}catch{errors.push(source+': ruta mal codificada');return;}
    if(relative==='' || relative.endsWith('/'))relative+='index.html';
    else if(!actual.has(relative) && actual.has(relative+'/index.html'))relative+='/index.html';
    if(!actual.has(relative)){errors.push(source+': referencia pública inexistente o con mayúsculas incorrectas: '+relative);return;}
    if(url.hash){
      let anchor;try{anchor=decodeURIComponent(url.hash.slice(1));}catch{errors.push(source+': ancla inválida');return;}
      if(!ids.get(relative)?.has(anchor))errors.push(source+': ancla inexistente en '+relative);
    }
  }
  for(const file of files){
    if(!/\.(html|css|js|xml|txt)$/.test(file))continue;
    const text=read(file);
    for(const pattern of sensitivePatterns)if(pattern.test(text))errors.push(file+': patrón sensible o referencia local detectado');
    if(file.endsWith('.html')){
      for(const match of text.matchAll(/\b(?:href|src)="([^"]+)"/g))checkReference(file,match[1]);
      for(const match of text.matchAll(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/g))checkReference(file,match[1]);
      if(/Agregá aquí|href="#"/.test(text))errors.push(file+': placeholder interno expuesto');
    }
    if(file.endsWith('.css'))for(const match of text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g))checkReference(file,match[1]);
  }
  if(actual.has('sitemap.xml')){
    const urls=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
    const required=plan.routes.map(route=>domain+route);
    if(urls.length!==required.length || new Set(urls).size!==urls.length || required.some(url=>!urls.includes(url)))errors.push('Sitemap incompleto o con rutas inesperadas');
    for(const url of urls)checkReference('sitemap.xml',url);
  }
  if(actual.has('robots.txt') && !read('robots.txt').includes('Sitemap: '+domain+'/sitemap.xml'))errors.push('Robots sin sitemap correcto');
  return errors;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const plan=publicPlan();const errors=validateOutput(distRoot,plan);
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
 else console.log('dist/ válido: '+plan.routes.length+' páginas, 404 y '+plan.files.length+' archivos públicos permitidos.');
}
