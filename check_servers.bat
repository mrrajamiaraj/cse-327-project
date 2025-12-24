@echo off
echo 🔍 Checking Server Status...
echo.

REM Check if Django server is running
echo 📡 Checking Django Backend (port 8000)...
netstat -an | findstr :8000 >nul
if %errorlevel% == 0 (
    echo ✅ Django server is running on http://127.0.0.1:8000/
) else (
    echo ❌ Django server is NOT running
)

echo.

REM Check if React server is running  
echo 🌐 Checking React Frontend (port 5173)...
netstat -an | findstr :5173 >nul
if %errorlevel% == 0 (
    echo ✅ React server is running on http://localhost:5173/
) else (
    echo ❌ React server is NOT running
)

echo.

REM Test if servers are actually responding
echo 🧪 Testing server responses...

REM Test Django
curl -s -o nul -w "Django Backend: %%{http_code}" http://127.0.0.1:8000/ 2>nul
if %errorlevel% == 0 (
    echo  ✅
) else (
    echo  ❌ (Not responding)
)

REM Test React
curl -s -o nul -w "React Frontend: %%{http_code}" http://localhost:5173/ 2>nul
if %errorlevel% == 0 (
    echo  ✅
) else (
    echo  ❌ (Not responding)
)

echo.
echo 💡 If servers are not running, use start_servers.bat to start them
pause