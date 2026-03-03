Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$dataPath = Join-Path $projectRoot "data\artists.json"
$logoPath = Join-Path $projectRoot "assets\kw-wordmark-real.png"
$outputDir = Join-Path $projectRoot "assets\og\artists"

if (-not (Test-Path $dataPath)) {
  throw "artists.json not found: $dataPath"
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$artistsData = Get-Content -Path $dataPath -Raw | ConvertFrom-Json

function New-Color([int]$a, [int]$r, [int]$g, [int]$b) {
  return [System.Drawing.Color]::FromArgb($a, $r, $g, $b)
}

function Draw-Grid([System.Drawing.Graphics]$graphics, [int]$width, [int]$height) {
  $gridPen = New-Object System.Drawing.Pen (New-Color 28 200 32 48), 1
  try {
    for ($x = 0; $x -le $width; $x += 40) {
      $graphics.DrawLine($gridPen, $x, 0, $x, $height)
    }
    for ($y = 0; $y -le $height; $y += 40) {
      $graphics.DrawLine($gridPen, 0, $y, $width, $y)
    }
  } finally {
    $gridPen.Dispose()
  }
}

function Draw-Gradient([System.Drawing.Graphics]$graphics, [int]$width, [int]$height) {
  $leftRect = New-Object System.Drawing.Rectangle 0, 0, [Math]::Floor($width * 0.55), $height
  $leftBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $leftRect, (New-Color 130 120 0 0), (New-Color 10 0 0 0), [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal
  try {
    $graphics.FillRectangle($leftBrush, $leftRect)
  } finally {
    $leftBrush.Dispose()
  }

  $flareRect = New-Object System.Drawing.Rectangle ([Math]::Floor($width * 0.22)), ([Math]::Floor($height * 0.12)), ([Math]::Floor($width * 0.56)), ([Math]::Floor($height * 0.76))
  $flareBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush @([System.Drawing.Point[]]@(
    (New-Object System.Drawing.Point ($flareRect.Left) ($flareRect.Top)),
    (New-Object System.Drawing.Point ($flareRect.Right) ($flareRect.Top)),
    (New-Object System.Drawing.Point ($flareRect.Right) ($flareRect.Bottom)),
    (New-Object System.Drawing.Point ($flareRect.Left) ($flareRect.Bottom))
  ))
  try {
    $flareBrush.CenterColor = New-Color 90 210 22 34
    $flareBrush.SurroundColors = @((New-Color 0 0 0 0), (New-Color 0 0 0 0), (New-Color 0 0 0 0), (New-Color 0 0 0 0))
    $graphics.FillRectangle($flareBrush, $flareRect)
  } finally {
    $flareBrush.Dispose()
  }
}

function Draw-Rift([System.Drawing.Graphics]$graphics, [int]$width, [int]$height) {
  $x = [Math]::Floor($width * 0.5)
  $glowPen = New-Object System.Drawing.Pen (New-Color 64 255 54 66), 5
  $mainPen = New-Object System.Drawing.Pen (New-Color 200 255 38 52), 1
  try {
    $graphics.DrawLine($glowPen, $x, 58, $x, ($height - 58))
    $graphics.DrawLine($mainPen, $x, 58, $x, ($height - 58))
  } finally {
    $glowPen.Dispose()
    $mainPen.Dispose()
  }
}

function Draw-Logo([System.Drawing.Graphics]$graphics, [string]$logoFile) {
  if (-not (Test-Path $logoFile)) { return }
  $logo = [System.Drawing.Image]::FromFile($logoFile)
  try {
    $graphics.DrawImage($logo, 62, 40, 282, 76)
  } finally {
    $logo.Dispose()
  }
}

function Write-ArtistCover([string]$side, [object]$artist) {
  $width = 1200
  $height = 630
  $slug = [string]$artist.slug
  $name = [string]$artist.name
  $headline = [string]$artist.headline
  if ([string]::IsNullOrWhiteSpace($headline)) {
    $headline = [string]$artist.bio
  }
  if ($headline.Length -gt 104) {
    $headline = $headline.Substring(0, 101) + "..."
  }

  $bmp = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bmp)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $graphics.Clear((New-Color 255 2 4 7))

    Draw-Gradient -graphics $graphics -width $width -height $height
    Draw-Grid -graphics $graphics -width $width -height $height
    Draw-Rift -graphics $graphics -width $width -height $height
    Draw-Logo -graphics $graphics -logoFile $logoPath

    $eyebrowFont = New-Object System.Drawing.Font "Consolas", 20, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel
    $nameFont = New-Object System.Drawing.Font "Arial Black", 98, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel
    $subFont = New-Object System.Drawing.Font "Segoe UI", 28, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel
    $bodyFont = New-Object System.Drawing.Font "Segoe UI", 24, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel
    $whiteBrush = New-Object System.Drawing.SolidBrush (New-Color 245 238 238 238)
    $mutedBrush = New-Object System.Drawing.SolidBrush (New-Color 240 200 200 200)
    $accentBrush = New-Object System.Drawing.SolidBrush (New-Color 255 255 70 84)
    $linePen = New-Object System.Drawing.Pen (New-Color 120 255 46 62), 2
    $format = New-Object System.Drawing.StringFormat
    $format.Trimming = [System.Drawing.StringTrimming]::EllipsisCharacter
    $format.FormatFlags = [System.Drawing.StringFormatFlags]::NoClip

    try {
      $sideLabel = if ($side -eq "tekno") { "TEKNO COLLECTIEF / ARTIEST" } else { "HIP HOP COLLECTIEF / ARTIEST" }
      $graphics.DrawString($sideLabel, $eyebrowFont, $mutedBrush, 72, 148)

      $graphics.DrawString($name.ToUpperInvariant(), $nameFont, $whiteBrush, 72, 178)
      $graphics.DrawLine($linePen, 72, 382, 716, 382)

      $role = [string]$artist.role
      $city = [string]$artist.city
      $meta = $role
      if (-not [string]::IsNullOrWhiteSpace($city)) {
        if (-not [string]::IsNullOrWhiteSpace($meta)) { $meta += "  •  " }
        $meta += $city
      }
      if (-not [string]::IsNullOrWhiteSpace($meta)) {
        $graphics.DrawString($meta, $subFont, $accentBrush, 72, 402)
      }

      if (-not [string]::IsNullOrWhiteSpace($headline)) {
        $textRect = New-Object System.Drawing.RectangleF 72, 454, 1016, 96
        $graphics.DrawString($headline, $bodyFont, $whiteBrush, $textRect, $format)
      }
    } finally {
      $format.Dispose()
      $linePen.Dispose()
      $accentBrush.Dispose()
      $mutedBrush.Dispose()
      $whiteBrush.Dispose()
      $bodyFont.Dispose()
      $subFont.Dispose()
      $nameFont.Dispose()
      $eyebrowFont.Dispose()
    }

    $outputPath = Join-Path $outputDir "$slug.png"
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Generated OG cover: $outputPath"
  } finally {
    $graphics.Dispose()
    $bmp.Dispose()
  }
}

foreach ($side in @("hiphop", "tekno")) {
  foreach ($artist in $artistsData.$side) {
    Write-ArtistCover -side $side -artist $artist
  }
}

Write-Host "Done generating artist OG covers."
