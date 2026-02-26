@echo off
chcp 65001 >nul
echo ========================================
echo   停止所有服务
echo ========================================
echo.

:: 停止后端服务 (Python)
echo 正在停止后端服务...
taskkill /F /FI "WINDOWTITLE eq DeepSeek Backend*" >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

:: 停止前端服务 (Node.js)
echo 正在停止前端服务...
taskkill /F /FI "WINDOWTITLE eq DeepSeek Frontend*" >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo.
echo 所有服务已停止！
echo.
pause





