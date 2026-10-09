# Apps y juegos — auditoría del 9 de octubre de 2026

Base: origin/main 0af4cd0. Rama: feature/galumio-apps.

## Fuentes revisadas

- Biblia Viva: proyecto local proyectos/biblia/biblia-viva. app.json identifica Biblia Viva 1.0.0 y su icon.png. Código de lectura, favoritos, versículo del día, texto a voz, historias y descargas; traducciones ES/EN. Existe Biblia Viva-Preview.apk. Versión Android generada y pruebas cerradas de Google Play pendientes, según el propietario. No se consultó Play Console ni se ejecutó la app.
- Astria: proyecto móvil original C:/Users/gbeltram/astria. Expo 57, React Native, TypeScript, Astronomy Engine y almacenamiento local. app.json/package.json indican versión de código 3.1.0, no una publicación confirmada. src/app/index.tsx conecta cartas natales, perfiles, horóscopo, tránsitos, compatibilidad entre cartas, oráculo local e informes PDF. Servicios astroEngine, profileStorage, horoscopeService, synastryAndTransits, aiService y pdfReportService respaldan esas funciones. El oráculo usa respuestas simbólicas locales, no IA remota. No se anuncian compras, anuncios ni funciones premium. La documentación histórica y los paquetes beta 3.0.1 no acreditan la disponibilidad actual.
- CauseLink: proyecto móvil original C:/Users/gbeltram/causelink. Expo 57, React Native, TypeScript, Expo Router, AsyncStorage y react-native-health-connect. app.json, src/app y src/services contienen registros de síntomas, alimentación y sueño, línea de tiempo, conexión, sincronización y visualización de datos de Health Connect. Insights y experimentos no ofrecen análisis automático completo. El README deja pendiente validación manual de Fase 3C; la confirmación posterior del propietario indica que fue validada en Android. Esta evidencia se atribuye al propietario, no a pruebas automáticas ni a esta auditoría. Publicación comercial sin confirmar.

Las ubicaciones anteriores con paquetes Android de Astria o un entorno Python de CauseLink no eran los proyectos móviles originales. Ambos códigos fuente ya fueron localizados. La revisión de funciones es estática: no certifica su funcionamiento en un dispositivo.

## Recursos gráficos y procedencia

- Biblia Viva: ícono original de biblia/biblia-viva/assets/images/icon.png, 1024 × 1024. Se conserva su copia web PNG 256 × 256 en assets/images/apps/biblia-viva/icon.png.
- Astria: C:/Users/gbeltram/astria/assets/icon.png (1024 × 1024) y assets/feature_graphic_1024x500.png (1024 × 500), inspeccionados visualmente. Copias completas en assets/images/apps/astria/originals/. Fuentes externas sin modificaciones.
- Versiones web de Astria: assets/images/apps/astria/icon.png, 256 × 256, 28115 bytes; banner.jpg, 1024 × 500, 22367 bytes. Generación reproducible con scripts/optimize-app-assets.ps1 desde las copias locales, sin recortes ni deformaciones. El banner está identificado como imagen promocional y se usa también en Open Graph.
- CauseLink: identidad oficial proporcionada posteriormente en C:/Users/gbeltram/causelink/branding/causelink_icon_concept_1024.png. Copia original en assets/images/apps/causelink/originals/icon.png y versión web 256 × 256 en assets/images/apps/causelink/icon.png. Reemplaza la inicial tipográfica. El banner conceptual se revisó pero no se publica: muestra pantallas ilustrativas y mensajes de patrones que no deben interpretarse como funciones disponibles. Los recursos genéricos de Expo no se utilizan.
- No se encontraron capturas reales verificadas de estas aplicaciones. Los banners e ilustraciones no se presentan como capturas.

## Implementación y salida pública

Solo Biblia Viva, Astria y CauseLink son públicos. NexusCore, Stack Overdrive y El Camino Ciego permanecen en data/projects.json con public:false; no se borran proyectos ni archivos originales.

Fichas en /astria/, /biblia-viva/ y /causelink/. Se conservan anclas históricas, privacidad y soporte; templates/legacy permanece intacto. No se incluyen descargas, precios ni valoraciones de apps. Los recursos optimizados están en la lista explícita de dist; las copias originales, scripts y documentación quedan fuera. Se conservan los 12 productos, sus portadas y los 14 enlaces comerciales.

## Verificación y pendientes

Ejecutar npm.cmd run check y git diff --check. Las pruebas incluyen visibilidad de proyectos, rutas históricas, enlaces internos, recursos, salida segura, versión de código frente a publicación, procedencia de validación y banner separado de capturas.

Pendiente: confirmar versión distribuida y enlaces oficiales de Astria/CauseLink; obtener capturas reales aprobadas; confirmar su política de privacidad antes de ofrecer descargas; completar pruebas cerradas de Biblia Viva. No se verificó UI renderizada en navegador ni se ejecutaron aplicaciones móviles en esta revisión.

Resultado ejecutado: npm.cmd run check completó correctamente validación, build, validación de dist y 53 pruebas (0 fallos). Se generaron 28 páginas más 404 y 58 archivos públicos permitidos. git diff --check sin errores. Catálogo de productos idéntico al inicio de esta actualización y hashes SHA-256 de ambos recursos externos sin cambios. Copias optimizadas inspeccionadas visualmente.

Actualización de identidad CauseLink: ver docs/CAUSELINK-IDENTIDAD.md. El control posterior mantiene 53 pruebas aprobadas y aumenta la salida a 59 archivos públicos al añadir el ícono oficial.

## Biblia interactiva para niños — presentación familiar

Revisado el código de C:/Users/gbeltram/OneDrive - TMA/Escritorio/proyectos/biblia/biblia-viva, sin modificarlo. src/app/ninos.tsx habilita las seis historias y enlaza sus pantallas. En src/app/ se revisaron creacion.tsx (arrastrar elementos del cielo y animales), arca-noe.tsx (parejas y juego del arca), moises-mar-rojo.tsx (caminos y separar aguas), david-goliat.tsx (buscar piedras y honda), buen-samaritano.tsx (entregar ayudas y elegir respuestas a situaciones) y nacimiento-jesus.tsx (camino a Belén y preparar pesebre). Las pantallas conectan controles, estado y respuestas; también contienen preguntas, Speech.speak y guardado de progreso/estrellas. La revisión es de código, no una validación en dispositivo.

Se actualizan data/projects.json, templates/site.mjs, assets/css/site.css, scripts/catalog.mjs y tests/apps.test.mjs. La tarjeta destaca lectura, audio y sección infantil; la ficha contiene “Biblia interactiva para niños” con las seis historias. No se agregan funciones futuras, edades recomendadas ni descargas. Ícono, estado de pruebas cerradas, privacidad y rutas conservados. Astria, CauseLink y catálogo comercial sin modificaciones en esta actualización.
