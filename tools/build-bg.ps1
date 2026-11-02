# ============================================================
# tools/build-bg.ps1 — Version Windows (sin Node.js) de build-bg.js
# Se ejecuta con doble clic en tools\build-bg.bat
# ============================================================
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$bgDir = Join-Path (Join-Path $root 'img') 'bg'
$out = Join-Path (Join-Path $root 'js') 'bg-manifest.js'
$layers = @('sky', 'far', 'mid', 'ground', 'fg')
$subfolders = @('historia', 'eventos', 'leyenda', 'test')

$themes = [ordered]@{}
$warnings = New-Object System.Collections.ArrayList

function AddWarn($msg) { [void]$warnings.Add($msg) }

function Get-PngSize($file) {
  $fs = [System.IO.File]::OpenRead($file)
  try {
    $buf = New-Object byte[] 24
    $n = $fs.Read($buf, 0, 24)
  } finally {
    $fs.Close()
  }
  if ($n -lt 24 -or $buf[1] -ne 0x50 -or $buf[2] -ne 0x4E -or $buf[3] -ne 0x47) { return $null }
  $w = ([long]$buf[16]*16777216)+([long]$buf[17]*65536)+([long]$buf[18]*256)+[long]$buf[19]
  $h = ([long]$buf[20]*16777216)+([long]$buf[21]*65536)+([long]$buf[22]*256)+[long]$buf[23]
  return @{ w = $w; h = $h }
}

function ScanDir($dir, $relPrefix) {
  if (-not (Test-Path -LiteralPath $dir)) { return }
  foreach ($td in @(Get-ChildItem -LiteralPath $dir -Directory | Sort-Object Name)) {
    $t = $td.Name
    $entry = [ordered]@{}
    $confFile = Join-Path $td.FullName 'layers.json'
    if (Test-Path -LiteralPath $confFile) {
      try { $entry.conf = (Get-Content -LiteralPath $confFile -Raw | ConvertFrom-Json) }
      catch { AddWarn "$relPrefix$t/layers.json invalido: $($_.Exception.Message)" }
    }
    foreach ($f in @(Get-ChildItem -LiteralPath $td.FullName -File)) {
      if ($f.Extension.ToLower() -ne '.png') { continue }
      $name = $f.BaseName.ToLower()
      if ($layers -notcontains $name) {
        AddWarn "$relPrefix$t/$($f.Name): capa desconocida; se ignora"
        continue
      }
      $s = Get-PngSize $f.FullName
      if ($null -eq $s) { AddWarn "$relPrefix$t/$($f.Name): no es un PNG valido"; continue }
      $entry[$name] = [ordered]@{ src = "img/bg/$relPrefix$t/$($f.Name)"; w = $s.w; h = $s.h }
      Write-Host ("  {0,-30} {1}x{2}" -f "$relPrefix$t/$name", $s.w, $s.h)
    }
    $hasPng = @($entry.Keys | Where-Object { $_ -ne 'conf' }).Count -gt 0
    if ($hasPng) { $themes[$t] = $entry }
  }
}

# Escanear subcarpetas organizadas
foreach ($sub in $subfolders) {
  ScanDir (Join-Path $bgDir $sub) "$sub/"
}

# Escanear temas sueltos
ScanDir $bgDir ''

# Generar archivo
$json = @($themes.Keys | ForEach-Object {
  $t = $_
  $parts = @()
  if ($themes[$t].conf) { $parts += ('    "conf": ' + ($themes[$t].conf | ConvertTo-Json -Depth 6 -Compress)) }
  foreach ($l in $layers) {
    if ($themes[$t].$l) { $parts += ('    "' + $l + '": { "src": "' + $themes[$t].$l.src + '", "w": ' + $themes[$t].$l.w + ', "h": ' + $themes[$t].$l.h + ' }') }
  }
  '  "' + $t + '": {' + "`n" + ($parts -join ",`n") + "`n  }"
}) -join ",`n"

$text = "// ============================================================`n// js/bg-manifest.js - AUTO-GENERADO por tools/build-bg (.js o .bat)`n// No lo edites a mano: se sobrescribe cada vez que ejecutas el script.`n// ============================================================`nconst BG_LIST = {`n" + $json + "`n};`n"
[System.IO.File]::WriteAllText($out, $text, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ''
Write-Host "$($themes.Count) tema(s) -> js/bg-manifest.js"
if ($warnings.Count -gt 0) {
  Write-Host ''
  Write-Host "AVISOS ($($warnings.Count)):"
  foreach ($w in $warnings) { Write-Host "  - $w" }
}