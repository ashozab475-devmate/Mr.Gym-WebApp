@echo off
REM === MrGym - start BOTH websites at once ===
REM Opens two separate command windows, one per site, each running its
REM own start.bat (development mode). Closing a window stops that site;
REM the other keeps running independently.
REM
REM Make sure both mrgym-public\.env.local and
REM mrgym-owner-dashboard\.env.local are set up first (see
REM CONNECTING_THE_TWO_SITES.md), and that PostgreSQL is running.

cd /d "%~dp0"

echo Starting MrGym Public Site (http://localhost:3000) in a new window...
start "MrGym Public Site" cmd /k "cd /d ""%~dp0mrgym-public"" && start.bat"

echo Starting MrGym Owner Dashboard (http://localhost:3001) in a new window...
start "MrGym Owner Dashboard" cmd /k "cd /d ""%~dp0mrgym-owner-dashboard"" && start.bat"

echo.
echo Both sites are starting in their own windows. This window can be
echo closed - it isn't running a server itself.
echo.
pause
