# PowerShell script to start both development servers
Write-Host "🚀 Starting Development Servers..." -ForegroundColor Green
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Start Django backend server
Write-Host "📡 Starting Django Backend Server..." -ForegroundColor Cyan
if (Test-Port 8000) {
    Write-Host "⚠️  Port 8000 is already in use. Django server might already be running." -ForegroundColor Yellow
} else {
    Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver" -WindowStyle Normal
    Write-Host "✅ Django server started" -ForegroundColor Green
}

# Wait a moment for Django to start
Start-Sleep -Seconds 3

# Start React frontend server
Write-Host "🌐 Starting React Frontend Server..." -ForegroundColor Cyan
Set-Location -Path "frontend"
if (Test-Port 5173) {
    Write-Host "⚠️  Port 5173 is already in use. React server might already be running." -ForegroundColor Yellow
} else {
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
    Write-Host "✅ React server started" -ForegroundColor Green
}

Set-Location -Path ".."

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host "📡 Backend will be available at: http://127.0.0.1:8000/" -ForegroundColor White
Write-Host "🌐 Frontend will be available at: http://localhost:5173/" -ForegroundColor White
Write-Host ""
Write-Host "💡 Keep the terminal windows open to keep servers running" -ForegroundColor Yellow
Write-Host "🛑 Close terminal windows or press Ctrl+C to stop servers" -ForegroundColor Red
Write-Host ""

# Wait for user input
Read-Host "Press Enter to exit this script (servers will continue running)"