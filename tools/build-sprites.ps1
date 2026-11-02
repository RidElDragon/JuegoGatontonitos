# ============================================================
# tools/build-sprites.ps1
# Version para Windows (sin Node.js) de build-sprites.js.
# Lee las carpetas de img/ y genera js/sprites-manifest.js.
# Se ejecuta con doble clic en tools\build-sprites.bat
#
# Estructura que espera:
#   img\cats\<id>\<animacion>.png       ids: cat_0, cat_king, ...
#   img\enemies\<id>\<animacion>.png    ids: enemy_0, event_<clave>, legend_<clave>
#   img\bosses\<id>\<animacion>.png     ids: boss_0, eboss_<clave>, lboss_<clave>
# Animaciones validas (en minusculas): idle, walk, attack, knockback
# ============================================================
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$img  = Join-Path $root 'img'
$out  = Join-Path (Join-Path $root 'js') 'sprites-manifest.js'

$anims = @('idle', 'walk', 'attack', 'knockback')
$types = @(
  @{ dir = 'cats';    prefixes = @('cat_');                      title = 'gatos'    },
  @{ dir = 'enemies'; prefixes = @('enemy_', 'event_', 'legend_'); title = 'enemigos' },
  @{ dir = 'bosses';  prefixes = @('boss_', 'eboss_', 'lboss_');   title = 'jefes'    }
)

$warnings = New-Object System.Collections.ArrayList
function AddWarn($msg) { [void]$warnings.Add($msg) }

# Clave de orden natural: cat_2 va antes que cat_10
function NaturalKey($s) {
  return [regex]::Replace($s, '\d+', { param($m) $m.Value.PadLeft(10, '0') })
}

# Lee ancho y alto de un PNG (cabecera IHDR). Devuelve $null si no es un PNG.
function Get-PngSize($file) {
  $fs = [System.IO.File]::OpenRead($file)
  try {
    $buf = New-Object byte[] 24
    $n = $fs.Read($buf, 0, 24)
  } finally {
    $fs.Close()
  }
  if ($n -lt 24 -or $buf[1] -ne 0x50 -or $buf[2] -ne 0x4E -or $buf[3] -ne 0x47) { return $null }
  $w = ([long]$buf[16] * 16777216) + ([long]$buf[17] * 65536) + ([long]$buf[18] * 256) + [long]$buf[19]
  $h = ([long]$buf[20] * 16777216) + ([long]$buf[21] * 65536) + ([long]$buf[22] * 256) + [long]$buf[23]
  return @{ w = $w; h = $h }
}

$sections = @()
$total = 0
Write-Host ''

foreach ($type in $types) {
  $typeDir = Join-Path $img $type.dir
  if (-not (Test-Path -LiteralPath $typeDir)) { continue }

  $lines = @()
  $ids = @(Get-ChildItem -LiteralPath $typeDir -Directory | ForEach-Object { $_.Name } | Sort-Object { NaturalKey $_ })

  foreach ($id in $ids) {
    $where = "img/$($type.dir)/$id"
    $unitDir = Join-Path $typeDir $id

    $okPrefix = $false
    foreach ($p in $type.prefixes) {
      if ($id.StartsWith($p, [System.StringComparison]::Ordinal)) { $okPrefix = $true }
    }
    if (-not $okPrefix) {
      AddWarn "${where}: el id no empieza con $($type.prefixes -join ' / '); el juego no la va a usar"
      continue
    }

    $found = @{}
    foreach ($f in @(Get-ChildItem -LiteralPath $unitDir -File)) {
      if ($f.Extension.ToLower() -ne '.png') { continue }
      $base = $f.BaseName
      if ($anims -ccontains $base) {
        $found[$base] = $f.Name
      } elseif ($anims -contains $base.ToLower()) {
        AddWarn "${where}/$($f.Name): usa minusculas ($($base.ToLower()).png) o no cargara en un servidor"
      } else {
        AddWarn "${where}/$($f.Name): nombre de animacion desconocido (validos: $($anims -join ', ')); se ignora"
      }
    }

    $names = @($anims | Where-Object { $found.ContainsKey($_) })
    if ($names.Count -eq 0) {
      AddWarn "${where}: no tiene ninguna animacion valida"
      continue
    }

    # Validar tiras: celdas cuadradas y misma altura en todas las animaciones
    $heights = @{}
    $info = @()
    foreach ($a in $names) {
      $s = Get-PngSize (Join-Path $unitDir $found[$a])
      if ($null -eq $s -or $s.h -le 0) {
        AddWarn "${where}/$($found[$a]): no es un PNG valido"
        $info += $a
        continue
      }
      $heights[[string]$s.h] = $true
      if ($s.w -lt $s.h -or ($s.w % $s.h) -ne 0) {
        AddWarn "${where}/$($found[$a]): mide $($s.w)x$($s.h), el ancho debe ser multiplo del alto; el juego la tratara como 1 frame"
        $info += $a
      } else {
        $info += ('{0}x{1}' -f $a, [int]($s.w / $s.h))
      }
    }
    if ($heights.Count -gt 1) {
      AddWarn "${where}: las animaciones tienen alturas distintas ($(($heights.Keys | Sort-Object) -join ', ')); el sprite saltara al cambiar"
    }

    $quoted = @($names | ForEach-Object { "'" + $_ + "'" })
    $lines += ('  ' + $id + ': [' + ($quoted -join ', ') + '],')
    Write-Host ('  {0,-22} {1}' -f $id, ($info -join '  '))
    $total++
  }

  if ($lines.Count -gt 0) {
    $sections += ('  // --- ' + $type.title + " ---`n" + ($lines -join "`n"))
  }
}

$header = @(
  '// ============================================================',
  '// js/sprites-manifest.js - AUTO-GENERADO por tools/build-sprites (.js o .bat)',
  '// No lo edites a mano: se sobrescribe cada vez que ejecutas el script.',
  '// ============================================================',
  'const SPRITE_LIST = {'
) -join "`n"
$text = $header + "`n" + ($sections -join "`n") + "`n};`n"

# UTF-8 sin BOM
[System.IO.File]::WriteAllText($out, $text, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ''
Write-Host "$total unidad(es) -> js/sprites-manifest.js"
if ($warnings.Count -gt 0) {
  Write-Host ''
  Write-Host "AVISOS ($($warnings.Count)):"
  foreach ($w in $warnings) { Write-Host "  - $w" }
}