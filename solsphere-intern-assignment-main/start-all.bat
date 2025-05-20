@echo off
echo Starting System Health Monitor components...

REM Start MongoDB (if installed locally)
echo Starting MongoDB...
start "MongoDB" mongod --dbpath=data/db

REM Start Backend Server
echo Starting Backend Server...
cd backend
start "Backend Server" cmd /c "node server.js"
cd ..

REM Start Admin Dashboard
echo Starting Admin Dashboard...
cd admin-dashboard
start "Admin Dashboard" cmd /c "npm run dev"
cd ..

REM Start System Utility (for testing)
echo Starting System Utility...
cd system-utility
start "System Utility" cmd /c "python system_monitor.py"
cd ..

echo All components started!
echo.
echo Backend Server: http://localhost:3000
echo Admin Dashboard: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
