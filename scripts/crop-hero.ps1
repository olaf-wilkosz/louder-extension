# Tight crop isolating the widget + live highlight from the raw doc
# screenshot, so the product UI dominates the landing page hero instead
# of being a small detail in a full-page shot.
Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot "..\docs\screenshots\03-playing-highlight-hovered.png"
$out = Join-Path $PSScriptRoot "..\landing\hero.png"

$img = [System.Drawing.Image]::FromFile($src)

# Crop to title + first paragraph (has the live word highlight) + widget bar,
# cutting out both sidebars and the whitespace-heavy lower page.
$cropX = 552; $cropY = 0; $cropW = 1168; $cropH = 270

$bmp = [System.Drawing.Bitmap]::new($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH
$dstRect = New-Object System.Drawing.Rectangle 0, 0, $cropW, $cropH
$g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$img.Dispose()

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "OK hero.png ($cropW x $cropH)"
