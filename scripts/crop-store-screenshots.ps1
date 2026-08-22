# Center-crop + resize documentation screenshots to Chrome Web Store's
# required 1280x800 (no alpha channel). Run from repo root:
#   powershell -File scripts/crop-store-screenshots.ps1
Add-Type -AssemblyName System.Drawing

$targetW = 1280
$targetH = 800
$targetRatio = $targetW / $targetH

$srcDir = Join-Path $PSScriptRoot "..\docs\screenshots"
$outDir = Join-Path $PSScriptRoot "..\store\screenshots"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$picks = @(
    @{ src = "03-playing-highlight-hovered.png"; out = "01-playing-highlight.png" },
    @{ src = "08-trigger-hover-hovered.png";     out = "02-selection-trigger.png" },
    @{ src = "04-settings-panel-hovered.png";    out = "03-settings-panel.png" },
    @{ src = "05-voice-picker-hovered.png";      out = "04-voice-picker.png" },
    @{ src = "06-speed-picker-hovered.png";      out = "05-speed-picker.png" }
)

foreach ($p in $picks) {
    $srcPath = Join-Path $srcDir $p.src
    $outPath = Join-Path $outDir $p.out

    $img = [System.Drawing.Image]::FromFile($srcPath)
    $srcRatio = $img.Width / $img.Height

    if ($srcRatio -gt $targetRatio) {
        # too wide — crop width, keep full height
        $cropH = $img.Height
        $cropW = [int]($img.Height * $targetRatio)
    } else {
        # too tall — crop height, keep full width
        $cropW = $img.Width
        $cropH = [int]($img.Width / $targetRatio)
    }
    $cropX = [int](($img.Width - $cropW) / 2)
    $cropY = [int](($img.Height - $cropH) / 3)  # bias crop toward the top third (widget lives near top)

    $bmp = New-Object System.Drawing.Bitmap $targetW, $targetH
    $bmp.SetResolution($img.HorizontalResolution, $img.VerticalResolution)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.Clear([System.Drawing.Color]::White)  # flatten — no alpha in output
    $srcRect = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH
    $dstRect = New-Object System.Drawing.Rectangle 0, 0, $targetW, $targetH
    $g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $img.Dispose()

    # Save as 24-bit PNG (no alpha)
    $flat = [System.Drawing.Bitmap]::new($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $g2 = [System.Drawing.Graphics]::FromImage($flat)
    $g2.DrawImage($bmp, 0, 0)
    $g2.Dispose()
    $bmp.Dispose()

    $flat.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $flat.Dispose()

    Write-Host "OK $($p.out)"
}
