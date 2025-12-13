@echo off
echo --- Management Outlook ERP Setup ---
echo Checking for Node.js...
node -v
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. Por favor instala Node.js primero: https://nodejs.org/
    pause
    exit /b
)

echo Installing dependencies...
call npm install

echo Generating Prisma Client...
call npx prisma generate

echo Starting Development Server...
echo La aplicacion estara disponible en: http://localhost:3000
call npm run dev
pause
