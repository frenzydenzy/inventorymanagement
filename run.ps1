#requires -Version 5.1
<#
.SYNOPSIS
    Starts the Inventory Management backend (FastAPI) and/or frontend (Vite) dev servers.

.PARAMETER Backend
    Switch. Start the FastAPI backend (uvicorn) on http://127.0.0.1:8000

.PARAMETER Frontend
    Switch. Start the Vite frontend dev server on http://localhost:5173

.EXAMPLE
    .\run.ps1 -Backend -Frontend      # start both
    .\run.ps1 -Backend                # start backend only
    .\run.ps1 -Frontend                # start frontend only
#>
param(
    [switch]$Backend,
    [switch]$Frontend
)

$root = $PSScriptRoot

if (-not $Backend -and -not $Frontend) {
    Write-Host "Usage: .\run.ps1 [-Backend] [-Frontend]" -ForegroundColor Yellow
    Write-Host "  -Backend   Start the FastAPI backend (http://127.0.0.1:8000)"
    Write-Host "  -Frontend  Start the Vite frontend (http://localhost:5173)"
    Write-Host "Example: .\run.ps1 -Backend -Frontend"
    exit 0
}

if ($Backend) {
    Write-Host "Starting backend..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command",
        "Set-Location `"$root\backend`"; python -m uvicorn app.main:app --reload"
    )
}

if ($Frontend) {
    Write-Host "Starting frontend..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList @(
        "-NoExit", "-Command",
        "Set-Location `"$root\frontend`"; npm run dev"
    )
}
