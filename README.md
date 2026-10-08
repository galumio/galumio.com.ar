# Galumio Studio

Sitio comercial estático para galumio.com.ar. HTML, CSS y JavaScript progresivo; generador y pruebas con Node.js, sin dependencias npm, backend, pagos propios ni servicios pagos.

## Desarrollo local

Requisito: Node.js 22 o posterior (validado con Node 24.21.0). No hace falta ejecutar npm install.

En PowerShell, desde la raíz del repositorio:

```powershell
npm.cmd run check
npm.cmd run serve
```

Abrir http://127.0.0.1:4173. Detener con Ctrl+C. En macOS/Linux usar npm en lugar de npm.cmd.

Alternativa directa:

```powershell
node scripts/validate.mjs
node scripts/build.mjs
node --test --test-concurrency=1 tests/*.test.mjs
node scripts/serve.mjs
```

El build reconstruye exclusivamente dist/. El servidor escucha únicamente en 127.0.0.1 y sirve dist/, nunca la raíz del repositorio. Usar un servidor local, no abrir index.html con file://, porque las rutas comienzan en la raíz del sitio. No hay observador automático: después de editar datos o plantillas, ejecutar build y recargar.

## Qué editar

| Ubicación | Responsabilidad |
|---|---|
| data/products.json | Productos, idiomas, formatos, imágenes, publicación y tiendas |
| data/projects.json | Proyectos, estado documentado, notas y rutas existentes |
| data/categories.json | Categorías comerciales |
| templates/site.mjs | Estructura visual y componentes compartidos |
| templates/legacy/ | Fuentes completas de las siete páginas anteriores |
| assets/css/site.css | Identidad visual y adaptación móvil del sitio comercial |
| assets/css/legacy.css | Correcciones de navegación y accesibilidad de páginas anteriores |
| assets/js/site.js | Filtros y compartir; contenido y navegación funcionan sin JavaScript |
| scripts/build.mjs | Generación exclusiva de dist/: HTML, sitemap, robots y 404 |
| scripts/public-output.mjs | Lista permitida de archivos públicos, copia y limpieza segura de dist/ |
| scripts/validate-dist.mjs | Auditoría de archivos, rutas, contenido sensible y sitemap del paquete |
| scripts/catalog.mjs | Esquema, validación y utilidades del catálogo |
| scripts/serve.mjs | Servidor local de prueba, no se usa en producción |
| tests/ | Pruebas automatizadas de datos, generación, rutas, HTTP y comportamiento JS |

Los index.html públicos dentro de dist/ son resultados generados: editar sus fuentes y volver a generar. Los HTML que quedaron en la raíz y sus carpetas son salidas anteriores conservadas; el build ya no los modifica ni publica. Las fuentes históricas se conservan completas; el generador aplica las correcciones sin eliminar secciones, privacidad, soporte ni enlaces anteriores.

## Agregar o actualizar productos

1. Agregar un registro en data/products.json con ID y slug únicos, título, descripción, categoría, idioma y formato confirmados. Usar null para los datos desconocidos; publicationStatus es published o unknown, con publicationSource que registre la evidencia.
2. Completar image únicamente con un original existente y una copia optimizada, texto alternativo y dimensiones reales. expectedImage indica la ubicación de una futura portada; no activa una imagen por sí mismo.
3. Agregar una oferta por plataforma: etsy, payhip o amazon. Una URL conocida pero no revisada se guarda con verification: pending, verifiedAt: null y price: null.
4. Para activar el botón, verificar manualmente destino, edición, idioma y disponibilidad. Registrar la URL HTTPS exacta, verification: verified, verifiedAt con fecha YYYY-MM-DD y verificationSource: owner-provided (confirmación del propietario) o independent-review (revisión independiente). La fecha registra esa evidencia y no implica una consulta HTTP: httpCheckedAt permanece null hasta efectuarla. Registrar la evidencia en docs/DATOS-PENDIENTES.md. Nunca inferir una URL por el título.
5. El precio es opcional y específico de cada tienda: amount numérico, currency ISO de tres letras y verifiedAt. Si se desconoce, usar null; no usar 0 como placeholder. Un precio de referencia del propietario lleva kind: reference y source: owner-provided; se muestra como referencia y no genera ofertas de precio en JSON-LD.
6. Para destacar la ficha en /links/, asignar linksFeatured: true; es independiente de featured en Inicio.
7. Ejecutar npm.cmd run check. Revisar la ficha y el enlace de compra antes de publicar.

