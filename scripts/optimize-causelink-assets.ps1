# Deriva recursos del original oficial, sin recortes ni reconstruir el logo.
param([string]$Source, [string]$WebOutput, [string]$AdaptiveOutput)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$image=[System.Drawing.Image]::FromFile($Source)
try {
 foreach($item in @(@{Size=256;Content=256;Path=$WebOutput},@{Size=1024;Content=432;Path=$AdaptiveOutput})) {
  if (-not $item.Path) { continue }
  $bitmap=New-Object System.Drawing.Bitmap($item.Size,$item.Size)
  $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
  try {
   $graphics.Clear([System.Drawing.Color]::Transparent)
   $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
   $offset=($item.Size-$item.Content)/2
   $graphics.DrawImage($image,$offset,$offset,$item.Content,$item.Content)
   $bitmap.Save($item.Path,[System.Drawing.Imaging.ImageFormat]::Png)
   Write-Output ($item.Path + ': '+(Get-Item -LiteralPath $item.Path).Length+' bytes')
  } finally { $graphics.Dispose();$bitmap.Dispose() }
 }
} finally { $image.Dispose() }
