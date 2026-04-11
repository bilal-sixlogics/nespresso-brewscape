@echo off
REM ============================================================
REM  Brewscape — Start All Services (Windows)
REM ============================================================
REM
REM  Requirements:
REM    - PHP >= 8.2          (https://windows.php.net/download)
REM    - Composer >= 2.x     (https://getcomposer.org/download)
REM    - Node.js >= 20       (https://nodejs.org)
REM    - npm >= 10
REM
REM  First-time setup:
REM    start.bat --setup
REM
REM  Normal start:
REM    start.bat
REM
REM ============================================================

setlocal enabledelayedexpansion

set ROOT_DIR=%~dp0
set BACKEND_DIR=%ROOT_DIR%backend
set ADMIN_DIR=%ROOT_DIR%admin
set FRONTEND_DIR=%ROOT_DIR%

set BACKEND_PORT=8000
set ADMIN_PORT=3002
set FRONTEND_PORT=3001

echo.
echo   [32m☕  B R E W S C A P E[0m
echo   [36m─────────────────────────────[0m
echo.

REM ── Check requirements ──
echo [36mChecking requirements...[0m

where php >nul 2>&1
if errorlevel 1 (
    echo   [31m✗ PHP not found[0m  — Download from https://windows.php.net/download
    goto :missing
) else (
    for /f "tokens=*" %%v in ('php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;"') do echo   [32m✓[0m PHP %%v
)

where composer >nul 2>&1
if errorlevel 1 (
    echo   [31m✗ Composer not found[0m  — Download from https://getcomposer.org
    goto :missing
) else (
    echo   [32m✓[0m Composer installed
)

where node >nul 2>&1
if errorlevel 1 (
    echo   [31m✗ Node.js not found[0m  — Download from https://nodejs.org
    goto :missing
) else (
    for /f "tokens=*" %%v in ('node -v') do echo   [32m✓[0m Node %%v
)

where npm >nul 2>&1
if errorlevel 1 (
    echo   [31m✗ npm not found[0m
    goto :missing
) else (
    for /f "tokens=*" %%v in ('npm -v') do echo   [32m✓[0m npm %%v
)

echo.

REM ── Auto-detect first run or explicit setup ──
if "%1"=="--setup" goto :setup
if "%1"=="-s" goto :setup
if not exist "%BACKEND_DIR%\vendor" goto :auto_setup
if not exist "%ADMIN_DIR%\node_modules" goto :auto_setup
if not exist "%FRONTEND_DIR%\node_modules" goto :auto_setup
goto :start

:auto_setup
echo [33mFirst run detected — running setup automatically...[0m
echo.

:setup
echo [33mRunning first-time setup...[0m
echo.

echo [36m[1/4] Installing backend dependencies...[0m
cd /d "%BACKEND_DIR%"
call composer install --no-interaction --quiet

if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        php artisan key:generate --quiet
    )
)

echo [36m[2/4] Setting up database...[0m
if not exist database\database.sqlite (
    type nul > database\database.sqlite
)
php artisan migrate --force --quiet
php artisan db:seed --force --quiet
php artisan storage:link --quiet 2>nul
echo   [32m✓[0m Database migrated ^& seeded
echo   [32m✓[0m Admin login: admin@ecommerce.com / password

echo [36m[3/4] Installing admin panel dependencies...[0m
cd /d "%ADMIN_DIR%"
call npm install --silent

if not exist .env.local (
    echo NEXT_PUBLIC_API_URL=http://localhost:%BACKEND_PORT%/api> .env.local
    echo NEXT_PUBLIC_APP_NAME=Brewscape Admin>> .env.local
)

echo [36m[4/4] Installing frontend dependencies...[0m
cd /d "%FRONTEND_DIR%"
call npm install --silent 2>nul

echo.
echo [32mSetup complete![0m
echo.

:start
echo [36mStarting services...[0m
echo.

REM Kill existing processes on ports
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%BACKEND_PORT%" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%ADMIN_PORT%" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%FRONTEND_PORT%" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
timeout /t 1 /nobreak >nul

REM Start Backend (Laravel)
cd /d "%BACKEND_DIR%"
start "Brewscape Backend" /min cmd /c "php artisan serve --port=%BACKEND_PORT%"
echo   [32m✓[0m Backend API         → http://localhost:%BACKEND_PORT%

REM Start Admin Panel (Next.js)
cd /d "%ADMIN_DIR%"
start "Brewscape Admin" /min cmd /c "npx next dev --port %ADMIN_PORT%"
echo   [32m✓[0m Admin Panel         → http://localhost:%ADMIN_PORT%

REM Start Frontend Storefront (Next.js)
cd /d "%FRONTEND_DIR%"
if exist package.json (
    findstr /c:"\"dev\"" package.json >nul 2>&1
    if not errorlevel 1 (
        start "Brewscape Frontend" /min cmd /c "npm run dev -- --port %FRONTEND_PORT%"
        echo   [32m✓[0m Customer Storefront → http://localhost:%FRONTEND_PORT%
    )
)

echo.
echo   [36m─────────────────────────────[0m
echo   [33mAdmin login:[0m admin@ecommerce.com / password
echo   [33mClose this window or press Ctrl+C to stop[0m
echo.

REM Keep window open
pause
goto :eof

:missing
echo.
echo [31mMissing dependencies. Install them and try again.[0m
pause
goto :eof
