# Implementación de Galumio Studio

## Alcance

Desarrollo local en feature/galumio-tienda, sin commits, merge, push ni publicación durante esta entrega. Se preservan CNAME, el esquema de carpetas de GitHub Pages, las siete páginas anteriores y las imágenes originales.

26 páginas indexables generadas dentro de dist/: Inicio, siete páginas comerciales, once fichas de productos y siete páginas históricas. Además se genera 404.html, sitemap.xml y robots.txt.

## Archivos creados

- data/categories.json, data/products.json y data/projects.json: catálogo centralizado.
- templates/site.mjs: componentes y páginas; templates/legacy/: siete fuentes originales completas.
- scripts/catalog.mjs, validate.mjs, build.mjs, serve.mjs y optimize-images.ps1.
- assets/css/site.css y legacy.css; assets/js/site.js.
- assets/images/catalog/: doce copias optimizadas y manifest.json.
- assets/images/products/: ubicaciones reservadas para las seis portadas faltantes, sin imágenes ficticias.
- tienda/, libros-infantiles/, guias-practicas/, educacion-ia/, disenos-digitales/, apps-y-juegos/, links/ y once carpetas bajo productos/.
- tests/build.test.mjs, catalog.test.mjs, client.test.mjs, commercial.test.mjs y routes.test.mjs.
- package.json, .gitignore, README.md, documentación y archivos SEO.

## Archivos existentes modificados

- index.html: nueva portada comercial, conservando las anclas productos, tecnologia, nosotros y contacto.
- studio/index.html y studio/safari-baby/index.html: integración con el catálogo, navegación móvil, imágenes optimizadas, accesibilidad, metadatos y aviso sobre datos históricos.
- astria/index.html, astria/privacidad/index.html y astria/soporte/index.html: navegación, accesibilidad y metadatos; contenido y destinos conservados.
- biblia-viva/index.html y biblia-viva/privacidad/index.html: navegación, accesibilidad y metadatos; enlace visible a privacidad.

## Comportamiento comercial

Solo una oferta con URL válida, verification: verified, fecha y fuente de evidencia puede generar un botón de compra. Ocho URLs están confirmadas por el propietario para Halloween ES/EN, Alzheimer e IA para docentes ES/EN. Su comprobación HTTP independiente sigue pendiente. Los precios proporcionados se identifican como referencia y no se publican como ofertas de precio final en JSON-LD. Las páginas originales conservan enlaces y precios existentes con un aviso; no se los presenta como verificados.

Sin JavaScript funcionan el contenido, todas las páginas y categorías, la navegación móvil nativa, los enlaces de compra verificados y compartir por email/enlace permanente. Los filtros y Web Share/portapapeles son mejoras progresivas. No se instalaron rastreadores ni pagos propios.

## Validación

El comando npm.cmd run check ejecuta validación del catálogo, generación de dist/, auditoría del paquete y pruebas Node. Las pruebas incluyen entradas inválidas, prevención de inyección en HTML/JSON-LD, enlaces pendientes, soporte de plataformas, rutas/anclas/activos, dimensiones de imágenes, metadatos, generación repetible, contenido histórico, filtros, compartir y servidor HTTP.

Se verificó la conservación de CNAME, las doce imágenes originales y las referencias de main. No se alteraron DNS, Pages ni configuración remota.

Limitaciones: no había navegador disponible para revisión visual, Lighthouse o pruebas con lector de pantalla. Las pruebas de filtros y compartir usan el código real en un entorno DOM simulado; no sustituyen una prueba de navegador. No se pudieron comprobar tiendas, APK ni despliegue público por las restricciones de acceso del entorno.

## Antes de publicar

1. Revisar visualmente Inicio, catálogo, fichas, enlaces y las páginas históricas, en escritorio y móvil.
2. Verificar las URLs de compra, edición, idioma y precio; completar los datos pendientes y regenerar.
3. Confirmar la fuente real de GitHub Pages y el último commit publicado.
4. Ejecutar npm.cmd run check en la rama de trabajo y revisar el diff.
5. Solicitar autorización explícita para merge/publicación. Mantener identificado el commit anterior para revertir si hiciera falta.

## Actualización comercial del 8 de octubre de 2026

Se conservó el ID y la ruta ia-para-maestros para la edición española (título actualizado a IA para docentes · Español). Se añadió ai-for-teachers-en y ambas ediciones comparten group: ia-para-docentes. Los cinco productos indicados por el propietario se destacan en /links/ mediante linksFeatured. Los otros productos y los seis proyectos permanecen sin cambios en sus datos.

En la actualización comercial anterior, validación, build y las 30 pruebas pasaron, incluida la correspondencia exacta de URLs/idiomas/precios, los botones generados, la ausencia de botones sin URL y la separación entre confirmación del propietario y comprobación HTTP.

## Aislamiento de publicación

El generador ahora produce exclusivamente dist/. La raíz conserva las salidas anteriores y las fuentes, pero no se publica. scripts/public-output.mjs define la lista de recursos permitidos y scripts/validate-dist.mjs comprueba contenido, rutas y ausencia de archivos internos. El servidor local y las pruebas de rutas/comercio utilizan dist/.

Se añadieron tests/dist.test.mjs y tests/workflow.test.mjs: detección de filtraciones, secretos, enlaces rotos, limpieza de archivos obsoletos, paquete autónomo y guardas de despliegue. El workflow .github/workflows/pages.yml valida la rama de trabajo y pull requests, y solo sube/despliega dist/ desde main. dist/ se ignora en Git.

README.md y docs/DESPLIEGUE.md describen el uso local, la transición autorizada a GitHub Actions y los límites. No se cambió la configuración remota ni se ejecutaron operaciones de publicación.

Resultado final de esta entrega: npm.cmd run check terminó con código 0; 40 pruebas aprobadas, 0 fallidas y 0 omitidas. dist/ contiene 46 archivos públicos (aproximadamente 2 MB), con 26 páginas indexables más 404. Se probó una copia del paquete fuera del repositorio y los endpoints de desarrollo devolvieron 404. La rama main conserva el commit 5959a21d0378275a998aa2612baacf27f2e12b94.
