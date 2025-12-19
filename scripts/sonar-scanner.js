/**
 * SonarQube 代码分析脚本
 * 用于静态代码分析、代码质量检查、安全漏洞检测
 */

/* eslint-disable @typescript-eslint/no-var-requires */
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const scanner = require('sonarqube-scanner');
const projectBaseDir = path.resolve(process.cwd());

console.log('🔍 启动 SonarQube 代码分析...\n');

scanner(
  {
    serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
    token: process.env.SONAR_TOKEN || '',
    options: {
      'sonar.projectKey': 'campus-forum',
      'sonar.projectName': '校园论坛',
      'sonar.projectVersion': '1.0.0',
      'sonar.projectBaseDir': projectBaseDir,
      'sonar.sources': 'src',
      'sonar.tests': 'tests',
      'sonar.exclusions': '**/node_modules/**,**/dist/**,**/coverage/**',
      'sonar.test.inclusions': 'tests/**/*.test.ts,tests/**/*.spec.ts',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.testExecutionReportPaths': 'reports/test-results.xml',
      'sonar.sourceEncoding': 'UTF-8',
    },
  },
  () => {
    console.log('✅ SonarQube 分析完成！');
    console.log('📊 请访问 SonarQube 服务器查看详细报告\n');
  },
  error => {
    console.error('❌ SonarQube 分析失败:', error);
    console.log('\n💡 提示:');
    console.log('   1. 确保 SonarQube 服务器正在运行');
    console.log('   2. 设置环境变量 SONAR_HOST_URL 和 SONAR_TOKEN');
    console.log('   3. 或使用本地代码分析工具 (ESLint)\n');
    process.exit(1);
  }
);
