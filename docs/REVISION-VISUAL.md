# Revisión visual del catálogo

Rama: feature/galumio-mejoras-visuales. Las siete portadas faltantes fueron incorporadas con autorización del propietario. Los doce productos del catálogo tienen imagen.

## Portadas incorporadas

Cada carpeta assets/images/products/<id>/ contiene cover.jpg (copia exacta del original) y cover-web.jpg (JPEG optimizado a 800 px de ancho, calidad 82). Se comprobaron hashes SHA-256 de las copias contra los originales externos antes y después de optimizar. Ningún original fue modificado.

| Producto / carpeta | Fuente en el proyecto Libros | Tamaño web | Bytes |
|---|---|---|---|
| safari-baby-halloween-es | historias de hallowen/2_Espanol/Etsy_Payhip/Safari_Baby_Cuentos_de_Halloween_ES_Cover_2000x3200.jpg | 800 × 1280 | 174632 |
| safari-baby-halloween-en | historias de hallowen/1_English/Etsy_Payhip/Safari_Baby_Halloween_Stories_EN_Cover_2000x3200.jpg | 800 × 1280 | 173962 |
| cuidar-alzheimer-demencia | alzeimer/libro/3_KDP_Portada_ebook.jpg | 800 × 1200 | 160680 |
| ia-para-maestros | IA para maestros/español/IA_para_docentes_KDP_ES_cover.jpg | 800 × 1280 | 65192 |
| ai-for-teachers-en | IA para maestros/ingles/AI_for_Teachers_KDP_EN_cover.jpg | 800 × 1280 | 61110 |
| safari-baby-cuentos-para-dormir-es | historias para dormir/kdp/2_Espanol/Kindle/Safari_Baby_Cuentos_para_Dormir_ES_Kindle_Cover.jpg | 800 × 1280 | 151153 |
| safari-baby-bedtime-stories | historias para dormir/kdp/1_English/Kindle/Safari_Baby_Bedtime_Stories_EN_Kindle_Cover.jpg | 800 × 1280 | 148283 |

Las siete imágenes optimizadas fueron inspeccionadas visualmente: títulos e idiomas correctos, contenido completo y personajes sin cambios. Las proporciones se conservan con el redondeo a píxeles enteros (Alzheimer: original 1707 × 2560, web 800 × 1200). No se usaron capturas de páginas ni se generaron portadas.

## Portadas anteriores

Se conservan Leo ES, Leo EN, bundle bilingüe, Activity Book y el único pack de 12 animales.

## Generación y verificación

Regenerar las siete copias con powershell -NoProfile -ExecutionPolicy Bypass -File scripts/optimize-product-covers.ps1. Luego ejecutar npm.cmd run check. El catálogo suministra las imágenes a tarjetas, fichas y Open Graph. Solo las copias web se incluyen en dist; los originales nuevos no se publican.

Los precios, enlaces comerciales, estados, rutas históricas, privacidad, soporte, CNAME y workflow permanecen sin cambios. Se conservan las mejoras previas de tarjetas, fichas y /links/.

No falta material gráfico para las portadas actuales. No hay navegador disponible para certificar una revisión renderizada del sitio; las imágenes se inspeccionaron directamente y el CSS mantiene object-fit:contain sin recortes.
