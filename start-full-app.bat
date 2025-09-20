@echo off
echo Stopping existing processes...
taskkill /f /im node.exe 2>nul

echo Starting Full Task Scheduler Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Application...
start "Frontend App" cmd /k "cd client && npm start"

echo.
echo Application is starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul

