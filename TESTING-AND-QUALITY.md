# 校园论坛 - 测试与质量保证指南

## 📋 目录

1. [测试框架概览](#-测试框架概览)
2. [性能测试工具](#-性能测试工具)
   - [Lighthouse](#lighthouse)
   - [自定义性能测试](#自定义性能测试)
3. [代码分析工具](#-代码分析工具)
   - [ESLint 代码检查](#eslint-代码检查)
   - [SonarQube 分析](#sonarqube-分析)
4. [测试跟踪与故障管理](#-测试跟踪与故障管理)
   - [测试跟踪器](#测试跟踪器)
   - [Bug 管理](#bug-管理)
5. [版本控制与配置管理](#-版本控制与配置管理)
   - [Git Hooks](#git-hooks)
   - [回归测试](#回归测试)
6. [持续集成与部署](#-持续集成与部署)
7. [最佳实践](#-最佳实践)

## 🚀 测试框架概览

本项目采用分层测试策略，包括：

- **单元测试**：使用 Vitest 测试独立函数和组件
- **集成测试**：测试组件间的交互
- **端到端测试**：使用 Playwright 测试完整用户流程
- **性能测试**：使用 Lighthouse 和自定义测试脚本
- **代码质量检查**：使用 ESLint 和 SonarQube

## ⚡ 性能测试工具

### Lighthouse

Lighthouse 是一个开源的自动化工具，用于改进网页应用的质量。

**使用方法：**

```bash
# 运行 Lighthouse 测试
npm run test:lighthouse
```

**测试报告位置：** `reports/lighthouse/`

**关键指标：**
- 性能 (Performance)
- 可访问性 (Accessibility)
- 最佳实践 (Best Practices)
- SEO

### 自定义性能测试

我们提供了自定义性能测试脚本，用于测量关键性能指标。

**使用方法：**

```bash
# 运行性能测试
npm run test:performance

# 指定测试 URL
npm run test:performance -- http://localhost:3000
```

**测试指标：**
- 页面加载时间
- 首次内容绘制 (FCP)
- DOM 内容加载时间
- 资源数量和大小
- 内存使用情况

**报告位置：** `reports/performance/`

## 🔍 代码分析工具

### ESLint 代码检查

```bash
# 运行代码检查
npm run lint

# 运行安全检查
npm run lint:security
```

### SonarQube 分析

SonarQube 是一个开源的代码质量管理平台。

**使用方法：**

1. 启动 SonarQube 服务器
2. 运行分析：

```bash
npm run analyze
```

## 🐛 测试跟踪与故障管理

### 测试跟踪器

我们实现了一个简单的测试跟踪系统，用于记录测试结果和跟踪 Bug。

**使用方法：**

```bash
# 记录测试结果
node scripts/test-tracker.js record

# 创建 Bug
node scripts/test-tracker.js bug create "Bug 标题" "Bug 描述" high

# 更新 Bug 状态
node scripts/test-tracker.js bug update BUG-12345 resolved "已修复"

# 生成报告
node scripts/test-tracker.js report

# 显示统计信息
node scripts/test-tracker.js stats
```

### Bug 管理

- **严重程度**：critical, high, medium, low
- **状态**：open, in-progress, resolved, closed

## 🔄 版本控制与配置管理

### Git Hooks

我们使用 husky 配置了 Git 钩子，确保代码质量。

**可用钩子：**

- **pre-commit**：运行代码格式化和单元测试
- **commit-msg**：验证提交信息格式
- **pre-push**：运行完整测试和构建检查

**设置 Git Hooks：**

```bash
node scripts/setup-git-hooks.js
```

### 回归测试

```bash
# 运行回归测试
npm run test:regression
```

## 🚀 持续集成与部署

我们使用 GitHub Actions 实现了持续集成和持续部署。

**工作流文件：** `.github/workflows/ci.yml`

**工作流步骤：**

1. **代码检查**：运行 ESLint 和 Prettier
2. **单元测试**：运行 Vitest 测试
3. **E2E 测试**：运行 Playwright 测试
4. **构建**：构建生产版本
5. **部署**：部署到生产环境

## 🏆 最佳实践

### 测试最佳实践

1. **单元测试**：
   - 测试独立的功能单元
   - 使用模拟隔离外部依赖
   - 覆盖边界条件

2. **集成测试**：
   - 测试组件间的交互
   - 验证数据流
   - 测试错误处理

3. **E2E 测试**：
   - 测试关键用户流程
   - 验证端到端功能
   - 测试跨浏览器兼容性

### 代码质量最佳实践

1. **代码审查**：
   - 所有代码必须经过审查
   - 使用 Pull Request 工作流
   - 至少需要一个审查者批准

2. **代码风格**：
   - 遵循项目代码风格指南
   - 使用 ESLint 和 Prettier
   - 保持一致的命名约定

3. **文档**：
   - 为公共 API 添加文档
   - 更新 README 文件
   - 记录重要的设计决策

## 📊 测试覆盖率

我们使用 Vitest 的覆盖率报告来跟踪测试覆盖率。

**查看覆盖率报告：**

```bash
npm run test:coverage
```

**覆盖率报告位置：** `coverage/`

## 📝 提交信息规范

提交信息格式：`<type>: <subject>`

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例:**
```
feat: 添加用户登录功能
fix: 修复登录按钮点击无响应的问题
docs: 更新 README 文档
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题，请通过 Issue 提交问题。
