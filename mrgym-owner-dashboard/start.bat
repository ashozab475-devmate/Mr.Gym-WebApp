@echo off
setlocal

REM === MrGym Owner Dashboard - start script (development mode) ===
REM This starts ONLY the owner/staff dashboard site (login + dashboard),
REM on port 3001. It talks to the same PostgreSQL database as the public
REM site, but does not start that other app for you - run its own
REM start.bat separately (in its own folder / terminal window) if you
REM want both sites running at once. See ..\CONNECTING_THE_TWO_SITES.md

cd /d "%~dp0"

echo.
echo === MrGym Owner Dashboard ===
echo.

if not exist ".env.local" (
    echo WARNING: .env.local not found.
    echo Copy .env.local.example to .env.local and set DATABASE_URL,
    echo Google OAuth credentials, and OWNER_EMAILS before starting,
    echo or the app will fail to connect / let anyone sign in.
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

echo Checking PostgreSQL connection...
call npm run db:check
if errorlevel 1 (
    echo.
    echo Fix the database connection above, then run start.bat again.
    pause
    exit /b 1
)

echo.
echo Starting server on http://localhost:3001
echo   - Owner login:      http://localhost:3001/login
echo   - Staff dashboard:  http://localhost:3001/dashboard
echo.
echo The public site is a SEPARATE site/app - run its own start.bat too
echo if you want it running alongside this one. New members registered
echo there will show up here automatically (same database).
echo.
echo Press Ctrl+C in this window to stop the server.
echo.

REM Give the server a moment, then open the browser automatically
start "" cmd /c "timeout /t 3 >nul && start http://localhost:3001/login"

call npm run dev

pause
