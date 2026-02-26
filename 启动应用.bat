@echo off
chcp 65001 >nul
echo ========================================
echo   DeepSeek App Reborn - 一键启动
echo ========================================
echo.

cd /d "%~dp0"

:: 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.8+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

:: 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] 检查后端依赖...
cd backend
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt -q

echo.
echo [2/4] 启动后端服务...
start "DeepSeek Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate.bat && python main.py"

timeout /t 3 /nobreak >nul

cd ..\frontend

echo.
echo [3/4] 检查前端依赖...
if not exist "node_modules" (
    echo 安装前端依赖（首次启动需要几分钟）...
    call npm install
)

echo.
echo [4/4] 启动前端服务...
start "DeepSeek Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   启动完成！
echo ========================================
echo.
echo 后端服务: http://localhost:8765
echo 前端服务: http://localhost:5173
echo.
echo 浏览器将自动打开应用...
echo 关闭此窗口不会停止服务
echo.

:: 打开浏览器
start http://localhost:5173

echo 按任意键关闭此窗口...
pause >nul





