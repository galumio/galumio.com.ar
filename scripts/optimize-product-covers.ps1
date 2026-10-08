# Copias web de las portadas originales incorporadas al catálogo. No altera originales.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$products = Get-Content -LiteralPath (Join-Path $projectRoot 'data/products.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
try {
 foreach ($product in $products) {
  if (!$product.image -or $product.image.original -notmatch '^/assets/images/products/[a-z0-9-]+/cover.jpg$') { continue }
  $originalPath = Join-Path $projectRoot $product.image.original.TrimStart('/')
  $outputPath = Join-Path (Split-Path $originalPath -Parent) 'cover-web.jpg'
  if ($product.image.display -ne $product.image.original.Replace('cover.jpg','cover-web.jpg')) { throw 'Destino web inesperado' }
  $source = [System.Drawing.Image]::FromFile($originalPath)
  try {
   $width = [Math]::Min(800, $source.Width)
   $height = [int][Math]::Round($source.Height * $width / $source.Width)
   if ($width -ne $product.image.width -or $height -ne $product.image.height) { throw 'Dimensiones del catálogo incorrectas' }
   $bitmap = New-Object System.Drawing.Bitmap($width, $height)
   $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
   try {
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($source, 0, 0, $width, $height)
    $bitmap.Save($outputPath, $encoder, $parameters)
    Write-Output ($product.id + ' | ' + $width + 'x' + $height + ' | ' + (Get-Item -LiteralPath $outputPath).Length + ' bytes')
   } finally { $graphics.Dispose(); $bitmap.Dispose() }
  } finally { $source.Dispose() }
 }
} finally { $parameters.Dispose() }
