# Catálogo editorial — 14 de octubre de 2026

Rama feature/galumio-catalogo-descripciones, creada desde origin/main 046372e. Sin commit, push ni publicación. Se conserva el proyecto estático y GitHub Pages desde dist.

## Auditoría inicial

12 productos existentes, 11 con publicación confirmada y un bundle bilingüe pendiente. 14 ofertas verificadas por el propietario. Todos tienen portada, idioma y formato. Muchas descripciones eran una sola frase y siete fichas no tenían detalle de contenido. Los títulos y slugs se conservan para no romper rutas ni confundir ediciones.

| Producto | Publicación | Idioma y formato | Revisión |
|---|---|---|---|
| Safari Baby Halloween · Español | Confirmado por propietario | es · Ebook PDF | Breve; ampliada |
| Safari Baby Halloween · English | Confirmado por propietario | en · Ebook PDF | Breve; ampliada |
| Cuidar a mamá o papá con Alzheimer o demencia | Confirmado por propietario | es · Ebook PDF | Breve; ampliada |
| IA para docentes · Español | Confirmado por propietario | es · Ebook PDF | Breve; ampliada |
| AI for Teachers · English | Confirmado por propietario | en · Ebook PDF | Breve; ampliada |
| Safari Baby: Cuentos para Dormir — Español | Confirmado por propietario | es · Ebook PDF | Breve; ampliada |
| Safari Baby: Bedtime Stories — Inglés | Confirmado por propietario | en · Ebook PDF | Breve; ampliada |
| Safari Baby Animals Watercolor Clipart Bundle | Confirmado por propietario | not-applicable · PNG digital | Breve; ampliada |
| Safari Baby Activity Book | Confirmado por propietario | en · PDF imprimible | Breve; ampliada |
| Leo y el Sendero de las Luciérnagas | Confirmado por propietario | es · Ebook PDF | Ampliada con contexto |
| Leo and the Path of Fireflies | Confirmado por propietario | en · Ebook PDF | Breve; ampliada |
| Leo · Bundle bilingüe | Pendiente | es-en · Ebook PDF | Breve; ampliada |

Categorías públicas conservadas: Libros infantiles, Guías prácticas, Educación e IA y Diseños digitales. Educación y estudio se reserva para el borrador: no se publica una categoría vacía antes de aprobar el nuevo ebook. No se agrega ningún pack adicional de sublimación.

## Evidencia editorial

- Portadas originales de Halloween ES y EN: siete historias en cada edición; revisión independiente de ambas imágenes.
- Portadas de Cuentos para Dormir ES y Bedtime Stories EN: diez cuentos por edición; no se promete mejorar el sueño ni se unifican las ediciones.
- Portadas IA para docentes ES y AI for Teachers EN: más de 50 prompts, planificación y evaluación. No se añaden herramientas específicas, plantillas ni resultados garantizados.
- Portada de Cuidar a mamá o papá: 50 situaciones, cuaderno práctico, comunicación, organización cotidiana y cuidado del cuidador. El contenido se describe como material de lectura, no como tratamiento ni consejo clínico personalizado.
- templates/legacy/studio/safari-baby/index.html y catálogo previo: aventura de Leo después de una tormenta, amistad/cooperación, 47 páginas por edición; Activity Book de 30 actividades; colección única de 12 animales PNG transparentes. docs/METADATOS.md respalda el idioma inglés y PDF imprimible del Activity Book. No se reactivan enlaces pendientes ni precios históricos.
- Los beneficios editoriales describen usos del contenido confirmado, sin testimonios ni promesas de resultados. No se extrajo ni publicó ningún archivo premium.

## Implementación

Cada producto incorpora subtitle, longDescription (párrafos), audience, benefits, tags, seo y editorialSource en data/products.json. La descripción breve sigue alimentando las tarjetas; la ficha agrega bloques de lectura, público y beneficios. Contenido y datos comerciales permanecen separados de las plantillas. Los filtros mantienen categorías, idioma y formato; la búsqueda también considera etiquetas. Se conserva Product sin ofertas inventadas ni valoraciones; metadescripciones y Open Graph usan textos específicos. Las imágenes y sus asociaciones permanecen intactas.

