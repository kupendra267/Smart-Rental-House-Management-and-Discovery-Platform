#!/bin/bash
echo "======================================================================"
echo "🚀 Starting Smart Rental House Management & Discovery Platform"
echo "======================================================================"

# Start backend
cd backend && npm run dev &
BACKEND_PID=$!
echo "✅ Backend API running on PID $BACKEND_PID (http://localhost:5000)"

# Start frontend
cd ../frontend && npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend UI running on PID $FRONTEND_PID (http://localhost:5173)"

echo "======================================================================"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend:  http://localhost:5000/api"
echo "======================================================================"

wait
