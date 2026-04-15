Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $projectRoot "public\\og"
$homeOgPath = Join-Path $projectRoot "public\\og-image.png"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

function Decode-Base64Utf8($value) {
  return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($value))
}

$articles = @(
  @{ slug = "shcho-oznachaye-lyst-vid-jobcenter"; title = (Decode-Base64Utf8 "0KnQviDQvtC30L3QsNGH0LDRlCDQu9C40YHRgiDQstGW0LQgSm9iY2VudGVy"); category = "Jobcenter"; tone = "jobcenter" }
  @{ slug = "anhoerung-jobcenter-poyasnennya"; title = (Decode-Base64Utf8 "QW5ob2VydW5nIEpvYmNlbnRlcjog0L/QvtGP0YHQvdC10L3QvdGPINC/0YDQvtGB0YLQuNC80Lgg0YHQu9C+0LLQsNC80Lg="); category = "Jobcenter"; tone = "warning" }
  @{ slug = "lyst-vid-shkoly-v-nimechchyni-shcho-robyty"; title = (Decode-Base64Utf8 "0JvQuNGB0YIg0LLRltC0INGI0LrQvtC70Lgg0LIg0J3RltC80LXRh9GH0LjQvdGWOiDRidC+INGA0L7QsdC40YLQuCDQsdCw0YLRjNC60LDQvA=="); category = "Schule"; tone = "school" }
  @{ slug = "kuendigung-yak-pravylno-napysaty"; title = (Decode-Base64Utf8 "S8O8bmRpZ3VuZzog0Y/QuiDQv9GA0LDQstC40LvRjNC90L4g0L3QsNC/0LjRgdCw0YLQuCDQsiDQndGW0LzQtdGH0YfQuNC90ZY="); category = "Kuendigung"; tone = "contract" }
  @{ slug = "lyst-vid-auslaenderbehoerde-poyasnennya"; title = (Decode-Base64Utf8 "0JvQuNGB0YIg0LLRltC0IEF1c2zDpG5kZXJiZWjDtnJkZTog0L/QvtGP0YHQvdC10L3QvdGPINGD0LrRgNCw0ZfQvdGB0YzQutC+0Y4="); category = "Auslaenderbehoerde"; tone = "migration" }
  @{ slug = "yak-vidpovisty-jobcenter"; title = (Decode-Base64Utf8 "0K/QuiDQstGW0LTQv9C+0LLRltGB0YLQuCBKb2JjZW50ZXIg0L/RgNCw0LLQuNC70YzQvdC+INGWINGB0L/QvtC60ZbQudC90L4="); category = "Jobcenter"; tone = "jobcenter" }
  @{ slug = "lyst-vid-krankenkasse-shcho-tse"; title = (Decode-Base64Utf8 "0JvQuNGB0YIg0LLRltC0IEtyYW5rZW5rYXNzZTog0YnQviDRhtC1INC+0LfQvdCw0YfQsNGU"); category = "Krankenkasse"; tone = "health" }
  @{ slug = "nimetski-ofitsiyni-lysty-pryklady"; title = (Decode-Base64Utf8 "0J3RltC80LXRhtGM0LrRliDQvtGE0ZbRhtGW0LnQvdGWINC70LjRgdGC0Lg6INC/0YDQuNC60LvQsNC00Lgg0ZYg0YLQuNC/0L7QstGWINGE0YDQsNC30Lg="); category = "Gidy"; tone = "guide" }
  @{ slug = "yak-zrozumity-lyst-z-nimechchyny"; title = (Decode-Base64Utf8 "0K/QuiDQt9GA0L7Qt9GD0LzRltGC0Lgg0LvQuNGB0YIg0Lcg0J3RltC80LXRh9GH0LjQvdC4LCDRj9C60YnQviDQstC4INC90LUg0LfQvdCw0ZTRgtC1INC80L7QstC4"); category = "Gidy"; tone = "guide" }
  @{ slug = "formulyary-jobcenter-poyasnennya"; title = (Decode-Base64Utf8 "0KTQvtGA0LzRg9C70Y/RgNC4IEpvYmNlbnRlcjog0L/QvtGP0YHQvdC10L3QvdGPINGD0LrRgNCw0ZfQvdGB0YzQutC+0Y4="); category = "Jobcenter"; tone = "warning" }
)

function Get-TonePalette($tone) {
  switch ($tone) {
    "jobcenter" { return @{ Primary = "#0057B7"; Secondary = "#003F88" } }
    "warning" { return @{ Primary = "#C68808"; Secondary = "#8C4E00" } }
    "school" { return @{ Primary = "#2A72B5"; Secondary = "#1C4E7E" } }
    "contract" { return @{ Primary = "#21466E"; Secondary = "#142F4D" } }
    "migration" { return @{ Primary = "#006A7A"; Secondary = "#004955" } }
    "health" { return @{ Primary = "#0C6F79"; Secondary = "#094852" } }
    default { return @{ Primary = "#5B59A6"; Secondary = "#31306F" } }
  }
}

