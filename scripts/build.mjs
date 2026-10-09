import fs from 'node:fs';
import path from 'node:path';
import { root, loadCatalog, validateCatalog, verifiedOffer } from './catalog.mjs';
import { origin, esc, layout, homePage, catalogPage, productPage, projectsPage, appPage, linksPage } from '../templates/site.mjs';
import { distRoot, publicPlan, resetDist, copyPublicAssets, inside, legacyRoutes } from './public-output.mjs';
import { validateOutput } from './validate-dist.mjs';
const data=loadCatalog();
const errors=validateCatalog(data); if(errors.length) throw new Error(errors.join('\n'));
const plan=publicPlan(data);
// Validar todas las fuentes antes de reemplazar la salida anterior.
for (const file of plan.assets) { if (!fs.existsSync(path.join(root,file))) throw new Error('Recurso público faltante: '+file); }
resetDist();
copyPublicAssets(plan);
const routes=[];
function save(url,content,indexable=true){
 for(const image of plan.manifest) content=content.replace(new RegExp('(src="/assets/images/catalog/'+image.file.replaceAll('.','\\.')+'"[^>]*?)width="800" height="800"','g'),'$1width="'+image.width+'" height="'+image.height+'"');
 const target=inside(distRoot,url.slice(1)+'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);routes.push({url,indexable});}
function page(url,title,description,body,extra={}){save(url,layout({url,title,description,body,...extra}),!extra.noindex);}
page('/','Historias, recursos e ideas digitales','Libros infantiles, guías, recursos de educación e IA, diseños digitales y proyectos de Galumio Studio.',homePage(data),{schema:{'@context':'https://schema.org','@type':'Organization',name:'Galumio Studio',url:origin}});
page('/tienda/','Tienda','Explorá el catálogo de productos digitales de Galumio Studio: libros, guías y recursos creativos.',catalogPage(data));
for(const c of data.categories)page('/'+c.id+'/',c.title,c.description,catalogPage(data,c));
page('/apps-y-juegos/','Apps y juegos','Conocé Astria, Biblia Viva y los proyectos de Galumio, con información sobre sus estados.',projectsPage(data));
page('/links/','Todos nuestros links','Encontrá la tienda, las colecciones y los proyectos de Galumio Studio en un solo lugar.',linksPage(data));
for(const p of data.products){
 const url='/productos/'+p.slug+'/';
 const schema={'@context':'https://schema.org','@type':'Product',name:p.title,description:p.description,url:origin+url,brand:{'@type':'Brand',name:'Galumio Studio'}};
 if(p.image)schema.image=origin+p.image.display;
 const offers=p.offers.filter(o=>verifiedOffer(o)&&o.price&&o.price.kind!=='reference').map(o=>({'@type':'Offer',url:o.url,price:o.price.amount,priceCurrency:o.price.currency}));
 if(offers.length)schema.offers=offers;
 const extra={schema,image:p.image?.display||null};
 page(url,p.title,p.description,productPage(p,data),extra);
}
for(const p of data.projects.filter(p=>p.public)) {
 let body=appPage(p);
 if(p.path){
  const old=fs.readFileSync(path.join(root,'templates/legacy',p.path,'index.html'),'utf8');
  body+=[...old.matchAll(/\bid="([^"]+)"/g)].map(m=>'<span class="historical-anchor" id="'+esc(m[1])+'" aria-hidden="true"></span>').join('');
 }
 page(p.detailPath,p.title,p.description,body,{image:p.banner?.display||p.icon?.display||null});
}
const manifest=plan.manifest;
const legacyPaths=legacyRoutes;
for(const route of legacyPaths){
 if(data.projects.some(p=>p.public && p.detailPath==='/'+route))continue;
 let html=fs.readFileSync(path.join(root,'templates/legacy',route,'index.html'),'utf8');
 html=html.replace(/^```html\s*/,'').replace(/\s*```\s*$/,'');
 const title=html.match(/<title>([\s\S]*?)<\/title>/)[1];
 const description=html.match(/name="description"\s+content="([^"]*)"/)?.[1] || title;
 html=html.replace('</head>','<link rel="canonical" href="'+origin+'/'+route+'"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+description+'"><meta property="og:type" content="website"><meta property="og:url" content="'+origin+'/'+route+'"><meta property="og:site_name" content="Galumio Studio"><meta property="og:image" content="'+origin+'/assets/images/catalog/leo-friends-scene.jpg"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/assets/css/legacy.css"></head>');
 html=html.replace('<body>','<body><a class="skip-link" href="#contenido">Saltar al contenido</a><nav class="studio-navigation" aria-label="Navegación de Galumio Studio"><a href="/">Galumio Studio</a><span><a href="/tienda/">Tienda</a><a href="/apps-y-juegos/">Apps y juegos</a><a href="/links/">Links</a></span></nav>');
 html=html.replace('<main>','<main id="contenido" tabindex="-1">');
 html=html.replace(/<nav>/g,'<nav aria-label="Navegación de esta página">');
 html=html.replace(/<img\b[^>]*>/g,tag=>{
   const src=tag.match(/src="([^"]+)"/)?.[1];const asset=manifest.find(m=>src?.endsWith('/'+m.source));
   if(!asset)return tag;
   return tag.replace(src,'/assets/images/catalog/'+asset.file).replace(/>$/,' width="'+asset.width+'" height="'+asset.height+'" loading="lazy" decoding="async">');
 });
 html=html.replace(/<a\b([^>]*target="_blank"[^>]*)>([\s\S]*?)<\/a>/g,(all,attrs,text)=>'<a'+attrs.replace(/\s+rel="[^"]*"/g,'')+' rel="noopener noreferrer">'+text+'<span class="sr-only"> (abre otra pestaña)</span></a>');
 if(route==='studio/safari-baby/'){
   html=html.replace('Disponible en Etsy. Agregá aquí el enlace público del Activity Book cuando quieras activar el botón.','Opciones de compra y detalles en la ficha del producto.');
   html=html.replace('Opciones de compra y detalles en la ficha del producto.</p>','Opciones de compra y detalles en la ficha del producto.</p><a class="btn secondary" href="/productos/safari-baby-activity-book/">Ver ficha del Activity Book</a>');
 }
 if(route==='studio/' || route==='studio/safari-baby/'){
   html=html.replace('<main id="contenido" tabindex="-1">','<main id="contenido" tabindex="-1"><aside class="studio-catalog-note">Esta presentación conserva el contenido y los enlaces originales. Los precios y la disponibilidad están pendientes de revisión. <a href="/tienda/">Explorar el nuevo catálogo</a>.</aside>');
 }
 if(route==='biblia-viva/')html=html.replace('<div class="footer-links">','<div class="footer-links"><a href="/biblia-viva/privacidad/">Privacidad</a>');
 save('/'+route,html);
}
fs.writeFileSync(path.join(distRoot,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.filter(r=>r.indexable).map(r=>'<url><loc>'+origin+r.url+'</loc></url>').join('')+'</urlset>\n');
fs.writeFileSync(path.join(distRoot,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
fs.writeFileSync(path.join(distRoot,'404.html'),layout({title:'Página no encontrada',description:'Volvé al catálogo de Galumio Studio.',url:'/404.html',noindex:true,body:'<section class="shell contact-section"><p class="eyebrow">Error 404</p><h1>Esta página no está acá.</h1><p class="lead">Podés seguir explorando nuestras creaciones en la tienda.</p><a class="button primary" href="/tienda/">Ir a la tienda</a></section>'}));
const outputErrors=validateOutput(distRoot,plan);
if(outputErrors.length) throw new Error(outputErrors.join('\n'));
console.log('Generadas en dist/ '+routes.length+' páginas, sitemap, robots y 404. CNAME conservado.');
