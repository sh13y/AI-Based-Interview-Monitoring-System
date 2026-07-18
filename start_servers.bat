@echo off
REM Modern Matrix - Quick Start Batch File
REM Run this to start both backend and frontend servers

echo.
echo ====================================
echo Modern Matrix - Quick Start
echo ====================================
echo.

REM Check if backend .env exists
if not exist "backend\.env" (
    echo ERROR: backend\.env file not found!
    echo Please create backend\.env using .env.example as template
    pause
    exit /b 1
)

echo Starting backend and frontend servers...
echo.
echo [1/2] Starting FastAPI Backend...
echo Backend will start on: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
start cmd /k "cd backend && venv\Scripts\python -m uvicorn app.main:app --reload"

timeout /t 3 /nobreak

echo [2/2] Starting React Frontend...
echo Frontend will start on: http://localhost:5173
echo.
start cmd /k "cd frontend && npm run dev"

echo.
echo====================================
echo Both servers are starting!
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key when servers are ready, then open browser
pause

start http://localhost:5173

echo.
echo All services started successfully!
echo.
pausev
