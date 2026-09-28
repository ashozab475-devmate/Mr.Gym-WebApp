@echo off
setlocal

REM === MrGym Owner Dashboard - production start script ===
REM Builds an optimized version once, then serves it on port 3001.
REM Use this for day-to-day/front-desk use once you're done editing.
REM Use start.bat instead while you are still editing the code.

cd /d "%~dp0"

echo.
echo === MrGym Owner Dashboard (production mode) ===
echo.

if not exist ".env.local" (
    echo WARNING: .env.local not found.
    echo Copy .env.local.example to .env.local and set DATABASE_URL,
    echo Google OAuth credentials, and OWNER_EMAILS before starting,
    echo or the app will fail to connect / let anyone sign in.
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

echo Checking PostgreSQL connection...
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
echo Starting server on http://localhost:3001
echo   - Owner login:      http://localhost:3001/login
echo   - Staff dashboard:  http://localhost:3001/dashboard
echo.
echo The public site is a SEPARATE site/app - run its own
echo start-production.bat too if you want it running alongside this one.
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

start "" cmd /c "timeout /t 3 >nul && start http://localhost:3001/login"

call npm start

pause
