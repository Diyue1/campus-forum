@echo off
chcp 65001 >nul
echo ========================================
echo 🌐 运行需要开发服务器的演示
echo ========================================
echo.

echo ⚠️  注意: 这些演示需要开发服务器运行在 http://localhost:3000
echo.
echo 💡 请先在另一个终端运行: npm run dev
echo.
set /p confirm="开发服务器是否已启动? (y/n): "
if /i not "%confirm%"=="y" (
    echo.
    echo 请先启动开发服务器，然后重新运行此脚本
    pause
    exit /b 1
)

echo.
echo 🔍 检查服务器是否可访问...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ 无法访问 http://localhost:3000
    echo 💡 请确保开发服务器正在运行
    pause
    exit /b 1
)
echo ✅ 服务器正在运行

set ERROR_COUNT=0
set SUCCESS_COUNT=0

echo.
echo ========================================
echo [演示 1/4] Lighthouse 性能测试
echo ========================================
echo 💡 这将测试网页性能、可访问性、最佳实践、SEO
echo.
call npm run test:lighthouse
if errorlevel 1 (
    echo ❌ Lighthouse 测试失败
    set /a ERROR_COUNT+=1
) else (
    echo ✅ Lighthouse 测试完成
    set /a SUCCESS_COUNT+=1
    echo 📊 报告位置: reports\lighthouse\
)
echo.
pause

echo.
echo ========================================
echo [演示 2/4] 自定义性能测试
echo ========================================
echo 💡 这将测试页面加载时间、资源大小、内存使用等
echo.
call npm run test:performance
if errorlevel 1 (
    echo ❌ 性能测试失败
    set /a ERROR_COUNT+=1
) else (
    echo ✅ 性能测试完成
    set /a SUCCESS_COUNT+=1
    echo 📊 报告位置: reports\performance\
)
echo.
pause

echo.
echo ========================================
echo [演示 3/4] E2E 端到端测试
echo ========================================
echo 💡 这将测试用户登录、注册、导航等完整流程
echo.
call npm run test:e2e
if errorlevel 1 (
    echo ❌ E2E 测试失败
    set /a ERROR_COUNT+=1
    echo 💡 查看报告: npx playwright show-report
) else (
    echo ✅ E2E 测试完成
    set /a SUCCESS_COUNT+=1
)
echo.
pause

echo.
echo ========================================
echo [演示 4/4] k6 负载测试
echo ========================================
echo 💡 这将模拟多用户并发访问
echo.

k6 version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  k6 未安装
    echo 💡 安装方法:
    echo    choco install k6
    echo    或访问: https://k6.io/docs/getting-started/installation/
    echo.
    set /a ERROR_COUNT+=1
) else (
    echo ✅ k6 已安装
    echo.
    call k6 run scripts\load-test.js
    if errorlevel 1 (
        echo ❌ k6 测试失败
        set /a ERROR_COUNT+=1
    ) else (
        echo ✅ k6 测试完成
        set /a SUCCESS_COUNT+=1
        echo 📊 报告位置: reports\performance\k6-summary.json
    )
)
echo.

echo ========================================
echo 📊 服务器演示测试总结
echo ========================================
echo ✅ 成功: %SUCCESS_COUNT%
echo ❌ 失败: %ERROR_COUNT%
echo.

if %ERROR_COUNT% GTR 0 (
    echo ⚠️  部分测试失败，请检查错误信息
) else (
    echo 🎉 所有服务器演示测试通过！
)
echo.

echo 📁 查看生成的报告:
echo    - Lighthouse: explorer reports\lighthouse
echo    - 性能测试: explorer reports\performance
echo    - E2E 测试: npx playwright show-report
echo.

pause
