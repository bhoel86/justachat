@echo off
echo ========================================
echo JAC IRC Proxy
echo ========================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Run install.bat first or download from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [!] Dependencies not installed. Running install first...
    call npm install
    echo.
)

echo Starting proxy...
echo.
node proxy.js
pause
