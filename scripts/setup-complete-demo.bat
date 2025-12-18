@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 完整演示环境设置脚本
echo ========================================
echo.

echo [1/6] 检查 Git 仓库状态...
git status >nul 2>&1
if errorlevel 1 (
    echo ❌ 当前目录不是 Git 仓库
    echo 💡 运行: git init
    pause
    exit /b 1
)
echo ✅ Git 仓库正常

echo.
echo [2/6] 检查远程仓库...
git remote -v | findstr origin >nul
if errorlevel 1 (
    echo ⚠️  未配置远程仓库
    echo 💡 请运行以下命令添加远程仓库:
    echo    git remote add origin https://github.com/你的用户名/仓库名.git
    echo.
    set /p continue="是否继续其他检查? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo ✅ 远程仓库已配置
    git remote -v
)

echo.
echo [3/6] 检查 Node.js 和 npm...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装
    pause
    exit /b 1
)
echo ✅ Node.js 已安装: 
node --version

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装
    pause
    exit /b 1
)
echo ✅ npm 已安装:
npm --version

echo.
echo [4/6] 检查项目依赖...
if not exist "node_modules" (
    echo ⚠️  依赖未安装
    echo 💡 正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)
echo ✅ 项目依赖已安装

echo.
echo [5/6] 检查 k6...
k6 version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  k6 未安装
    echo 💡 安装方法:
    echo    1. 使用 Chocolatey: choco install k6
    echo    2. 使用 winget: winget install k6
    echo    3. 手动下载: https://k6.io/docs/getting-started/installation/
    echo.
) else (
    echo ✅ k6 已安装:
    k6 version
)

echo.
echo [6/6] 检查 Playwright 浏览器...
if not exist "node_modules\@playwright\test" (
    echo ⚠️  Playwright 未安装
    echo 💡 正在安装 Playwright...
    call npm install @playwright/test
)

echo 💡 检查浏览器...
call npx playwright install --dry-run >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Playwright 浏览器未安装
    echo 💡 正在安装浏览器...
    call npx playwright install
    if errorlevel 1 (
        echo ❌ 浏览器安装失败
        pause
        exit /b 1
    )
)
echo ✅ Playwright 浏览器已安装

echo.
echo ========================================
echo ✅ 环境检查完成！
echo ========================================
echo.
echo 📋 下一步操作:
echo.
echo 1. 配置 GitHub 仓库（如果还没有）:
echo    git remote add origin https://github.com/你的用户名/仓库名.git
echo    git push -u origin main
echo.
echo 2. 配置 SonarCloud（推荐）:
echo    访问 https://sonarcloud.io/
echo    使用 GitHub 登录并导入项目
echo.
echo 3. 设置环境变量:
echo    $env:SONAR_HOST_URL="https://sonarcloud.io"
echo    $env:SONAR_TOKEN="你的token"
echo    $env:SONAR_ORGANIZATION="你的组织"
echo.
echo 4. 运行完整演示验证:
echo    .\scripts\run-all-demos.bat
echo.
pause