## Cómo estudiar para un final

Borrador en data/drafts.json, separado del catálogo público. Incluye el texto y los diez temas proporcionados por el propietario. No se recibió todavía el archivo original; contentVerification permanece pending-original. Formato final, portada, precio y enlaces de compra sin confirmar. No se presupone PDF premium ni material adicional.

Portada esperada: assets/images/products/como-estudiar-para-un-final/cover.jpg. Proporcionar únicamente una imagen de portada allí; el ebook final debe mantenerse fuera del repositorio público. La vista previa muestra un marcador de posición explícito. No se generó una portada ficticia.

Lectura online gratuita: freeReading.platform = Lumendia; freeReading.url = null. Para activar el enlace de revisión, proporcionar la URL exacta HTTPS de la página, verification = owner-confirmed y verificationSource = owner-provided. Esto solo habilita el enlace en la vista previa: no publica el borrador. No se modificó Lumendia, CauseLink ni Carevia.

Antes de publicar: revisar el original y la portada, confirmar formato, precio y URL comercial, aprobar categoría y descripción; migrar deliberadamente la ficha al catálogo público con el esquema y evidencia correspondientes. El validador rechaza borradores dentro de products.json.

## Vista previa

Ejecutar npm.cmd run preview:review. Escucha únicamente en 127.0.0.1:4180.

- Catálogo: http://127.0.0.1:4180/tienda/
- Ejemplo: http://127.0.0.1:4180/productos/ia-para-maestros/
- Nuevo ebook: http://127.0.0.1:4180/revision/como-estudiar-para-un-final/

El servidor de revisión agrega el borrador solo en memoria, con noindex y sin canonical público ni botones para compartir. No genera archivos de borrador en dist. npm.cmd run serve continúa mostrando exclusivamente dist, sin borradores. Detener la vista previa con Ctrl+C.

## Validaciones anteriores a la exclusión del bundle

58 pruebas aprobadas: rutas, enlaces internos, imágenes, SEO, filtros, generación repetible, aislamiento de dist, estados ocultos, conservación exacta de las ofertas/ediciones y pruebas nuevas del borrador. Catálogo público: 28 páginas más 404, 59 archivos permitidos.

Revisión real en Edge headless: tienda, las 12 fichas y el borrador a 390 y 1280 píxeles (28 comprobaciones). Sin desbordes horizontales ni imágenes rotas. Se ajustó la grilla de detalle para limitar tamaños intrínsecos de portadas. Se inspeccionaron capturas de ficha móvil y borrador de escritorio.

Comprobación HTTP independiente de los 14 enlaces con npm.cmd run check:links: todos respondieron 403 el 14 de octubre. Esta respuesta no demuestra que estén rotos ni acredita disponibilidad comercial. Se requiere revisión manual de las tiendas antes de publicar. No se cambió httpCheckedAt ni la evidencia original del propietario. Las pruebas locales sí verifican que los botones usen las URLs autorizadas, asociadas a los productos correctos.

Los precios, ofertas, estados, portadas y rutas se comparan con tests/fixtures/catalog-preserved.json, una instantánea previa a esta edición. Las aplicaciones y su visibilidad permanecen sin cambios.

Filtros comprobados en navegador: inglés muestra cinco productos; combinado con PDF imprimible muestra Activity Book; Limpiar recupera los doce. git diff --check final sin errores.

## Revisión previa a integración (antes de la última autorización)

Referencias de origin actualizadas: HEAD y origin/main coinciden en 046372e7209d4058fd6b6b64ad0dcbf76436c32d. No hay divergencia que resolver; main local no se modificó. Los cambios siguen sin commit. La integración queda preparada para una autorización posterior, sin merge, push ni despliegue.

