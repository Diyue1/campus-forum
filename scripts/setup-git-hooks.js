/**
 * Git Hooks 设置脚本
 * 用于配置 Git 钩子，实现代码质量控制
 */

/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 设置 Git Hooks...\n');

// 检查是否在 Git 仓库中
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ 当前目录不是 Git 仓库！');
  process.exit(1);
}

// 安装 husky
console.log('📦 安装 husky...');
try {
  execSync('npm install --save-dev husky', { stdio: 'inherit' });
  console.log('✅ husky 安装成功\n');
} catch (error) {
  console.error('❌ husky 安装失败:', error.message);
  process.exit(1);
}

// 初始化 husky
console.log('🔧 初始化 husky...');
try {
  execSync('npx husky install', { stdio: 'inherit' });
  console.log('✅ husky 初始化成功\n');
} catch (error) {
  console.error('❌ husky 初始化失败:', error.message);
  process.exit(1);
}

// 添加 Git hooks
const hooks = [
  {
    name: 'pre-commit',
    description: '提交前检查',
    enabled: true
  },
  {
    name: 'commit-msg',
    description: '提交信息格式检查',
    enabled: true
  },
  {
    name: 'pre-push',
    description: '推送前检查',
    enabled: true
  }
];

console.log('📝 配置 Git Hooks:\n');
hooks.forEach(hook => {
  if (hook.enabled) {
    const hookPath = path.join(__dirname, '..', '.husky', hook.name);
    if (fs.existsSync(hookPath)) {
      console.log(`✅ ${hook.name} - ${hook.description}`);
    } else {
      console.log(`⚠️  ${hook.name} 文件不存在，请手动创建`);
    }
  }
});

console.log('\n✅ Git Hooks 设置完成！\n');
console.log('📋 已启用的钩子:');
console.log('  - pre-commit:  代码格式、质量检查、单元测试');
console.log('  - commit-msg:  提交信息格式验证');
console.log('  - pre-push:    完整测试、构建检查\n');
console.log('💡 提示: 如需跳过钩子，使用 git commit --no-verify\n');
