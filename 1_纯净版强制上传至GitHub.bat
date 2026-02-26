@echo off
chcp 65001 >nul
echo ========================================
echo       DeepSeek App Reborn
echo       纯净开源版 自动上传至 GitHub
echo ========================================
echo.

git --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 请先到 https://git-scm.com/ 安装 Git 客户端！
    pause
    exit /b 1
)

echo [1/3] 正在保存最新的纯净代码（不含配置、记录及运行环境）...
git branch -M main
git add .
git commit -m "feat: Initial clean open-source release"

echo.
echo [2/3] 请在下方输入您的 GitHub 仓库地址。
echo 例如: https://github.com/your-username/deepseek-app-reborn.git
echo (提示: 如果您之前在此仓库传过带有隐私的脏数据，本次上传将会【彻底覆盖并清除】线上的旧数据！)
echo.
set /p REPO_URL="请输入地址并回车: "

if "%REPO_URL%"=="" (
    echo [错误] 仓库地址不能为空！
    pause
    exit /b 1
)

:: 尝试移除旧的 origin（如果有）
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo [3/3] 开始向 GitHub 执行强制推送...
echo 请在弹出的浏览器页面中进行授权登录。
echo.

:: 核心命令：强制覆盖推送
git push -f -u origin main

if errorlevel 1 (
    echo.
    echo [失败] 推送失败！可能是网络无法连接 GitHub，或者授权被拒绝。
) else (
    echo.
    echo [成功] 👌 代码已成功推送到您的 GitHub！
    echo 这是一个纯净且开箱即用的开源版本，没有任何您的隐私数据！
)

echo.
pause
