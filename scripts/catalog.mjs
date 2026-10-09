import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function loadCatalog() {
  return Object.fromEntries(['categories','products','projects'].map(name => [name, JSON.parse(fs.readFileSync(path.join(root,'data',name+'.json'),'utf8'))]));
}
export const labels = {etsy:'Etsy', payhip:'Payhip', amazon:'Amazon'};
export const languages = {es:'Español',en:'Inglés','es-en':'Español + Inglés','not-applicable':'No aplica'};
export function verifiedOffer(o) { return o.verification === 'verified' && Boolean(o.url) && Boolean(o.verifiedAt) && ['owner-provided','independent-review'].includes(o.verificationSource); }
export function statusLabel(p) { return p.publicationStatus === 'published' ? 'Publicado · enlaces en revisión' : 'Detalles en revisión'; }
export function validateCatalog(data, options = {}) {
  const errors = [];
  if (!data || !['categories','products','projects'].every(key => Array.isArray(data[key]))) return ['El catálogo debe contener listas de categorías, productos y proyectos'];
  if ([...data.categories,...data.products,...data.projects].some(item => !item || typeof item !== 'object' || Array.isArray(item))) return ['Cada registro debe ser un objeto'];
  const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  const exists = options.exists || (p => fs.existsSync(path.join(root,p)));
  const legacyExists = route => exists('templates/legacy'+route+'index.html');
  const ids = new Set(); const slugs = new Set();
  const categoryIds = new Set(data.categories.map(c=>c.id));
  const safeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const localPath = p => typeof p === 'string' && p.startsWith('/') && !p.includes('..') && !p.includes('\\') && !p.startsWith('//') && !/[?#]/.test(p);
  for (const c of data.categories) {
    if (!safeSlug.test(c.id) || !c.title || !c.description) errors.push('Categoría inválida: '+c.id);
  }
  if (categoryIds.size !== data.categories.length) errors.push('Categorías duplicadas');
  for (const p of data.products) {
    const error = msg=>errors.push(p.id+': '+msg);
    if (!safeSlug.test(p.id) || ids.has(p.id)) error('ID inválido o duplicado'); ids.add(p.id);
    if (!safeSlug.test(p.slug) || slugs.has(p.slug)) error('slug inválido o duplicado'); slugs.add(p.slug);
    if (typeof p.title !== 'string' || !p.title.trim() || typeof p.description !== 'string' || !p.description.trim()) error('título y descripción obligatorios');
    if (!categoryIds.has(p.category)) error('categoría desconocida');
    if (p.language !== null && !languages[p.language]) error('idioma desconocido');
    if (p.format !== null && (typeof p.format !== 'string' || !p.format.trim())) error('formato inválido');
    if (!['published','unknown'].includes(p.publicationStatus)) error('estado de publicación inválido');
    if (p.publicationStatus === 'published' && (!p.publicationSource || p.publicationSource === 'pending')) error('publicación sin fuente');
    if (!Array.isArray(p.details) || p.details.some(t => typeof t !== 'string' || !t.trim())) error('detalles inválidos');
    if (p.linksFeatured !== undefined && typeof p.linksFeatured !== 'boolean') error('destacado en links debe ser booleano');
    if (typeof p.featured !== 'boolean') error('destacado debe ser booleano');
    if (p.group !== null && !safeSlug.test(p.group)) error('grupo inválido');
    if (p.legacyPath !== null) {
      const [legacy, anchor] = String(p.legacyPath).split('#');
      if (!localPath(legacy) || !legacyExists(legacy) || (anchor !== undefined && !safeSlug.test(anchor))) error('ruta original inválida');
    }
    if (!localPath(p.expectedImage)) error('ubicación de imagen inválida');
    if (p.image) {
      if (!localPath(p.image.original) || !exists(p.image.original)) error('imagen original inexistente');
      if (!localPath(p.image.display) || !exists(p.image.display)) error('imagen web inexistente');
      if (typeof p.image.alt !== 'string' || !p.image.alt.trim() || !Number.isInteger(p.image.width) || !Number.isInteger(p.image.height) || p.image.width <= 0 || p.image.height <= 0) error('imagen sin alt o dimensiones válidas');
    }
    if (!Array.isArray(p.offers)) {error('ofertas inválidas');continue;}
    const platforms = new Set();
    for (const o of p.offers) {
      if (!o || typeof o !== 'object') {error('oferta inválida');continue;}
      if (!labels[o.platform] || platforms.has(o.platform)) error('plataforma inválida o duplicada'); platforms.add(o.platform);
      if (!['pending','verified'].includes(o.verification)) error('verificación inválida');
      if (o.url !== null) {
        try {
          const u = new URL(o.url);
          const host = u.hostname.toLowerCase();
          const validHost = o.platform === 'etsy' ? /^(www\.)?etsy\.com$/.test(host) : o.platform === 'payhip' ? /^(www\.)?payhip\.com$/.test(host) : /^(www\.)?amazon\.(com|es|com\.ar|com\.mx|co\.uk|de|fr|it|ca|com\.br|com\.au|co\.jp)$/.test(host);
          if (u.protocol !== 'https:' || u.username || u.password || !validHost || u.pathname === '/' || /[<>]/.test(o.url)) error('URL de tienda inválida');
        } catch {error('URL inválida');}
      }
      if (o.verification === 'verified' && (!o.url || !isDate(o.verifiedAt))) error('enlace verificado sin URL o fecha');
      if (o.verification === 'verified' && !['owner-provided','independent-review'].includes(o.verificationSource)) error('enlace verificado sin fuente de evidencia');
      if (o.httpCheckedAt !== undefined && o.httpCheckedAt !== null && !isDate(o.httpCheckedAt)) error('fecha HTTP inválida');
      if (o.price && o.price.kind !== undefined && !['reference','listed'].includes(o.price.kind)) error('tipo de precio inválido');
      if (o.price?.kind === 'reference' && o.price.source !== 'owner-provided') error('precio de referencia sin fuente del propietario');
      if (o.verification === 'pending' && o.verifiedAt !== null) error('enlace pendiente con fecha de verificación');
      if (o.price !== null && (!o.price || !verifiedOffer(o) || !Number.isFinite(o.price.amount) || o.price.amount < 0 || !/^[A-Z]{3}$/.test(o.price.currency || '') || !isDate(o.price.verifiedAt))) error('precio sin validación, moneda o importe válido');
    }
  }
  const projectIds = new Set();
  for (const p of data.projects) {
    if (!safeSlug.test(p.id) || projectIds.has(p.id) || !p.title || !p.description || !p.note || !p.source) errors.push('Proyecto inválido: '+p.id);
    projectIds.add(p.id);
    if (!['unknown','beta-recorded','development-recorded'].includes(p.status)) errors.push('Estado de proyecto inválido: '+p.id);
    if (p.path !== null && (!localPath(p.path) || !legacyExists(p.path))) errors.push('Ruta de proyecto inexistente: '+p.id);
  }
  return errors;
}
