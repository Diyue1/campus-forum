/**
 * Lighthouse 性能测试脚本
 * 用于测试网站性能、可访问性、最佳实践、SEO等指标
 */

/* eslint-disable @typescript-eslint/no-var-requires */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runLighthouse() {
  console.log('🚀 启动 Lighthouse 性能测试...\n');

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse('http://localhost:3000', options);

  // 生成报告
  const reportDir = path.join(__dirname, '../reports/lighthouse');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  
  // 保存 HTML 报告
  fs.writeFileSync(
    path.join(reportDir, `lighthouse-report-${timestamp}.html`),
    runnerResult.report[0]
  );

  // 保存 JSON 报告
  fs.writeFileSync(
    path.join(reportDir, `lighthouse-report-${timestamp}.json`),
    runnerResult.report[1]
  );

  // 输出结果
  const scores = runnerResult.lhr.categories;
  console.log('📊 Lighthouse 测试结果:\n');
  console.log(`性能 (Performance):      ${(scores.performance.score * 100).toFixed(0)}/100`);
  console.log(`可访问性 (Accessibility): ${(scores.accessibility.score * 100).toFixed(0)}/100`);
  console.log(`最佳实践 (Best Practices): ${(scores['best-practices'].score * 100).toFixed(0)}/100`);
  console.log(`SEO:                      ${(scores.seo.score * 100).toFixed(0)}/100`);
  console.log(`\n✅ 报告已保存到: ${reportDir}\n`);

  // 性能指标详情
  const metrics = runnerResult.lhr.audits;
  console.log('⏱️  关键性能指标:\n');
  console.log(`首次内容绘制 (FCP):       ${metrics['first-contentful-paint'].displayValue}`);
  console.log(`最大内容绘制 (LCP):       ${metrics['largest-contentful-paint'].displayValue}`);
  console.log(`总阻塞时间 (TBT):         ${metrics['total-blocking-time'].displayValue}`);
  console.log(`累积布局偏移 (CLS):       ${metrics['cumulative-layout-shift'].displayValue}`);
  console.log(`速度指数 (Speed Index):   ${metrics['speed-index'].displayValue}`);

  await chrome.kill();

  // 判断是否通过
  const performanceScore = scores.performance.score * 100;
  if (performanceScore < 70) {
    console.log('\n⚠️  警告: 性能分数低于 70，建议优化！');
    process.exit(1);
  } else {
    console.log('\n✅ 性能测试通过！');
  }
}

runLighthouse().catch(err => {
  console.error('❌ Lighthouse 测试失败:', err);
  process.exit(1);
});
