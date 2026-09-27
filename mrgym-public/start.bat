@echo off
setlocal

REM === MrGym Public Site - start script (development mode) ===
REM This starts ONLY the public site (landing/about/faq/join), on port
REM 3000. It talks to the same MongoDB database as the owner-dashboard
REM site, but does not start that other app for you - run its own
REM start.bat separately (in its own folder / terminal window) if you
REM want both sites running at once. See ..\CONNECTING_THE_TWO_SITES.md

cd /d "%~dp0"

echo.
echo === MrGym Public Site ===
echo.

if not exist ".env.local" (
    echo WARNING: .env.local not found.
    echo Copy .env.local.example to .env.local and set MONGODB_URI
    echo ^(and NEXT_PUBLIC_DASHBOARD_URL^) before starting, or the app
    echo will fail to connect to the database.
    echo.
    pause
)

REM Install dependencies only if node_modules is missing
if not exist "node_modules" (
    echo Installing dependencies, this only happens once...
    call npm install
    if errorlevel 1 (
        echo.
        echo npm install failed. Make sure Node.js is installed:
        echo https://nodejs.org
        pause
        exit /b 1
    )
)

echo Checking MongoDB connection...
call npm run db:check
if errorlevel 1 (
    echo.
    echo Fix the database connection above, then run start.bat again.
    pause
    exit /b 1
)

echo.
echo Starting server on http://localhost:3000
echo   - Landing page:  http://localhost:3000
echo   - About:         http://localhost:3000/about
echo   - FAQ:           http://localhost:3000/faq
echo   - Join page:     http://localhost:3000/join
echo.
echo The owner dashboard is a SEPARATE site/app - run its own start.bat
echo too if you want it running alongside this one.
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

REM Give the server a moment, then open the browser automatically
start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"

call npm run dev

pause
