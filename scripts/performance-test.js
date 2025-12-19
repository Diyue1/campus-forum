/**
 * 自定义性能测试脚本
 * 使用 Playwright 进行性能测试，对比 Lighthouse
 */

/* eslint-disable @typescript-eslint/no-var-requires */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function measurePerformance(url) {
  console.log(`🔍 测试 URL: ${url}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const metrics = {
    url,
    timestamp: new Date().toISOString(),
    tests: []
  };

  // 测试 1: 页面加载时间
  console.log('📊 测试 1: 页面加载性能...');
  const loadStart = Date.now();
  await page.goto(url, { waitUntil: 'networkidle' });
  const loadTime = Date.now() - loadStart;
  
  metrics.tests.push({
    name: '页面加载时间',
    value: loadTime,
    unit: 'ms',
    threshold: 3000,
    passed: loadTime < 3000
  });
  console.log(`   ⏱️  加载时间: ${loadTime}ms ${loadTime < 3000 ? '✅' : '❌'}`);

  // 测试 2: 首次内容绘制 (FCP)
  console.log('\n📊 测试 2: 首次内容绘制 (FCP)...');
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );
  const fcp = performanceTiming.responseStart - performanceTiming.navigationStart;
  
  metrics.tests.push({
    name: '首次内容绘制 (FCP)',
    value: fcp,
    unit: 'ms',
    threshold: 1800,
    passed: fcp < 1800
  });
  console.log(`   ⏱️  FCP: ${fcp}ms ${fcp < 1800 ? '✅' : '❌'}`);

  // 测试 3: DOM 内容加载完成
  console.log('\n📊 测试 3: DOM 内容加载...');
  const domContentLoaded = performanceTiming.domContentLoadedEventEnd - performanceTiming.navigationStart;
  
  metrics.tests.push({
    name: 'DOM 内容加载完成',
    value: domContentLoaded,
    unit: 'ms',
    threshold: 2000,
    passed: domContentLoaded < 2000
  });
  console.log(`   ⏱️  DOM 加载: ${domContentLoaded}ms ${domContentLoaded < 2000 ? '✅' : '❌'}`);

  // 测试 4: 资源数量和大小
  console.log('\n📊 测试 4: 资源分析...');
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource');
    return {
      count: entries.length,
      totalSize: entries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      types: entries.reduce((acc, entry) => {
        const type = entry.initiatorType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    };
  });

  metrics.tests.push({
    name: '资源数量',
    value: resources.count,
    unit: '个',
    threshold: 50,
    passed: resources.count < 50
  });
  
  metrics.tests.push({
    name: '资源总大小',
    value: resources.totalSize,
    unit: 'bytes',
    threshold: 2 * 1024 * 1024,
    passed: resources.totalSize < 2 * 1024 * 1024
  });

  console.log(`   📦 资源数量: ${resources.count} ${resources.count < 50 ? '✅' : '❌'}`);
  console.log(`   📦 总大小: ${(resources.totalSize / 1024).toFixed(2)} KB ${resources.totalSize < 2 * 1024 * 1024 ? '✅' : '❌'}`);
  console.log(`   📦 资源类型分布:`, resources.types);

  // 测试 5: 内存使用
  console.log('\n📊 测试 5: 内存使用...');
  const memoryInfo = await page.evaluate(() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  });

  if (memoryInfo) {
    metrics.tests.push({
      name: 'JS 堆内存使用',
      value: memoryInfo.usedJSHeapSize,
      unit: 'bytes',
      threshold: 50 * 1024 * 1024,
      passed: memoryInfo.usedJSHeapSize < 50 * 1024 * 1024
    });
    console.log(`   💾 JS 堆内存: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB ${memoryInfo.usedJSHeapSize < 50 * 1024 * 1024 ? '✅' : '❌'}`);
  }

  await browser.close();

  // 保存报告
  const reportDir = path.join(__dirname, '../reports/performance');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const reportPath = path.join(reportDir, `performance-report-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));

  // 生成 HTML 报告
  const htmlReport = generateHTMLReport(metrics);
  fs.writeFileSync(
    path.join(reportDir, `performance-report-${timestamp}.html`),
    htmlReport
  );

  console.log(`\n✅ 报告已保存到: ${reportDir}\n`);

  // 汇总结果
  const totalTests = metrics.tests.length;
  const passedTests = metrics.tests.filter(t => t.passed).length;
  console.log('📈 测试汇总:');
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   通过: ${passedTests}`);
  console.log(`   失败: ${totalTests - passedTests}`);
  console.log(`   通过率: ${((passedTests / totalTests) * 100).toFixed(2)}%\n`);

  if (passedTests === totalTests) {
    console.log('✅ 所有性能测试通过！');
  } else {
    console.log('⚠️  部分性能测试未通过，建议优化！');
    process.exit(1);
  }
}

function generateHTMLReport(metrics) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>性能测试报告</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
    .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; opacity: 0.9; }
    .summary-card .value { font-size: 32px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #4CAF50; color: white; }
    tr:hover { background: #f5f5f5; }
    .passed { color: #4CAF50; font-weight: bold; }
    .failed { color: #f44336; font-weight: bold; }
    .timestamp { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 性能测试报告</h1>
    <p class="timestamp">测试时间: ${metrics.timestamp}</p>
    <p><strong>测试 URL:</strong> ${metrics.url}</p>
    
    <div class="summary">
      <div class="summary-card">
        <h3>总测试数</h3>
        <div class="value">${metrics.tests.length}</div>
      </div>
      <div class="summary-card">
        <h3>通过测试</h3>
        <div class="value">${metrics.tests.filter(t => t.passed).length}</div>
      </div>
      <div class="summary-card">
        <h3>失败测试</h3>
        <div class="value">${metrics.tests.filter(t => !t.passed).length}</div>
      </div>
      <div class="summary-card">
        <h3>通过率</h3>
        <div class="value">${((metrics.tests.filter(t => t.passed).length / metrics.tests.length) * 100).toFixed(1)}%</div>
      </div>
    </div>

    <h2>📊 详细测试结果</h2>
    <table>
      <thead>
        <tr>
          <th>测试项</th>
          <th>测试值</th>
          <th>阈值</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${metrics.tests.map(test => `
          <tr>
            <td>${test.name}</td>
            <td>${test.value} ${test.unit}</td>
            <td>&lt; ${test.threshold} ${test.unit}</td>
            <td class="${test.passed ? 'passed' : 'failed'}">${test.passed ? '✅ 通过' : '❌ 失败'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>
  `;
}

// 运行测试
const url = process.argv[2] || 'http://localhost:3000';
measurePerformance(url).catch(err => {
  console.error('❌ 性能测试失败:', err);
  process.exit(1);
});
