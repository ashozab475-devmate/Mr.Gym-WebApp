@echo off
setlocal

REM === MrGym Public Site - production start script ===
REM Builds an optimized version once, then serves it on port 3000.
REM Use this for day-to-day/front-desk use once you're done editing.
REM Use start.bat instead while you are still editing the code.

cd /d "%~dp0"

echo.
echo === MrGym Public Site (production mode) ===
echo.

if not exist ".env.local" (
    echo WARNING: .env.local not found.
    echo Copy .env.local.example to .env.local and set MONGODB_URI
    echo ^(and NEXT_PUBLIC_DASHBOARD_URL^) before starting, or the app
    echo will fail to connect to the database.
    echo.
    pause
)

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
    echo Fix the database connection above, then run this script again.
    pause
    exit /b 1
)

echo Building the app...
call npm run build
if errorlevel 1 (
    echo.
    echo Build failed. See the errors above.
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
echo The owner dashboard is a SEPARATE site/app - run its own
echo start-production.bat too if you want it running alongside this one.
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"

call npm start

pause
