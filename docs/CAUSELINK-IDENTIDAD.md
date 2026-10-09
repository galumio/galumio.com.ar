# Identidad oficial de CauseLink — 9 de octubre de 2026

## Alcance y originales

Fuentes autorizadas: C:/Users/gbeltram/causelink/branding/causelink_icon_concept_1024.png (1024 × 1024, 725270 bytes) y causelink_banner_concept_1920x1024.png. Ambos se inspeccionaron visualmente y sus SHA-256 permanecen intactos. El banner no se copia al sitio: sus pantallas son conceptuales y contiene mensajes sobre patrones que no acreditan funciones disponibles.

## Archivos de CauseLink modificados por esta tarea

- app.json: icon apunta a ./assets/images/causelink-icon.png; adaptiveIcon.foregroundImage apunta a ./assets/images/causelink-adaptive-foreground.png; fondo #043653; se elimina la referencia monocromática genérica de Expo. El plugin de splash conserva opciones y cambia únicamente su imagen por el ícono oficial.
- assets/images/causelink-icon.png: copia exacta del original autorizado, 1024 × 1024.
- assets/images/causelink-adaptive-foreground.png: lienzo transparente 1024 × 1024 con el original completo centrado a 432 × 432, sin recortes. 391603 bytes.

El margen conservador mantiene toda la imagen dentro del círculo seguro central de 66/108, incluso sus esquinas. Es una adaptación raster: el original ya contiene fondo y esquinas blancas. No se inventó una separación del símbolo ni una silueta monocromática. Para una presentación nativa más grande y limpia, solicitar al diseñador el símbolo oficial transparente y una variante monocromática. Mientras tanto se usa el ícono a color.

Se conserva nombre CauseLink, versión 1.0.0, identificador com.galumio.causelink. No se agrega versionCode a app.json, donde no estaba declarado. android/app/build.gradle mantiene versionCode 1 y versionName 1.0.0. Comparación estructural de app.json confirma que el resto de la configuración permanece idéntico, incluidos permisos, plugins Health Connect y opciones de almacenamiento. No se editaron src/, dependencias ni proyectos Android generados. Los cambios previos del usuario permanecen intactos.

## Archivos de Galumio modificados por esta tarea

Rama feature/galumio-apps.

- data/projects.json: ícono oficial de CauseLink y texto alternativo; sin cambios de funciones o disponibilidad.
- assets/images/apps/causelink/originals/icon.png: copia exacta de referencia; excluida de dist por la lista pública.
- assets/images/apps/causelink/icon.png: PNG 256 × 256, 141407 bytes, sin recortes.
- scripts/optimize-causelink-assets.ps1: derivación reproducible por escalado y margen transparente. Parámetros Source, WebOutput y AdaptiveOutput. Para reproducir ambos recursos, pasar como Source el original copiado en Galumio, WebOutput el icon.png web y AdaptiveOutput la ubicación autorizada de causelink-adaptive-foreground.png en CauseLink.
- tests/apps.test.mjs: exige ícono oficial en tarjeta, ficha y Open Graph; conserva atribución al propietario y ausencia de banner conceptual.
- docs/APPS-AUDITORIA.md: procedencia actualizada.
- docs/CAUSELINK-IDENTIDAD.md: este informe.

No fue necesario cambiar las plantillas: tarjeta, ficha y Open Graph utilizan el recurso del catálogo. dist se regeneró y permanece ignorado por Git. Los cambios de otras fichas ya presentes en la rama no forman parte de esta actualización.

## Validación ejecutada

CauseLink: npm.cmd run lint, node node_modules/typescript/bin/tsc --noEmit, npm.cmd test (181 pruebas aprobadas), y node node_modules/expo/bin/cli config --type public --json: todos completaron con código 0. git diff --check -- app.json sin errores.

Galumio: npm.cmd run check aprobado (validación, build, validación de dist y 53 pruebas). 28 páginas más 404, 59 archivos públicos permitidos. git diff --check sin errores. data/products.json idéntico byte a byte al inicio: 12 productos, portadas y 14 enlaces conservados. NexusCore, Stack Overdrive y El Camino Ciego siguen ocultos, comprobado por tests.

## Antes de una próxima compilación o publicación

No se generó APK/AAB, no se ejecutó prebuild, no se instaló ni reinstaló la app, no se accedió a datos del teléfono. No hubo commit, push, merge ni publicación; DNS y GitHub Pages intactos.

La carpeta android existente conserva recursos generados anteriores. Está excluida por .gitignore y .easignore. Al autorizar un próximo build EAS, comprobar que se genere desde app.json y los plugins conservados. Para una futura compilación local se deberá sincronizar antes el proyecto nativo; no compilar directamente los recursos antiguos. No ejecutar prebuild --clean sin revisar las personalizaciones nativas existentes. El cambio de ícono no aparece en una aplicación ya instalada hasta una nueva compilación e instalación autorizadas.

Pendiente revisión del ícono y splash en dispositivo con máscaras circular y redondeada; no se afirma validación visual Android ni del sitio en navegador. Para publicar, confirmar capturas reales y enlaces oficiales. No se anuncian funciones médicas, detección automática de patrones ni descargas públicas.

Referencias consultadas: https://docs.expo.dev/versions/v57.0.0/config/app/ y https://developer.android.com/develop/ui/compose/system/icon_design_adaptive.
