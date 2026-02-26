@echo off
chcp 65001 >nul
echo ========================================
echo       DeepSeek App Reborn
echo       纯净版强制上传 GitHub 脚本
echo ========================================
echo.

git --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 请先到 https://git-scm.com/ 安装 Git 客户端！
    pause
    exit /b 1
)

echo [1/3] 正在保存最新的纯净代码...
git branch -M main
git add .
git commit -m "feat: Initial commit with clean setup"

echo.
echo [2/3] 因为您之前可能推送了包含敏感数据的旧文件，为了保护您的数据安全以及保持项目纯净：
echo 我们现在需要【强制覆盖】仓库。它会清除线上的旧代码，换成现在这个最纯净的版本。
echo.
echo 您上传的 GitHub 仓库地址是: 
echo https://github.com/x1572981211-collab/DeepSeek-App-Reborn.git
echo.

:: 强行覆盖之前的 remote 配置
git remote remove origin 2>nul
git remote add origin https://github.com/x1572981211-collab/DeepSeek-App-Reborn.git

echo [3/3] 开始向 GitHub 执行强制推送...
echo 请在弹出的浏览器页面中进行授权登录。
echo.

git push -f -u origin main

if errorlevel 1 (
    echo.
    echo [失败] 推送失败！可能是您的网络无法连接 GitHub，或者授权被拒绝。
) else (
    echo.
    echo [成功] 👌 代码已成功推送到您的 GitHub！线上的旧数据已经被彻底清掉，现在是一个完整的、纯净的框架。
)

echo.
pause
