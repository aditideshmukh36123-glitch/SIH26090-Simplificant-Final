$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $projectDir

Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://127.0.0.1:8000/docs"
} | Out-Null

& "$projectDir\venv\Scripts\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000