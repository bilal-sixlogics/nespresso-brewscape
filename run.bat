@echo off
REM Nespresso Brewscape - Windows Run Script (Storefront only)
REM For all services: start.bat (or start.bat --setup for first time)

cd /d "%~dp0"

echo ===================================
echo   Nespresso Brewscape
echo ===================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Install it from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do echo Node.js version: %%i
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Start the dev server
echo Starting Nespresso Brewscape Storefront...
echo The app will open at http://localhost:3001
echo Press Ctrl+C to stop.
echo.
call npm run dev -- --port 3001
pause
