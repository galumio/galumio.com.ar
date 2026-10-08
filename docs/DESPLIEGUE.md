# Despliegue seguro de Galumio Studio

Estado: preparado localmente en feature/galumio-tienda, sin commit, push, merge, cambio de Settings → Pages, DNS ni publicación. No ejecutar los pasos de activación sin autorización explícita del propietario.

## Fuente y salida

- Fuentes: data/, templates/, scripts/, assets/ y CNAME.
- Único paquete publicable: dist/. El generador no escribe en las páginas de la raíz.
- dist/ se elimina y reconstruye dentro del repositorio con comprobación del destino y rechazo de symlinks/junctions/hardlinks. No se admiten destinos alternativos para la limpieza.
- La copia utiliza una lista permitida: estilos públicos conocidos, JavaScript del navegador e imágenes web de manifest/catálogo. No usa copia recursiva del repositorio ni de assets/.
- La lista de salida se valida exactamente, incluidas carpetas vacías, referencias internas sensibles a mayúsculas, anclas, imágenes, sitemap, CNAME y patrones de secretos/rutas locales.
- No se publican data/, templates/, scripts/, tests/, docs/, .github/, dependencias, README, package.json, manifest.json, mapas de fuentes ni originales de imágenes. Los originales permanecen intactos en el repositorio; las páginas históricas utilizan copias optimizadas.
- Se conservan las 26 rutas indexables y la página 404, incluidas las siete páginas históricas, privacidad, soporte y las once fichas. Las URL antiguas de archivos originales de imagen no forman parte del nuevo paquete; las páginas utilizan /assets/images/catalog/.
- Los HTML históricos que quedaron en la raíz no son la salida activa. No publicarlos como alternativa a dist/.

## Probar localmente

Requisito: Node.js 22+; CI usa Node.js 24. Sin dependencias npm.

```powershell
npm.cmd run check
npm.cmd run serve
```

Abrir http://127.0.0.1:4173. El servidor solo sirve dist/. También puede copiarse esa carpeta a cualquier hosting estático; no necesita archivos de la raíz ni un servidor Node en producción.

npm.cmd run validate:dist comprueba una salida ya construida. npm.cmd run preview es un alias de serve y no publica. No abrir file://: las rutas públicas son absolutas respecto del dominio.

## Workflow preparado

Archivo: .github/workflows/pages.yml. JSON compatible con YAML, analizable en las pruebas sin dependencias.

| Evento/ref | Validación y pruebas | Subida del artefacto | Despliegue |
|---|---|---|---|
| Push a feature/galumio-tienda | Sí | No | No |
| Pull request hacia main | Sí | No | No |
| Push a main | Sí | Sí, solo dist/ | Sí, si build pasa |
| Ejecución manual desde main | Sí | Sí, solo dist/ | Sí, si build pasa |
| Ejecución manual desde otra rama | Sí | No | No |

La condición se aplica tanto al paso upload-pages-artifact como al trabajo deploy: ref exacta refs/heads/main y evento push o workflow_dispatch. No se usa pull_request_target. El despliegue depende de build; no puede continuar si fallan catálogo, construcción, auditoría o pruebas.

Permisos globales vacíos. build únicamente tiene contents: read, checkout no persiste credenciales y setup-node desactiva caché automática. deploy únicamente tiene pages: write e id-token: write, usa github-pages y no hace checkout. La acción configure-pages tiene enablement: false: no se utiliza para activar o reconfigurar Pages automáticamente. No se utilizan PAT ni secretos añadidos.

El workflow carga únicamente dist/. No usa path: . ni sube el repositorio. La exclusión no depende de robots.txt o de una denegación del servidor local. .nojekyll se incluye en la salida para evitar interpretación de fuentes; la publicación por artefacto no necesita Jekyll.

## Transición posterior a la autorización

1. Revisar los cambios y la vista local, confirmar las 40 pruebas y la auditoría del paquete. No confundir este paso con autorización para publicar.
2. Confirmar la configuración actual de Pages y anotar el último despliegue correcto. La lectura de Settings no requiere modificarlo.
3. Crear el commit y subir únicamente feature/galumio-tienda cuando el propietario lo autorice. El workflow de esta rama valida, pero no despliega.
4. Abrir/revisar el pull request hacia main. La configuración actual de Pages aún no se modificó en esta entrega.
5. Antes de integrar main, y solo con autorización para publicar, cambiar Settings → Pages → Source a GitHub Actions. Esto evita que el mecanismo anterior de publicación por rama copie temporalmente la raíz completa. Conservar galumio.com.ar y HTTPS; no modificar DNS si la configuración existente es correcta.
6. Revisar el entorno github-pages y restringir los despliegues a main; mantener las protecciones existentes. Si se requiere aprobación manual de entorno, configurarla en este momento autorizado.
7. Integrar el cambio aprobado en main. El push/merge a main disparará build y deploy. Este paso ya es publicación, no una mera preparación.
8. Revisar la ejecución de Actions y su URL. Si hace falta reintentar, usar workflow_dispatch seleccionando main; no cambiar los filtros para desplegar una rama de trabajo.
9. Comprobar HTTPS, CNAME, Inicio, Tienda, Links, ocho botones comerciales, privacidad y soporte. Confirmar 404 para /templates/legacy/studio/safari-baby/, /data/products.json, /scripts/serve.mjs, /docs/IMPLEMENTACION.md y /package.json.

Si la configuración real difiere de este procedimiento, detener la activación y revisarla antes de integrar. No publicar primero desde main/(root) para cambiar la fuente después.

## Reversión

Conservar el commit del último despliegue correcto. Ante un problema, revertir el cambio aprobado mediante un nuevo commit en main y volver a ejecutar las validaciones/despliegue con autorización. No volver a publicar la raíz del repositorio como solución temporal: reabriría la exposición de fuentes. Si el commit anterior no tiene este workflow, preparar y validar un artefacto seguro antes de cualquier reversión de infraestructura.

## Riesgos y verificaciones pendientes

- No se ha ejecutado CI ni desplegado en GitHub durante esta entrega. La sintaxis/estructura del workflow y sus condiciones se prueban localmente, pero permisos reales, políticas de Actions, entorno y Settings requieren comprobación remota posterior.
- La revisión visual en navegador sigue pendiente. Las pruebas HTTP y DOM simulado no sustituyen esa revisión.
- Las URLs comerciales fueron proporcionadas por el propietario. No se afirma una comprobación HTTP independiente; los precios siguen siendo de referencia.
- Los filtros de secretos son una defensa adicional, no una garantía de detectar toda información sensible posible. Las fuentes siguen visibles en GitHub si el repositorio es público, aunque no estén en el sitio.
- Las acciones oficiales se fijan por versión mayor; revisar sus actualizaciones antes de una futura publicación según la política del repositorio.

## Referencias oficiales

- [Workflows personalizados de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Fuente de publicación](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [upload-pages-artifact](https://github.com/actions/upload-pages-artifact)
- [deploy-pages](https://github.com/actions/deploy-pages)
