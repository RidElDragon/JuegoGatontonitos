# Ambos lanzadores utilizan el mismo generador.
$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodeExe = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:ProgramFiles 'nodejs\node.exe' }
if (-not (Test-Path -LiteralPath $nodeExe)) { throw 'Instala Node.js para generar el manifiesto de UI.' }
& $nodeExe (Join-Path $PSScriptRoot 'build-ui.js')
if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar el manifiesto de UI.' }
