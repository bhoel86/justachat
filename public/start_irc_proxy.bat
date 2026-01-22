@echo off
cd /d "C:\Users\dunad\Desktop\kiwiirc-master"
echo ========================================
echo IRC Gateway Proxy Launcher
echo ========================================
echo.
echo Current directory: %CD%
echo.

echo Checking for files...
if exist "webircgateway_windows_amd64.exe" (
    echo [OK] Found webircgateway_windows_amd64.exe
) else (
    echo [ERROR] webircgateway_windows_amd64.exe NOT FOUND
    echo.
    echo Files in this folder:
    dir /b *.exe 2>nul
    echo.
    pause
    exit /b 1
)

if exist "config.conf" (
    echo [OK] Found config.conf
) else (
    echo [ERROR] config.conf NOT FOUND
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting proxy - Connect mIRC to 127.0.0.1:6667
echo Press Ctrl+C to stop
echo ========================================
echo.

webircgateway_windows_amd64.exe -config config.conf

echo.
echo ========================================
echo Proxy has exited. Error code: %ERRORLEVEL%
echo ========================================
echo.
pause
