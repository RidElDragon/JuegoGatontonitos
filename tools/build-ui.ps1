# tools/build-ui.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$uiDir = Join-Path (Join-Path (Join-Path $root 'img') 'ui') 'screens'
$out = Join-Path (Join-Path $root 'js') 'ui-manifest.js'
$layers = @('base', 'overlay')

$screens = [ordered]@{}
$warnings = New-Object System.Collections.ArrayList
function AddWarn($msg) { [void]$warnings.Add($msg) }

if (Test-Path -LiteralPath $uiDir) {
  foreach ($td in @(Get-ChildItem -LiteralPath $uiDir -Directory | Sort-Object Name)) {
    $t = $td.Name
    $entry = [ordered]@{}
    foreach ($f in @(Get-ChildItem -LiteralPath $td.FullName -File)) {
      if ($f.Extension.ToLower() -ne '.png') { continue }
      $name = $f.BaseName.ToLower()
      if ($layers -notcontains $name) { AddWarn "img/ui/screens/$t/$($f.Name): capa desconocida"; continue }
      $sizeKB = [math]::Round($f.Length / 1KB, 1)
      $entry[$name] = [ordered]@{ src = "img/ui/screens/$t/$($f.Name)"; size = "$sizeKB KB" }
      Write-Host ("  {0,-20} {1}" -f "$t/$name", $entry[$name].size)
    }
    if ($entry.Count -gt 0) {
      # Incrusta layers.json (frames/fps) en el manifiesto: asi no hace falta fetch y funciona con doble clic
      $cfgPath = Join-Path $td.FullName 'layers.json'
      if (Test-Path -LiteralPath $cfgPath) {
        try {
          $cfgObj = (Get-Content -LiteralPath $cfgPath -Raw -Encoding UTF8) | ConvertFrom-Json
          $entry['config'] = ($cfgObj | ConvertTo-Json -Depth 10 -Compress)
          Write-Host ("  {0,-20} incrustado" -f "$t/layers.json")
        } catch { AddWarn "img/ui/screens/$t/layers.json: JSON invalido, se ignora" }
      }
      $screens[$t] = $entry
    }
  }
}

$json = @($screens.Keys | ForEach-Object {
  $t = $_
  $parts = @()
  foreach ($l in $layers) {
    if ($screens[$t].$l) { $parts += ('    "' + $l + '": { "src": "' + $screens[$t].$l.src + '", "size": "' + $screens[$t].$l.size + '" }') }
  }
  if ($screens[$t].config) { $parts += ('    "config": ' + $screens[$t].config) }
  '  "' + $t + '": {' + "`n" + ($parts -join ",`n") + "`n  }"
}) -join ",`n"

$text = "// ============================================================`n// js/ui-manifest.js - AUTO-GENERADO por tools/build-ui`n// ============================================================`nconst UI_SCREEN_LIST = {`n" + $json + "`n};`n"
[System.IO.File]::WriteAllText($out, $text, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ''
Write-Host "$($screens.Count) pantalla(s) -> js/ui-manifest.js"
if ($warnings.Count -gt 0) {
  Write-Host ''
  Write-Host "AVISOS ($($warnings.Count)):"
  foreach ($w in $warnings) { Write-Host "  - $w" }
}