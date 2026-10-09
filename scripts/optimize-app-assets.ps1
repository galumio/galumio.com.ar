# Optimiza copias locales; no accede ni modifica los proyectos móviles.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetRoot = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets/images/apps/astria'
$items = @(@{ Source='icon.png'; Target='icon.png'; Width=256 }, @{ Source='feature_graphic_1024x500.png'; Target='banner.jpg'; Width=1024 })
foreach ($item in $items) {
  $source = [System.Drawing.Image]::FromFile((Join-Path $assetRoot ('originals/' + $item.Source)))
  try {
    $width = [Math]::Min($item.Width, $source.Width)
    $height = [int][Math]::Round($source.Height * $width / $source.Width)
    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.DrawImage($source, 0, 0, $width, $height)
      $target = Join-Path $assetRoot $item.Target
      if ($item.Target.EndsWith('.jpg')) {
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
        try {
          $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)
          $bitmap.Save($target, $encoder, $parameters)
        } finally { $parameters.Dispose() }
      } else { $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png) }
      Write-Output ($item.Target + ': ' + $width + 'x' + $height + ', ' + (Get-Item -LiteralPath $target).Length + ' bytes')
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
  } finally { $source.Dispose() }
}