Comparación directa con origin/main: sin diferencias en precios/ofertas, imágenes, títulos, slugs, idiomas, formatos, estados, categorías ni enlaces pendientes. Las descripciones se contrastaron nuevamente con la evidencia editorial indicada arriba; esto no equivale a una lectura integral de todos los ebooks.

Nueva ejecución de npm.cmd run check: 58/58 pruebas aprobadas, compilación de producción y validación de dist correctas. git diff --check sin errores. Se verificaron 59 archivos públicos; ningún borrador, data/, docs/, scripts/, templates/ o tests/ forma parte del despliegue. El nuevo ebook no figura en HTML público ni sitemap.

Las mejoras de las doce fichas pueden desplegarse sin publicar el nuevo ebook. De ellas, once tienen publicación confirmada; el bundle bilingüe conserva su ficha informativa pendiente y no habilita compras. No se activan productos nuevos ni proyectos ocultos. No cambian data/projects.json, CNAME ni el workflow. Lumendia, CauseLink y Carevia no reciben modificaciones. Sigue pendiente la comprobación manual de las tiendas por las respuestas HTTP 403 documentadas.

Archivos del cambio: README.md; assets/css/site.css; data/products.json; data/drafts.json; package.json; scripts/build.mjs; scripts/catalog.mjs; scripts/validate.mjs; scripts/check-commercial-links.mjs; scripts/preview-review.mjs; templates/site.mjs; tests/editorial.test.mjs; tests/fixtures/catalog-preserved.json; docs/CATALOGO-EDITORIAL.md.

## Control final de publicación condicionado

La última instrucción del propietario excluye el bundle pendiente: se conservan los 12 registros y sus portadas originales, pero únicamente 11 fichas se generan públicamente. El bundle no aparece en tienda, páginas históricas generadas, sitemap ni recursos de dist. Sus fuentes originales permanecen intactas. NexusCore, Stack Overdrive y El Camino Ciego continúan ocultos.

data/drafts.json es un archivo exclusivamente local, ignorado por Git y excluido de dist. La carga admite su ausencia en CI; las pruebas utilizan un borrador sintético. El ebook nuevo no se subirá a GitHub ni se publicará.

Resultado final: npm.cmd run check aprobado, 59 pruebas, 27 páginas más 404 y 57 archivos públicos. La comparación automatizada conserva precios, ofertas, portadas y estados. La visibilidad del bundle es el único cambio deliberado en su disponibilidad pública. No se modifican proyectos externos, DNS, CNAME ni el workflow.

Los 14 enlaces comerciales respondieron nuevamente HTTP 403. Se conservan sin cambios; la comprobación HTTP no confirma disponibilidad. Por condición expresa del propietario, integración y despliegue quedan detenidos hasta recibir confirmación manual de cada destino y edición. No se creó commit ni se realizó push, merge o despliegue en esta revisión.

## Confirmación externa del propietario y preparación final

El propietario confirmó externamente que los 11 enlaces de Payhip y los 3 de Etsy abren los productos y los idiomas esperados. Se registra como evidencia aportada por el propietario, no como comprobación HTTP independiente del agente. Las 14 URLs y sus metadatos comerciales se conservan exactamente. Las respuestas automáticas 403 dejan de ser un bloqueo de publicación tras esta confirmación.

Alzheimer y demencia: el propietario informa 68 páginas en Payhip y la existencia de una edición de 83 páginas. No está confirmado qué PDF entrega Payhip. La ficha de Galumio no anuncia ninguna de esas cantidades; no se modifica su contenido ni se atribuye una edición concreta. Pendiente: que el propietario compruebe el archivo entregado por Payhip antes de añadir una cantidad de páginas. Esto no bloquea la descripción actual, que no promete extensión ni edición.

