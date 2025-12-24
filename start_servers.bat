@echo off
echo 🚀 Starting Development Servers...
echo.

REM Kill any existing processes on our ports to ensure clean start
echo 🧹 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1

REM Wait a moment for cleanup
timeout /t 2 /nobreak >nul

REM Start Django backend server
echo 📡 Starting Django Backend Server on port 8000...
start "Django Backend - http://127.0.0.1:8000/" cmd /k "cd /d %~dp0 && python manage.py runserver 127.0.0.1:8000"

REM Wait for Django to start
timeout /t 5 /nobreak >nul

REM Start React frontend server
echo 🌐 Starting React Frontend Server on port 5173...
start "React Frontend - http://localhost:5173/" cmd /k "cd /d %~dp0\frontend && npm run dev"

REM Wait for React to start
timeout /t 5 /nobreak >nul

echo.
echo ✅ Both servers should now be running!
echo.
echo 📡 Backend (Django):  http://127.0.0.1:8000/
echo 🌐 Frontend (React):  http://localhost:5173/
echo 👑 Admin Panel:       http://127.0.0.1:8000/admin/
echo.
echo 💡 IMPORTANT: Keep both terminal windows open!
echo 🛑 Close terminal windows or press Ctrl+C to stop servers
echo.
echo 🌐 Opening your application in browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173/

pause