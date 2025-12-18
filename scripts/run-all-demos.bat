@echo off
chcp 65001 >nul
echo ========================================
echo 🎯 运行所有演示测试
echo ========================================
echo.

set ERROR_COUNT=0
set SUCCESS_COUNT=0

echo [演示 1/7] 运行单元测试...
echo ----------------------------------------
call npm test
if errorlevel 1 (
    echo ❌ 单元测试失败
    set /a ERROR_COUNT+=1
) else (
    echo ✅ 单元测试通过
    set /a SUCCESS_COUNT+=1
)
echo.

echo [演示 2/7] 生成测试覆盖率报告...
echo ----------------------------------------
call npm run test:coverage
if errorlevel 1 (
    echo ❌ 覆盖率报告生成失败
    set /a ERROR_COUNT+=1
) else (
    echo ✅ 覆盖率报告生成成功
    set /a SUCCESS_COUNT+=1
    echo 💡 打开 coverage\index.html 查看详细报告
)
echo.

echo [演示 3/7] 运行代码检查...
echo ----------------------------------------
call npm run lint
if errorlevel 1 (
    echo ❌ 代码检查失败
    set /a ERROR_COUNT+=1
) else (
    echo ✅ 代码检查通过
    set /a SUCCESS_COUNT+=1
)
echo.

echo [演示 4/7] 测试跟踪系统 - 创建测试记录...
echo ----------------------------------------
call node scripts\test-tracker.js record
if errorlevel 1 (
    echo ❌ 测试记录创建失败
    set /a ERROR_COUNT+=1
) else (
    echo ✅ 测试记录创建成功
    set /a SUCCESS_COUNT+=1
)
echo.

echo [演示 5/7] 测试跟踪系统 - 创建演示 Bug...
echo ----------------------------------------
call node scripts\test-tracker.js bug create "演示Bug" "这是一个演示用的Bug，用于展示Bug管理功能" medium
if errorlevel 1 (
    echo ❌ Bug 创建失败
    set /a ERROR_COUNT+=1
) else (
    echo ✅ Bug 创建成功
    set /a SUCCESS_COUNT+=1
)
echo.

echo [演示 6/7] 测试跟踪系统 - 生成报告...
echo ----------------------------------------
call node scripts\test-tracker.js report
if errorlevel 1 (
    echo ❌ 报告生成失败
    set /a ERROR_COUNT+=1
) else (
    echo ✅ 报告生成成功
    set /a SUCCESS_COUNT+=1
    echo 💡 打开 reports\test-tracking 查看报告
)
echo.

echo [演示 7/7] 检查 Git Hooks 配置...
echo ----------------------------------------
if exist ".husky\pre-commit" (
    echo ✅ pre-commit 钩子存在
    set /a SUCCESS_COUNT+=1
) else (
    echo ❌ pre-commit 钩子不存在
    set /a ERROR_COUNT+=1
)

if exist ".husky\commit-msg" (
    echo ✅ commit-msg 钩子存在
) else (
    echo ❌ commit-msg 钩子不存在
)

if exist ".husky\pre-push" (
    echo ✅ pre-push 钩子存在
) else (
    echo ❌ pre-push 钩子不存在
)
echo.

echo ========================================
echo 📊 演示测试总结
echo ========================================
echo ✅ 成功: %SUCCESS_COUNT%
echo ❌ 失败: %ERROR_COUNT%
echo.

if %ERROR_COUNT% GTR 0 (
    echo ⚠️  部分演示测试失败，请检查错误信息
    echo.
    echo 💡 常见问题:
    echo    - 确保已运行 npm install
    echo    - 确保所有依赖已正确安装
    echo    - 检查 Node.js 版本是否符合要求
) else (
    echo 🎉 所有基础演示测试通过！
    echo.
    echo 📋 需要开发服务器的演示:
    echo    - Lighthouse 测试: npm run test:lighthouse
    echo    - 性能测试: npm run test:performance
    echo    - E2E 测试: npm run test:e2e
    echo    - k6 负载测试: k6 run scripts\load-test.js
    echo.
    echo 💡 启动开发服务器: npm run dev
)
echo.

echo 📁 生成的报告位置:
echo    - 测试覆盖率: coverage\index.html
echo    - 测试跟踪: reports\test-tracking\
echo.

pause