Preparación de integración: origin/main actualizado mediante fetch; HEAD y origin/main coinciden, sin divergencia. Tras autorización final: revisar nuevamente referencias, crear commit descriptivo, subir la rama, integrar en main y subir main para activar el workflow existente que publica únicamente dist. Luego comprobar el despliegue y las 11 fichas públicas. No se ejecuta ninguno de esos pasos de publicación en esta revisión. El bundle permanece oculto y el borrador local privado.

Pruebas finales tras la confirmación: npm.cmd run check aprobado (59/59); build de producción, 27 páginas más 404, 57 archivos públicos válidos. Sin cambios en las ofertas, precios, portadas, estados ni proyectos.

## Revisión de coherencia de títulos — 2026-10-22 (histórico, resuelto)

Alcance: revisión previa a publicación de los dos ebooks nuevos en el worktree Galumio-IA-TodosLosDias. No se cambian títulos, slugs, portadas, ofertas ni productos existentes.

| Edición | Título impreso en la portada original | Título del catálogo y SEO antes de la confirmación | Payhip confirmado por el propietario | Precio del catálogo |
| --- | --- | --- | --- | --- |
| Español | IA para el día a día | IA para todos los días | https://payhip.com/b/FmX4P | USD 4,99 |
| Inglés | AI for Everyday Life | Everyday AI | https://payhip.com/b/DvYKc | USD 4,99 |

Evidencia local: los títulos de portada se verificaron visualmente en assets/images/products/ia-para-todos-los-dias/cover.jpg y assets/images/products/everyday-ai/cover.jpg. Antes de añadir esta nota, la búsqueda de los títulos completos de portada no encontró coincidencias en data/, docs/, assets/images/products/ ni tests/. Los títulos comerciales actuales aparecen en data/products.json (title, seo.title y image.alt) y tests/everyday-ai.test.mjs. No se encontraron manuscritos PDF, EPUB o DOCX dentro del worktree revisado. Las portadas son, por tanto, la evidencia editorial original disponible; los nombres de catálogo proceden de las instrucciones del propietario. Everyday AI for Seniors es otro producto y queda fuera de este cambio.

Comprobación externa: se intentó abrir ambas URLs de Payhip con la herramienta web, pero no fueron accesibles. Esto no demuestra que los enlaces estén rotos. No se pudo verificar de forma independiente el título ni el precio visible en Payhip; las asociaciones y los precios se conservan como datos confirmados por el propietario.

Recomendación: adoptar «IA para el día a día» y «AI for Everyday Life» como títulos visibles canónicos en Galumio y Payhip para coincidir con las portadas originales. Antes de cambiar datos, comprobar los títulos visibles de ambas fichas de Payhip y confirmar la decisión editorial. Si Payhip utiliza los nombres actuales del catálogo, alinear también allí los títulos. No hace falta cambiar los enlaces comerciales ni los slugs de Galumio para alinear el título visible. Una actualización posterior deberá abarcar title, seo.title, image.alt y las expectativas de título en las pruebas, conservando las portadas.

No se infieren formatos de descarga, extensión ni materiales adicionales. Esta nota documenta una recomendación; no autoriza ni realiza cambios comerciales externos ni publicación.


## Títulos definitivos confirmados — 2026-10-22

El propietario confirmó «IA para el día a día» (español) y «AI for Everyday Life» (inglés) como títulos comerciales definitivos, en concordancia con las portadas originales y las fichas de Payhip según su confirmación. Se actualizaron title, seo.title, image.alt y las expectativas de las pruebas. Las fichas, tarjetas y metadatos se generan desde el catálogo. La diferencia documentada arriba queda resuelta; los nombres anteriores se mantienen únicamente como historial editorial.

Se conservan los slugs ia-para-todos-los-dias y everyday-ai, los enlaces Payhip FmX4P y DvYKc respectivamente, USD 4,99 en cada oferta, las portadas originales y los quince productos anteriores. No se modifican formatos de descarga ni se atribuyen contenidos adicionales. La confirmación de Payhip procede del propietario; no se afirma una comprobación externa independiente. Publicación pendiente de autorización; sin commit, push ni despliegue.
