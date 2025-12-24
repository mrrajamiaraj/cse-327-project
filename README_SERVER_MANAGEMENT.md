# 🚀 Development Server Management Guide

## 🤔 **Why Do Servers Stop?**

Development servers are **temporary processes** that run only while your terminal/command prompt is open. When you:
- Close the terminal window
- Turn off your computer
- Press Ctrl+C in the terminal

The servers **automatically stop** because they're not permanent services.

## ✅ **Quick Solutions**

### **Option 1: Use the Batch File (Easiest)**
1. **Double-click** `start_servers.bat` in your project folder
2. **Two terminal windows** will open (one for Django, one for React)
3. **Keep both windows open** while developing
4. **Access your app** at `http://localhost:5173/`

### **Option 2: Use PowerShell Script**
1. **Right-click** `start_servers.ps1` → "Run with PowerShell"
2. **Follow the prompts** to start both servers
3. **Keep terminals open** while developing

### **Option 3: Manual Start (Traditional)**
```bash
# Terminal 1 - Start Django Backend
python manage.py runserver

# Terminal 2 - Start React Frontend  
cd frontend
npm run dev
```

### **Option 4: Create Desktop Shortcut**
1. **Run** `create_desktop_shortcut.bat`
2. **Find shortcut** on your desktop: "Start Dev Servers"
3. **Double-click shortcut** whenever you want to start servers

## 🔄 **Daily Workflow**

### **Starting Development:**
1. **Double-click** `start_servers.bat` OR desktop shortcut
2. **Wait** for both servers to start (30-60 seconds)
3. **Open browser** to `http://localhost:5173/`
4. **Start coding!**

### **During Development:**
- ✅ **Keep terminal windows open**
- ✅ **Servers auto-reload** when you save files
- ✅ **No need to restart** for most changes

### **Ending Development:**
- 🛑 **Close terminal windows** OR press Ctrl+C
- 🛑 **Servers automatically stop**

## 🚨 **Common Issues & Solutions**

### **"Port already in use" Error:**
```bash
# Kill existing processes
taskkill /f /im python.exe
taskkill /f /im node.exe
# Then restart servers
```

### **"Cannot connect to backend" Error:**
- ✅ **Check Django server** is running on `http://127.0.0.1:8000/`
- ✅ **Restart Django server** if needed

### **"Page not found" Error:**
- ✅ **Check React server** is running on `http://localhost:5173/`
- ✅ **Use correct URL** (5173, not 5174 or other ports)

## 🎯 **Pro Tips**

### **Faster Startup:**
1. **Pin terminals** to taskbar for quick access
2. **Use batch file** instead of manual commands
3. **Create desktop shortcut** for one-click start

### **Better Development Experience:**
- 📱 **Bookmark** `http://localhost:5173/` in browser
- 🔄 **Enable auto-reload** in browser dev tools
- 📊 **Monitor server logs** in terminal windows
- 🛠️ **Keep terminals visible** to see errors/logs

### **Troubleshooting:**
- 🔍 **Check terminal output** for error messages
- 🔄 **Restart servers** if something seems broken
- 📝 **Check file changes** are being detected
- 🌐 **Try different browser** if issues persist

## 📋 **Server Status Check**

### **Quick Health Check:**
- **Django Backend**: Visit `http://127.0.0.1:8000/admin/`
- **React Frontend**: Visit `http://localhost:5173/`
- **API Connection**: Login and check if data loads

### **If Servers Won't Start:**
1. **Check if ports are free**: `netstat -ano | findstr :8000`
2. **Kill existing processes**: Use Task Manager
3. **Restart computer** if all else fails
4. **Run batch file again**

## 🎉 **You're All Set!**

Now you have **multiple ways** to start your development servers quickly and easily. Choose the method that works best for you:

- 🖱️ **Desktop shortcut** - One-click start
- 📁 **Batch file** - Double-click in project folder  
- 💻 **PowerShell script** - Advanced users
- ⌨️ **Manual commands** - Full control

**Happy coding!** 🚀