# SYNAPSE-OS Production / Dev Launcher Script
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "               SYNAPSE-OS // QUANTUM MESH                  " -ForegroundColor Cyan
Write-Host "      Neural-Digital Interface & Autonomous Command Center " -ForegroundColor DarkCyan
Write-Host "===========================================================" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootPath

# 1. Start Backend
Write-Host "`n[1/3] Initializing Synapse Neural Backend..." -ForegroundColor Yellow
$BackendJob = Start-Process -FilePath "$RootPath\backend\.venv\Scripts\python.exe" -ArgumentList "run.py" -WorkingDirectory "$RootPath\backend" -PassThru -NoNewWindow

Start-Sleep -Seconds 2

# 2. Start Frontend
Write-Host "[2/3] Launching Synapse WebGL Holographic Frontend..." -ForegroundColor Yellow
$FrontendJob = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory "$RootPath\frontend" -PassThru -NoNewWindow

Start-Sleep -Seconds 3

# 3. Open Browser
Write-Host "[3/3] Opening Synapse Command Deck in browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "`n>>> SYNAPSE-OS IS RUNNING <<<" -ForegroundColor Green
Write-Host "Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:   http://localhost:8002" -ForegroundColor Cyan
Write-Host "API Docs:  http://localhost:8002/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C or Enter to shut down all Synapse-OS services." -ForegroundColor DarkGray

try {
    [Console]::ReadLine() | Out-Null
} finally {
    Write-Host "`nGracefully terminating SYNAPSE-OS..." -ForegroundColor Red
    Stop-Process -Id $BackendJob.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $FrontendJob.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Quantum core safely decoupled. Goodbye." -ForegroundColor DarkGray
}
