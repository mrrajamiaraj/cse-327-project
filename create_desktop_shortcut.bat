@echo off
echo 🖥️ Creating Desktop Shortcut for Development Servers...

REM Get current directory
set "CURRENT_DIR=%~dp0"

REM Create VBS script to create shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = "%USERPROFILE%\Desktop\Start Dev Servers.lnk" >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "%CURRENT_DIR%start_servers.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "%CURRENT_DIR%" >> CreateShortcut.vbs
echo oLink.Description = "Start Django Backend and React Frontend Servers" >> CreateShortcut.vbs
echo oLink.IconLocation = "shell32.dll,25" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs

REM Execute VBS script
cscript CreateShortcut.vbs >nul

REM Clean up
del CreateShortcut.vbs

echo ✅ Desktop shortcut created: "Start Dev Servers"
echo 💡 Double-click the shortcut on your desktop to start both servers
pause