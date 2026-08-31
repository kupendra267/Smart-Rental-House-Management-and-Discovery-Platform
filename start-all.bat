@echo off
TITLE Smart Rental House Platform - One-Click Launcher
echo ======================================================================
echo 🚀 Starting Smart Rental House Management & Discovery Platform
echo ======================================================================
echo.

echo [1/2] Starting Node.js Backend API Server (Port 5000)...
start "Smart Rental - Backend API" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React + Vite Frontend (Port 5173)...
start "Smart Rental - Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo 🎉 Platform services launched successfully!
echo.
echo 🌐 Frontend UI:     http://localhost:5173
echo 🔌 Backend API:     http://localhost:5000/api
echo 📊 API Health:      http://localhost:5000/health
echo.
echo 👑 Quick Viva Demo Credentials:
echo    - Admin:   admin@smartrental.com   / Admin@12345
echo    - Owner:   owner1@smartrental.com  / Owner@12345
echo    - Tenant:  tenant1@smartrental.com / Tenant@12345
echo ======================================================================
pause
