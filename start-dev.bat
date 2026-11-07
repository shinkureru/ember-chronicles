@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
    echo [Error] Node.js is not installed. Please install Node.js 22 LTS first.
    pause
    exit /b 1
)
if not exist node_modules (
    echo Installing dependencies... internet connection is required for the first install.
    call npm install
    if errorlevel 1 (
        echo Installation failed. Check your network connection and try again.
        pause
        exit /b 1
    )
)
echo.
echo Open http://localhost:5173 in your browser.
echo Press Ctrl+C to stop.
echo.
call npm run dev
pause
