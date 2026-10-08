# Ejecutar desde cualquier ubicación. Conserva todos los originales.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$sourceDir = Join-Path $projectRoot 'studio/safari-baby/images'
$targetDir = Join-Path $projectRoot 'assets/images/catalog'
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)
$results = @()
Get-ChildItem -LiteralPath $sourceDir -File | Where-Object { $_.Extension -in '.png', '.jpg' } | ForEach-Object {
  $source = [System.Drawing.Image]::FromFile($_.FullName)
  try {
    $width = [Math]::Min(800, $source.Width)
    $height = [int][Math]::Round($source.Height * $width / $source.Width)
    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.Clear([System.Drawing.Color]::FromArgb(250,247,242))
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.DrawImage($source, 0, 0, $width, $height)
      $dest = Join-Path $targetDir ($_.BaseName + '.jpg')
      $bitmap.Save($dest, $encoder, $parameters)
      $results += @{ source = $_.Name; file = ($_.BaseName + '.jpg'); width = $width; height = $height; bytes = (Get-Item -LiteralPath $dest).Length }
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
  } finally { $source.Dispose() }
}
$parameters.Dispose()
$results | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $targetDir 'manifest.json') -Encoding utf8
Write-Output ('Optimized ' + $results.Count + ' images; originals preserved.')
