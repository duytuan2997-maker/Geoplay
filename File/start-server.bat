@echo off
cd /d "%~dp0"

node -e "require('node:sqlite')" >nul 2>nul
if errorlevel 1 (
    echo Backend requires Node.js 22.5 or newer.
    echo Install or update Node.js, then run this file again.
    pause
    exit /b 1
)

npm start
pause
