# Tight crops isolating the widget/panel from raw doc screenshots, for use
# on the landing page (hero + gallery) instead of full-page shots.
Add-Type -AssemblyName System.Drawing

$srcDir = Join-Path $PSScriptRoot "..\docs\screenshots"
$outDir = Join-Path $PSScriptRoot "..\landing"

function Crop($srcName, $outName, $x, $y, $w, $h) {
    $img = [System.Drawing.Image]::FromFile((Join-Path $srcDir $srcName))
    $bmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $srcRect = New-Object System.Drawing.Rectangle $x, $y, $w, $h
    $dstRect = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $img.Dispose()
    $outPath = Join-Path $outDir $outName
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "OK $outName ($w x $h)"
}

Crop "03-playing-highlight-hovered.png" "hero.png"              552  0   1168 270
Crop "08-trigger-hover-hovered.png"     "gallery-trigger.png"   480  520 900  200
Crop "04-settings-panel-hovered.png"    "gallery-settings.png"  1080 0   1078 260
Crop "05-voice-picker-hovered.png"      "gallery-voices.png"    1240 0   918  350
