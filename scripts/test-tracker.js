/**
 * 测试跟踪与故障管理系统
 * 用于记录测试结果、跟踪 Bug、生成报告
 */

/* eslint-disable @typescript-eslint/no-var-requires, no-case-declarations */
const fs = require('fs');
const path = require('path');

class TestTracker {
  constructor() {
    this.dataDir = path.join(__dirname, '../reports/test-tracking');
    this.bugsFile = path.join(this.dataDir, 'bugs.json');
    this.testHistoryFile = path.join(this.dataDir, 'test-history.json');
    this.metricsFile = path.join(this.dataDir, 'metrics.json');
    
    this.ensureDataDir();
    this.loadData();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  loadData() {
    this.bugs = this.loadJSON(this.bugsFile, []);
    this.testHistory = this.loadJSON(this.testHistoryFile, []);
    this.metrics = this.loadJSON(this.metricsFile, {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalBugs: 0,
      openBugs: 0,
      closedBugs: 0,
      criticalBugs: 0,
      averageFixTime: 0
    });
  }

  loadJSON(filePath, defaultValue) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (error) {
      console.warn(`无法加载 ${filePath}:`, error.message);
    }
    return defaultValue;
  }

  saveData() {
    fs.writeFileSync(this.bugsFile, JSON.stringify(this.bugs, null, 2));
    fs.writeFileSync(this.testHistoryFile, JSON.stringify(this.testHistory, null, 2));
    fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
  }

  // 记录测试结果
  recordTestRun(testResults) {
    const record = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: testResults.type || 'unit',
      total: testResults.total || 0,
      passed: testResults.passed || 0,
      failed: testResults.failed || 0,
      skipped: testResults.skipped || 0,
      duration: testResults.duration || 0,
      coverage: testResults.coverage || null,
      failedTests: testResults.failedTests || []
    };

    this.testHistory.push(record);
    this.updateMetrics();
    this.saveData();

