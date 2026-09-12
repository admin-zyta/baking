# DEPRECATED — Baking es global. No instalar por proyecto.
# Config: ~/.cursor/opus-sonnet/config.json
# Skills: install-claude-skills.ps1

param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectPath,
    [switch]$UserAgents,
    [switch]$MergeClaudeMd
)

Write-Warning "enable-project.ps1 (claude-code) DEPRECADO. Baking es global."
Write-Warning "Usa /baking. Perfil claude: editar profile en ~/.cursor/opus-sonnet/config.json"

$handoffDir = Join-Path $ProjectPath ".cursor\handoff"
New-Item -ItemType Directory -Force -Path $handoffDir | Out-Null
Write-Host "OK: $handoffDir (solo diary)"

if ($UserAgents) {
    & (Join-Path $env:USERPROFILE ".cursor\opus-sonnet\claude-code\install-claude-skills.ps1")
}

Write-Host ""
Write-Host "/baking  —  no hace falta init por repo"
