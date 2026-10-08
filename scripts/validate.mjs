import { loadCatalog, validateCatalog } from './catalog.mjs';
const data = loadCatalog();
const errors = validateCatalog(data);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('Catálogo válido: '+data.products.length+' productos, '+data.projects.length+' proyectos.');