Las ediciones y bundles tienen fichas diferentes y pueden compartir group. Los proyectos se mantienen separados de los productos vendibles. Los estados beta-recorded y development-recorded describen lo que dice la página anterior, no una comprobación de disponibilidad actual.

Las URLs pendientes nunca generan botones de compra en el nuevo catálogo. El componente permite Etsy, Payhip y Amazon, pero no muestra tiendas sin evidencia. Las imágenes faltantes tienen un bloque textual identificado, no una portada inventada.

Al retirar o cambiar el slug de un producto, decidir si conservar la ficha o preparar una redirección antes de cambiar los datos. dist/ se limpia y reconstruye: las fichas retiradas no sobreviven como archivos obsoletos. No eliminar rutas compartidas sin analizar su uso.

## Imágenes

Originales: studio/safari-baby/images/. Copias web: assets/images/catalog/. Los originales no fueron modificados. Las 12 copias JPEG suman aproximadamente 1,72 MB frente a 24,33 MB de originales. El manifest contiene dimensiones y tamaños reales.

scripts/optimize-images.ps1 permite regenerar las copias en Windows con System.Drawing. No es necesario ejecutarlo para probar o construir el sitio: las imágenes web ya están incluidas. Respeta la política de ejecución local; no requiere cambiarla. Para otras plataformas, preparar copias equivalentes sin modificar los originales y actualizar sus dimensiones.

Nuevas portadas: assets/images/products/{id}/cover.jpg. Ver assets/images/products/README.md.

## Rutas

Nuevas: /tienda/, /libros-infantiles/, /guias-practicas/, /educacion-ia/, /disenos-digitales/, /apps-y-juegos/, /links/ y /productos/{slug}/.

Conservadas: /, /studio/, /studio/safari-baby/, /astria/, /astria/privacidad/, /astria/soporte/, /biblia-viva/ y /biblia-viva/privacidad/. Se conservan las anclas anteriores y las anclas institucionales de Inicio.

## Pruebas y revisión

npm.cmd run check valida el catálogo, genera dist/, audita el paquete público y ejecuta todas las pruebas. npm.cmd run validate:dist vuelve a auditar la salida existente. Se comprueban URLs permitidas, estados, precios, imágenes, escape de HTML/JSON-LD, generación repetible, SEO básico, rutas/anclas, servidor HTTP, filtros, compartir y conservación de secciones antiguas.

La revisión visual manual sigue siendo necesaria: escritorio y móvil (320, 375, 768 y 1440 px), zoom al 200%, teclado, foco, lectores de pantalla, menú nativo, portadas y contraste. Ver docs/IMPLEMENTACION.md para el alcance real de la validación realizada.

## GitHub Pages y publicación

La única salida publicable es dist/. Se genera desde cero mediante una lista explícita de recursos: 26 páginas y 404, tres archivos CSS/JavaScript del navegador, doce imágenes optimizadas, sitemap.xml, robots.txt, CNAME y .nojekyll. No se copian fuentes, documentación, datos, manifiestos, configuración ni dependencias. dist/ está ignorado por Git; se reconstruye en CI sin npm install.

El archivo .github/workflows/pages.yml valida cambios en main, feature/galumio-tienda y pull requests hacia main. Solo una ejecución por push o manual en refs/heads/main puede subir dist/ y desplegarlo. El trabajo build tiene contents: read; el trabajo deploy tiene pages: write e id-token: write y utiliza el entorno github-pages. No hay tokens personales ni credenciales persistidas.

El workflow está escrito en JSON, un subconjunto válido de YAML, para que las pruebas comprueben su estructura sin instalar un parser. GitHub Actions lo carga como pages.yml.

No se ha ejecutado el workflow, publicado ni cambiado Settings → Pages o DNS. La activación futura requiere autorización explícita y seleccionar GitHub Actions como fuente de Pages. No publicar desde la raíz ni desde /docs. CNAME se conserva en la raíz como fuente y se copia intacto a dist/; la configuración del dominio en GitHub también debe conservarse.

Ver [guía de despliegue](docs/DESPLIEGUE.md) para la transición, controles y procedimiento posterior a la autorización.

Este aislamiento protege el sitio de GitHub Pages. Si el repositorio de GitHub es público, su código y documentación siguen siendo visibles en GitHub: no guardar secretos en el repositorio.
