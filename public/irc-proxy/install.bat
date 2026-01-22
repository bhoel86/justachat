@echo off
echo ========================================
echo JAC IRC Proxy - Installation
echo ========================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    echo Choose the LTS version, run the installer,
    echo then run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.
echo Installing dependencies...
call npm install
echo.
echo ========================================
echo Installation complete!
echo.
echo Now run START.bat to start the proxy
echo ========================================
pause
