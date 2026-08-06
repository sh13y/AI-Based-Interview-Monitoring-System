@echo off
REM Modern Matrix - Start development server

echo.
echo ====================================
echo Modern Matrix - Development Server
echo ====================================
echo.

cd frontend

if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

echo Starting frontend on http://localhost:5173
echo.
call npm run dev
