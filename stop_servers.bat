@echo off
echo 🛑 Stopping Development Servers...
echo.

REM Stop Django server (port 8000)
echo 📡 Stopping Django Backend Server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM Stop React server (port 5173)
echo 🌐 Stopping React Frontend Server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM Also kill any remaining Python and Node processes related to our project
echo 🧹 Cleaning up remaining processes...
taskkill /f /im "python.exe" /fi "WINDOWTITLE eq Django Backend*" >nul 2>&1
taskkill /f /im "node.exe" /fi "WINDOWTITLE eq React Frontend*" >nul 2>&1

echo.
echo ✅ All development servers stopped!
echo 💡 Use start_servers.bat to restart them
pause