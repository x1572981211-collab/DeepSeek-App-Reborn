@echo off
chcp 65001 >nul
echo ========================================
echo   制作分享包
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 清理临时文件...
if exist "backend\venv" rmdir /s /q "backend\venv"
if exist "backend\__pycache__" rmdir /s /q "backend\__pycache__"
if exist "backend\config.json" del /q "backend\config.json"
if exist "backend\history.json" del /q "backend\history.json"
if exist "frontend\node_modules" rmdir /s /q "frontend\node_modules"
if exist "frontend\dist" rmdir /s /q "frontend\dist"

echo [2/3] 创建分享包说明...
echo 请确保已删除所有敏感信息！
echo.
echo 分享包内容：
echo - 源代码
echo - 配置文件模板
echo - 启动脚本
echo - 使用文档
echo.

echo [3/3] 准备完成！
echo.
echo 现在可以将整个 deepseek-app-reborn 文件夹：
echo 1. 压缩为 ZIP 文件
echo 2. 分享给其他用户
echo.
echo 用户使用步骤：
echo 1. 解压文件
echo 2. 安装 Python 3.8+ 和 Node.js 16+
echo 3. 双击"启动应用.bat"
echo.
pause


