# DEPRECATED — Baking es global. No instalar por proyecto.
# Solo crea handoff/ si lo necesitás. Config: ~/.cursor/opus-sonnet/config.json

param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectPath
)

Write-Warning "enable-project.ps1 esta DEPRECADO. Baking es global (~/.cursor/opus-sonnet/config.json)."
Write-Warning "Usa /baking o 'usemos baking'. No se crea .cursor/opus-sonnet.json."

$handoffDir = Join-Path $ProjectPath ".cursor\handoff"
New-Item -ItemType Directory -Force -Path $handoffDir | Out-Null
Write-Host "OK: $handoffDir (solo diary — config global)"
