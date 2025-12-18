@echo off
echo ========================================
echo 正在安装 3D 依赖...
echo ========================================
echo.

echo 步骤 1: 安装 TresJS Core...
call npm install @tresjs/core@^3.9.0

echo.
echo 步骤 2: 安装 TresJS Cientos...
call npm install @tresjs/cientos@^3.8.0

echo.
echo 步骤 3: 确认 Three.js 已安装...
call npm install three@^0.160.0

echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo 现在可以运行: npm run dev
echo.
pause

