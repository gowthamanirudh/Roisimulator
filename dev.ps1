param()

$root = $PSScriptRoot

Start-Job -ScriptBlock {
    Set-Location -Path "$using:root\backend"
    if (-not (Test-Path .venv)) { python -m venv .venv }
    & .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt | Out-Null
    python wsgi.py
} | Out-Null

Start-Job -ScriptBlock {
    Set-Location -Path "$using:root\frontend"
    if (-not (Test-Path node_modules)) { npm i --silent }
    npm run dev
} | Out-Null

Write-Host "Backend: http://127.0.0.1:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop jobs." -ForegroundColor Yellow
Wait-Job * | Receive-Job


