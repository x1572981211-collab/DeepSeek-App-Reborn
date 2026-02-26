@echo off
chcp 65001 >nul
echo ========================================
echo   环境检查
echo ========================================
echo.

echo [检查 Python]
python --version
if errorlevel 1 (
    echo ❌ Python 未安装
    pause
    exit /b 1
) else (
    echo ✅ Python 已安装
)

echo.
echo [检查 Node.js]
node --version
if errorlevel 1 (
    echo ❌ Node.js 未安装或未添加到 PATH
    echo.
    echo 解决方法：
    echo 1. 确认已安装 Node.js
    echo 2. 重启电脑（让 PATH 生效）
    echo 3. 或手动添加到 PATH：
    echo    - 默认路径：C:\Program Files\nodejs
    pause
    exit /b 1
) else (
    echo ✅ Node.js 已安装
)

echo.
echo [检查 npm]
npm --version
if errorlevel 1 (
    echo ❌ npm 未找到
    pause
    exit /b 1
) else (
    echo ✅ npm 已安装
)

echo.
echo ========================================
echo   环境检查完成！
echo ========================================
echo.
echo 所有依赖都已就绪，可以启动应用了！
echo.
pause





