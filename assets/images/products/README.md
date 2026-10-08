# Imágenes originales pendientes

Cada carpeta corresponde al ID de un producto del catálogo. El archivo esperado es `cover.jpg`, como indica `expectedImage` en `data/products.json`. No se generaron portadas ficticias.

Al recibir una portada: conservar el original, generar una copia web optimizada y completar `image.original`, `image.display`, `image.alt`, `image.width` e `image.height`. No basta con copiar el archivo: el catálogo necesita esos datos para activarlo. Ejecutar `npm run check`.

Las imágenes existentes de Safari Baby permanecen en `/studio/safari-baby/images/`; sus copias web están en `/assets/images/catalog/`. No reemplazar el original por la copia comprimida.
