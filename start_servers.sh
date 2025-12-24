#!/bin/bash

echo "🚀 Starting Development Servers..."
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Start Django backend server
echo "📡 Starting Django Backend Server..."
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. Django server might already be running."
else
    python manage.py runserver &
    DJANGO_PID=$!
    echo "✅ Django server started (PID: $DJANGO_PID)"
fi

# Wait a moment for Django to start
sleep 3

# Start React frontend server
echo "🌐 Starting React Frontend Server..."
cd frontend
if check_port 5173; then
    echo "⚠️  Port 5173 is already in use. React server might already be running."
else
    npm run dev &
    REACT_PID=$!
    echo "✅ React server started (PID: $REACT_PID)"
fi

echo ""
echo "✅ Both servers are starting..."
echo "📡 Backend will be available at: http://127.0.0.1:8000/"
echo "🌐 Frontend will be available at: http://localhost:5173/"
echo ""
echo "💡 Servers are running in the background"
echo "🛑 Run 'pkill -f \"manage.py runserver\"' and 'pkill -f \"vite\"' to stop servers"
echo ""

# Keep script running to show server status
echo "Press Ctrl+C to stop monitoring (servers will continue running)"
while true; do
    sleep 10
    if check_port 8000 && check_port 5173; then
        echo "$(date): ✅ Both servers are running"
    elif check_port 8000; then
        echo "$(date): ⚠️  Only Django server is running"
    elif check_port 5173; then
        echo "$(date): ⚠️  Only React server is running"
    else
        echo "$(date): ❌ No servers are running"
        break
    fi
done