param()

Set-Location -Path $PSScriptRoot
if (-not (Test-Path node_modules)) {
    npm i --silent
}
npm run dev