function New-Brush($hex) {
  return New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function Fill-RoundedRect($graphics, $brush, $x, $y, $width, $height, $radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  $graphics.FillPath($brush, $path)
  $path.Dispose()
}

function Draw-SpeechBubble($graphics, $left, $top, $width, $height, $fillColor, $lineColor) {
  $bubbleBrush = New-Object System.Drawing.SolidBrush $fillColor
  $lineBrush = New-Object System.Drawing.SolidBrush $lineColor

  Fill-RoundedRect $graphics $bubbleBrush $left $top $width $height 28

  $tail = New-Object System.Drawing.Point[] 3
  $tail[0] = New-Object System.Drawing.Point ($left + 52), ($top + $height - 8)
  $tail[1] = New-Object System.Drawing.Point ($left + 12), ($top + $height + 34)
  $tail[2] = New-Object System.Drawing.Point ($left + 96), ($top + $height - 2)
  $graphics.FillPolygon($bubbleBrush, $tail)

  $graphics.FillRectangle($lineBrush, $left + 42, $top + 56, 160, 12)
  $graphics.FillRectangle($lineBrush, $left + 42, $top + 100, 126, 12)

  $lineBrush.Dispose()
  $bubbleBrush.Dispose()
}

function Draw-WrappedText($graphics, $text, $font, $brush, $rect, $flags) {
  $format = New-Object System.Drawing.StringFormat
  $format.FormatFlags = [System.Drawing.StringFormatFlags]::LineLimit
  $format.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  if ($flags -eq "center") {
    $format.Alignment = [System.Drawing.StringAlignment]::Center
  }
  $graphics.DrawString($text, $font, $brush, $rect, $format)
  $format.Dispose()
}

foreach ($article in $articles) {
  $palette = Get-TonePalette $article.tone

  $bmp = New-Object System.Drawing.Bitmap 1200, 630
  $graphics = [System.Drawing.Graphics]::FromImage($bmp)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#EDF5FF"))

  $topBlue = New-Brush "#0057B7"
  $topYellow = New-Brush "#FFD700"
  $graphics.FillRectangle($topBlue, 0, 0, 1200, 22)
  $graphics.FillRectangle($topYellow, 0, 22, 1200, 12)

  $cardBrush = New-Brush "#FFFFFF"
  Fill-RoundedRect $graphics $cardBrush 70 86 1060 458 42

  $leftRect = New-Object System.Drawing.Rectangle 92, 140, 458, 360
  $gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $leftRect,
    [System.Drawing.ColorTranslator]::FromHtml($palette.Primary),
    [System.Drawing.ColorTranslator]::FromHtml($palette.Secondary),
    45
  )
  Fill-RoundedRect $graphics $gradientBrush 92 140 458 360 34

  $sunBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 215, 0))
  $graphics.FillEllipse($sunBrush, 900, 90, 170, 170)

  Draw-SpeechBubble `
    -graphics $graphics `
    -left 165 `
    -top 220 `
    -width 220 `
    -height 128 `
    -fillColor ([System.Drawing.Color]::FromArgb(250, 255, 255, 255)) `
    -lineColor ([System.Drawing.ColorTranslator]::FromHtml("#0057B7"))

  $chipBrush = New-Brush "#FFF0AA"
  Fill-RoundedRect $graphics $chipBrush 610 132 170 42 20

  $brandBrush = New-Brush "#14345A"
  $mutedBrush = New-Brush "#49627F"
  $accentBrush = New-Brush $palette.Primary

  $chipFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
  $brandFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
  $titleFont = New-Object System.Drawing.Font("Segoe UI", 36, [System.Drawing.FontStyle]::Bold)
  $subtitleFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
  $footerFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Regular)

  $graphics.DrawString($article.category.ToUpper(), $chipFont, $brandBrush, 634, 141)
  $graphics.DrawString("Briefify.de", $brandFont, $brandBrush, 610, 196)

  $titleRect = New-Object System.Drawing.RectangleF 610, 240, 430, 170
  Draw-WrappedText $graphics $article.title $titleFont $accentBrush $titleRect "default"

  $graphics.DrawString(
    (Decode-Base64Utf8 "0J/QvtGP0YHQvdC10L3QvdGPINC90ZbQvNC10YbRjNC60LjRhSDQu9C40YHRgtGW0LIg0YPQutGA0LDRl9C90YHRjNC60L7Rjg=="),
    $subtitleFont,
    $mutedBrush,
    610,
    438
  )

  $graphics.FillRectangle((New-Brush "#E1E9F5"), 650, 316, 310, 20)
  $graphics.FillRectangle((New-Brush "#E1E9F5"), 650, 356, 250, 20)
  $graphics.FillRectangle((New-Brush "#E1E9F5"), 650, 396, 190, 20)

  $footerRect = New-Object System.Drawing.RectangleF 610, 500, 420, 40
  Draw-WrappedText $graphics "briefify.de/statti" $footerFont $mutedBrush $footerRect "default"

  $outputPath = Join-Path $outputDir ($article.slug + ".png")
  $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $footerFont.Dispose()
  $subtitleFont.Dispose()
  $titleFont.Dispose()
  $brandFont.Dispose()
  $chipFont.Dispose()
  $accentBrush.Dispose()
  $mutedBrush.Dispose()
  $brandBrush.Dispose()
  $chipBrush.Dispose()
  $sunBrush.Dispose()
  $gradientBrush.Dispose()
  $cardBrush.Dispose()
  $topYellow.Dispose()
  $topBlue.Dispose()
  $graphics.Dispose()
  $bmp.Dispose()
}

function New-HomeOgImage($outputPath) {
  $bmp = New-Object System.Drawing.Bitmap 1200, 630
  $graphics = [System.Drawing.Graphics]::FromImage($bmp)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#EDF5FF"))

  $topBlue = New-Brush "#0057B7"
  $topYellow = New-Brush "#FFD700"
  $cardBrush = New-Brush "#FFFFFF"
  $brandBrush = New-Brush "#14345A"
  $mutedBrush = New-Brush "#49627F"
  $lineBrush = New-Brush "#D9E3F2"
  $iconBlueBrush = New-Brush "#0F5FBF"
  $iconWhiteBrush = New-Brush "#FFFFFF"
  $chipBrush = New-Brush "#FFF0AA"
  $sunBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(238, 255, 191, 0))

  $graphics.FillRectangle($topBlue, 0, 0, 1200, 22)
  $graphics.FillRectangle($topYellow, 0, 22, 1200, 12)
  Fill-RoundedRect $graphics $cardBrush 70 86 1060 458 42
  Fill-RoundedRect $graphics $iconBlueBrush 92 140 458 360 34
  $graphics.FillEllipse($sunBrush, 905, 92, 180, 180)

  Fill-RoundedRect $graphics $iconWhiteBrush 170 218 220 128 28
  $tail = New-Object System.Drawing.Point[] 3
  $tail[0] = New-Object System.Drawing.Point 222, 338
  $tail[1] = New-Object System.Drawing.Point 198, 400
  $tail[2] = New-Object System.Drawing.Point 264, 338
  $graphics.FillPolygon($iconWhiteBrush, $tail)
  $graphics.FillRectangle($iconBlueBrush, 248, 252, 112, 12)
  $graphics.FillRectangle($iconBlueBrush, 248, 294, 92, 12)

  Fill-RoundedRect $graphics $chipBrush 610 138 170 42 20

  $chipFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
  $brandFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
  $titleFont = New-Object System.Drawing.Font("Segoe UI", 46, [System.Drawing.FontStyle]::Bold)
  $subtitleFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Regular)

  $graphics.DrawString("BRIEFIFY.DE", $chipFont, $brandBrush, 628, 147)
  $graphics.DrawString("DECODE", $titleFont, $brandBrush, 608, 208)
  $graphics.DrawString("GERMAN LETTERS", $titleFont, $brandBrush, 608, 270)
  $graphics.DrawString("IN UKRAINIAN", $titleFont, $brandBrush, 608, 332)

  $graphics.FillRectangle($lineBrush, 650, 418, 316, 22)
  $graphics.FillRectangle($lineBrush, 650, 470, 252, 22)
  $graphics.FillRectangle($lineBrush, 650, 522, 190, 22)

  $chipFont.Dispose()
  $brandFont.Dispose()
  $titleFont.Dispose()
  $subtitleFont.Dispose()
  $sunBrush.Dispose()
  $chipBrush.Dispose()
  $iconWhiteBrush.Dispose()
  $iconBlueBrush.Dispose()
  $lineBrush.Dispose()
  $mutedBrush.Dispose()
  $brandBrush.Dispose()
  $cardBrush.Dispose()
  $topYellow.Dispose()
  $topBlue.Dispose()

  $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bmp.Dispose()
}

New-HomeOgImage $homeOgPath

Write-Host "OG images regenerated:" $articles.Count "articles + home image"
