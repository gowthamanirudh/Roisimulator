param()

Set-Location -Path $PSScriptRoot
if (-not (Test-Path .venv)) {
    python -m venv .venv
}
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python wsgi.py