    console.log(`✅ 测试记录已保存 (ID: ${record.id})`);
    return record;
  }

  // 创建 Bug
  createBug(bugData) {
    const bug = {
      id: `BUG-${Date.now()}`,
      title: bugData.title,
      description: bugData.description,
      severity: bugData.severity || 'medium', // low, medium, high, critical
      status: 'open', // open, in-progress, resolved, closed
      priority: bugData.priority || 'medium',
      assignee: bugData.assignee || null,
      reporter: bugData.reporter || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      testCase: bugData.testCase || null,
      stackTrace: bugData.stackTrace || null,
      steps: bugData.steps || [],
      tags: bugData.tags || [],
      comments: []
    };

    this.bugs.push(bug);
    this.updateMetrics();
    this.saveData();

    console.log(`🐛 Bug 已创建: ${bug.id} - ${bug.title}`);
    return bug;
  }

  // 更新 Bug 状态
  updateBugStatus(bugId, status, comment) {
    const bug = this.bugs.find(b => b.id === bugId);
    if (!bug) {
      console.error(`❌ Bug 不存在: ${bugId}`);
      return null;
    }

    bug.status = status;
    bug.updatedAt = new Date().toISOString();

    if (status === 'resolved' || status === 'closed') {
      bug.resolvedAt = new Date().toISOString();
    }

    if (comment) {
      bug.comments.push({
        text: comment,
        timestamp: new Date().toISOString()
      });
    }

    this.updateMetrics();
    this.saveData();

    console.log(`✅ Bug 状态已更新: ${bugId} -> ${status}`);
    return bug;
  }

  // 更新指标
  updateMetrics() {
    const recentTests = this.testHistory.slice(-10);
    
    this.metrics.totalTests = this.testHistory.length;
    this.metrics.passedTests = this.testHistory.filter(t => t.failed === 0).length;
    this.metrics.failedTests = this.testHistory.filter(t => t.failed > 0).length;
    
    this.metrics.totalBugs = this.bugs.length;
    this.metrics.openBugs = this.bugs.filter(b => b.status === 'open' || b.status === 'in-progress').length;
    this.metrics.closedBugs = this.bugs.filter(b => b.status === 'closed' || b.status === 'resolved').length;
    this.metrics.criticalBugs = this.bugs.filter(b => b.severity === 'critical' && b.status !== 'closed').length;

    // 计算平均修复时间
    const resolvedBugs = this.bugs.filter(b => b.resolvedAt);
    if (resolvedBugs.length > 0) {
      const totalFixTime = resolvedBugs.reduce((sum, bug) => {
        const created = new Date(bug.createdAt);
        const resolved = new Date(bug.resolvedAt);
        return sum + (resolved - created);
      }, 0);
      this.metrics.averageFixTime = Math.round(totalFixTime / resolvedBugs.length / 1000 / 60 / 60); // 小时
    }

    // 测试通过率趋势
    if (recentTests.length > 0) {
      const totalTestCases = recentTests.reduce((sum, t) => sum + t.total, 0);
      const passedTestCases = recentTests.reduce((sum, t) => sum + t.passed, 0);
      this.metrics.recentPassRate = ((passedTestCases / totalTestCases) * 100).toFixed(2);
    }
  }

  // 生成报告
  generateReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: this.metrics,
      recentTests: this.testHistory.slice(-5),
      openBugs: this.bugs.filter(b => b.status === 'open' || b.status === 'in-progress'),
      criticalBugs: this.bugs.filter(b => b.severity === 'critical' && b.status !== 'closed'),
      bugsByStatus: {
        open: this.bugs.filter(b => b.status === 'open').length,
        inProgress: this.bugs.filter(b => b.status === 'in-progress').length,
        resolved: this.bugs.filter(b => b.status === 'resolved').length,
        closed: this.bugs.filter(b => b.status === 'closed').length
      },
      bugsBySeverity: {
        critical: this.bugs.filter(b => b.severity === 'critical').length,
        high: this.bugs.filter(b => b.severity === 'high').length,
        medium: this.bugs.filter(b => b.severity === 'medium').length,
        low: this.bugs.filter(b => b.severity === 'low').length
      }
    };

    const reportPath = path.join(this.dataDir, `report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 生成 HTML 报告
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(this.dataDir, `report-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, htmlReport);

    console.log(`\n📊 测试跟踪报告已生成:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}\n`);

    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>测试跟踪与故障管理报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0f2f5; padding: 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { color: #1a1a1a; margin-bottom: 10px; }
    .timestamp { color: #666; font-size: 14px; margin-bottom: 30px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .metric-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .metric-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
    .metric-card .value { font-size: 36px; font-weight: bold; color: #1a1a1a; }
    .metric-card .subtitle { color: #999; font-size: 12px; margin-top: 5px; }
    .section { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .section h2 { color: #1a1a1a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e0e0e0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    th { background: #f8f9fa; font-weight: 600; color: #666; font-size: 13px; text-transform: uppercase; }
    tr:hover { background: #f8f9fa; }
    .status { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status-open { background: #fff3cd; color: #856404; }
    .status-in-progress { background: #cce5ff; color: #004085; }
    .status-resolved { background: #d4edda; color: #155724; }
    .status-closed { background: #d1ecf1; color: #0c5460; }
    .severity { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .severity-critical { background: #f8d7da; color: #721c24; }
    .severity-high { background: #fff3cd; color: #856404; }
    .severity-medium { background: #cce5ff; color: #004085; }
    .severity-low { background: #d4edda; color: #155724; }
    .chart { margin: 20px 0; }
    .bar { height: 30px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border-radius: 4px; margin: 10px 0; position: relative; }
    .bar-label { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: white; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 测试跟踪与故障管理报告</h1>
    <p class="timestamp">生成时间: ${report.generatedAt}</p>

    <div class="metrics-grid">
      <div class="metric-card">
        <h3>总测试运行次数</h3>
        <div class="value">${report.summary.totalTests}</div>
        <div class="subtitle">通过率: ${report.summary.recentPassRate || 0}%</div>
      </div>
      <div class="metric-card">
        <h3>Bug 总数</h3>
        <div class="value">${report.summary.totalBugs}</div>
        <div class="subtitle">已关闭: ${report.summary.closedBugs}</div>
      </div>
      <div class="metric-card">
        <h3>未解决 Bug</h3>
        <div class="value" style="color: ${report.summary.openBugs > 0 ? '#f44336' : '#4CAF50'}">${report.summary.openBugs}</div>
        <div class="subtitle">严重: ${report.summary.criticalBugs}</div>
      </div>
      <div class="metric-card">
        <h3>平均修复时间</h3>
        <div class="value">${report.summary.averageFixTime || 0}</div>
        <div class="subtitle">小时</div>
      </div>
    </div>

    <div class="section">
      <h2>🐛 严重 Bug 列表</h2>
      ${report.criticalBugs.length > 0 ? `
        <table>
          <thead>
            <tr>
              <th>Bug ID</th>
              <th>标题</th>
              <th>严重程度</th>
              <th>状态</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            ${report.criticalBugs.map(bug => `
              <tr>
                <td><strong>${bug.id}</strong></td>
                <td>${bug.title}</td>
                <td><span class="severity severity-${bug.severity}">${bug.severity}</span></td>
                <td><span class="status status-${bug.status}">${bug.status}</span></td>
                <td>${new Date(bug.createdAt).toLocaleString('zh-CN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #4CAF50; font-weight: 600;">✅ 没有严重 Bug！</p>'}
    </div>

    <div class="section">
      <h2>📈 Bug 状态分布</h2>
      <div class="chart">
        <div>Open: ${report.bugsByStatus.open}</div>
        <div class="bar" style="width: ${(report.bugsByStatus.open / report.summary.totalBugs * 100) || 0}%">
          <span class="bar-label">${report.bugsByStatus.open}</span>
        </div>
        
        <div>In Progress: ${report.bugsByStatus.inProgress}</div>
        <div class="bar" style="width: ${(report.bugsByStatus.inProgress / report.summary.totalBugs * 100) || 0}%">
          <span class="bar-label">${report.bugsByStatus.inProgress}</span>
        </div>
        
        <div>Resolved: ${report.bugsByStatus.resolved}</div>
        <div class="bar" style="width: ${(report.bugsByStatus.resolved / report.summary.totalBugs * 100) || 0}%">
          <span class="bar-label">${report.bugsByStatus.resolved}</span>
        </div>
        
        <div>Closed: ${report.bugsByStatus.closed}</div>
        <div class="bar" style="width: ${(report.bugsByStatus.closed / report.summary.totalBugs * 100) || 0}%">
          <span class="bar-label">${report.bugsByStatus.closed}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>📋 最近测试记录</h2>
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>类型</th>
            <th>总数</th>
            <th>通过</th>
            <th>失败</th>
            <th>耗时</th>
          </tr>
        </thead>
        <tbody>
          ${report.recentTests.map(test => `
            <tr>
              <td>${new Date(test.timestamp).toLocaleString('zh-CN')}</td>
              <td>${test.type}</td>
              <td>${test.total}</td>
              <td style="color: #4CAF50; font-weight: 600;">${test.passed}</td>
              <td style="color: ${test.failed > 0 ? '#f44336' : '#666'}; font-weight: 600;">${test.failed}</td>
              <td>${(test.duration / 1000).toFixed(2)}s</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
    `;
  }

  // 显示统计信息
  showStats() {
    console.log('\n📊 测试跟踪统计:\n');
    console.log(`总测试运行次数: ${this.metrics.totalTests}`);
    console.log(`通过的测试: ${this.metrics.passedTests}`);
    console.log(`失败的测试: ${this.metrics.failedTests}`);
    console.log(`最近通过率: ${this.metrics.recentPassRate || 0}%`);
    console.log(`\n🐛 Bug 统计:\n`);
    console.log(`Bug 总数: ${this.metrics.totalBugs}`);
    console.log(`未解决 Bug: ${this.metrics.openBugs}`);
    console.log(`已解决 Bug: ${this.metrics.closedBugs}`);
    console.log(`严重 Bug: ${this.metrics.criticalBugs}`);
    console.log(`平均修复时间: ${this.metrics.averageFixTime || 0} 小时\n`);
  }
}

// CLI 命令
if (require.main === module) {
  const tracker = new TestTracker();
  const command = process.argv[2];

  switch (command) {
    case 'record':
      // 记录测试结果示例
      tracker.recordTestRun({
        type: 'unit',
        total: 74,
        passed: 74,
        failed: 0,
        duration: 2500
      });
      break;

    case 'bug':
      // 创建 Bug 示例
      const action = process.argv[3];
      if (action === 'create') {
        tracker.createBug({
          title: process.argv[4] || '示例 Bug',
          description: process.argv[5] || 'Bug 描述',
          severity: process.argv[6] || 'medium'
        });
      } else if (action === 'update') {
        tracker.updateBugStatus(process.argv[4], process.argv[5], process.argv[6]);
      }
      break;

    case 'report':
      tracker.generateReport();
      break;

    case 'stats':
      tracker.showStats();
      break;

    default:
      console.log('📋 测试跟踪工具使用说明:\n');
      console.log('  node test-tracker.js record              - 记录测试结果');
      console.log('  node test-tracker.js bug create <title>  - 创建 Bug');
      console.log('  node test-tracker.js bug update <id> <status> - 更新 Bug');
      console.log('  node test-tracker.js report              - 生成报告');
      console.log('  node test-tracker.js stats               - 显示统计\n');
  }
}

module.exports = TestTracker;
