# 🔧 GitHub 和 SonarCloud 快速配置指南

## 第一步：GitHub 仓库设置

### 1. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `campus-forum`（或你喜欢的名字）
   - **Description**: `校园论坛系统 - 软件工程实践项目`
   - **Visibility**: Public（推荐，SonarCloud 免费版需要公开仓库）
   - **不要勾选** "Initialize this repository with a README"
3. 点击 "Create repository"

### 2. 连接本地仓库到 GitHub

打开 PowerShell 或命令提示符，在项目目录执行：

```bash
# 检查当前 Git 状态
git status

# 如果还没有初始化 Git，运行：
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始化项目，包含完整的测试与质量保证体系"

# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/你的用户名/campus-forum.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 3. 验证推送成功

1. 刷新 GitHub 仓库页面
2. 应该能看到所有文件
3. 点击 "Actions" 标签，查看 CI/CD 是否自动运行

### 4. 测试 CI 触发

```bash
# 修改一个文件
echo "# 测试 CI 触发" >> README.md

# 提交并推送
git add README.md
git commit -m "docs: 测试 CI 自动触发"
git push

# 访问 GitHub Actions 查看运行结果
```

---

## 第二步：SonarCloud 配置

### 1. 注册 SonarCloud

1. 访问 https://sonarcloud.io/
2. 点击 "Log in"
3. 选择 "Log in with GitHub"
4. 授权 SonarCloud 访问你的 GitHub 账号

### 2. 导入项目

1. 登录后，点击右上角 "+" → "Analyze new project"
2. 选择你的 GitHub 组织
3. 找到 `campus-forum` 仓库，点击 "Set Up"
4. 选择分析方法：
   - 推荐选择 "With GitHub Actions"（自动化）
   - 或选择 "Manually"（手动运行）

### 3. 获取配置信息

#### 如果选择 "Manually"：

1. 在项目设置页面，找到：
   - **Organization Key**: 你的组织标识
   - **Project Key**: 自动生成的项目标识
2. 点击 "Generate Token"，生成访问令牌
3. **保存这些信息**，后面会用到

#### 如果选择 "With GitHub Actions"：

SonarCloud 会自动生成配置，但你仍需要：
1. 获取 Token
2. 添加到 GitHub Secrets

### 4. 配置项目文件

更新 `sonar-project.properties` 文件：

```properties
# 必填项
sonar.projectKey=你的组织名_campus-forum
sonar.organization=你的组织名

# SonarCloud 地址
sonar.host.url=https://sonarcloud.io

# 项目信息
sonar.projectName=校园论坛
sonar.projectVersion=1.0.0

# 源码和测试目录
sonar.sources=src
sonar.tests=tests

# 排除文件
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/android/**

# 测试文件
sonar.test.inclusions=tests/**/*.test.ts,tests/**/*.spec.ts

# 覆盖率报告
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# 编码
sonar.sourceEncoding=UTF-8
```

### 5. 设置环境变量

#### Windows PowerShell：

```powershell
# 设置环境变量（临时，仅当前会话）
$env:SONAR_HOST_URL="https://sonarcloud.io"
$env:SONAR_TOKEN="你的token"
$env:SONAR_ORGANIZATION="你的组织名"

# 验证设置
echo $env:SONAR_HOST_URL
echo $env:SONAR_TOKEN
echo $env:SONAR_ORGANIZATION
```

#### 永久设置（推荐）：

1. 在项目根目录创建 `.env` 文件：
```env
SONAR_HOST_URL=https://sonarcloud.io
SONAR_TOKEN=你的token
SONAR_ORGANIZATION=你的组织名
```

2. 确保 `.env` 在 `.gitignore` 中（已经包含）

### 6. 运行分析

```bash
# 首先生成测试覆盖率
npm run test:coverage

# 运行 SonarQube 分析
npm run analyze:sonar
```

### 7. 查看结果

1. 访问 https://sonarcloud.io/
2. 找到你的项目
3. 查看代码质量仪表盘：
   - 代码异味（Code Smells）
   - 技术债务（Technical Debt）
   - 安全漏洞（Vulnerabilities）
   - 代码覆盖率（Coverage）
   - 代码重复率（Duplications）

---

## 第三步：集成到 GitHub Actions（可选但推荐）

### 1. 添加 SonarCloud Secrets 到 GitHub

1. 访问你的 GitHub 仓库
2. 点击 "Settings" → "Secrets and variables" → "Actions"
3. 点击 "New repository secret"
4. 添加以下 secrets：
   - Name: `SONAR_TOKEN`
   - Value: 你的 SonarCloud token

### 2. 更新 CI 配置

在 `.github/workflows/ci.yml` 中添加 SonarCloud 步骤：

```yaml
  sonarcloud:
    name: SonarCloud Analysis
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 完整历史记录，用于更好的分析
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### 3. 推送更新

```bash
git add .github/workflows/ci.yml
git commit -m "ci: 添加 SonarCloud 自动分析"
git push
```

现在每次推送代码，都会自动运行 SonarCloud 分析！

---

## 常见问题

### Q1: 推送到 GitHub 时要求输入用户名密码

**解决方案 1：使用 Personal Access Token**

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制 token
5. 推送时，用户名输入你的 GitHub 用户名，密码输入 token

**解决方案 2：使用 SSH（推荐）**

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加到 ssh-agent
ssh-add ~/.ssh/id_ed25519

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 访问 https://github.com/settings/keys
# 点击 "New SSH key"，粘贴公钥

# 更改远程仓库 URL
git remote set-url origin git@github.com:你的用户名/campus-forum.git
```

### Q2: SonarCloud 分析失败

**检查清单**：
- [ ] Token 是否正确
- [ ] Organization 和 Project Key 是否匹配
- [ ] 是否已运行 `npm run test:coverage` 生成覆盖率报告
- [ ] `sonar-project.properties` 配置是否正确

**查看详细日志**：
```bash
npm run analyze:sonar
```

### Q3: GitHub Actions 失败

1. 访问 Actions 页面
2. 点击失败的工作流
3. 查看详细日志
4. 常见原因：
   - 依赖安装失败
   - 测试失败
   - 配置文件错误

### Q4: 如何跳过 Git Hooks

```bash
# 跳过 pre-commit 和 commit-msg
git commit --no-verify -m "message"

# 跳过 pre-push
git push --no-verify
```

**注意**：不推荐经常跳过，这会降低代码质量

---

## 验证清单

完成配置后，验证以下内容：

- [ ] GitHub 仓库已创建并推送代码
- [ ] GitHub Actions 可以自动运行
- [ ] SonarCloud 项目已创建
- [ ] SonarCloud Token 已获取
- [ ] 环境变量已设置
- [ ] `sonar-project.properties` 已更新
- [ ] 可以成功运行 `npm run analyze:sonar`
- [ ] SonarCloud 仪表盘可以查看分析结果

---

## 快速命令参考

```bash
# GitHub 相关
git status                          # 查看状态
git add .                           # 添加所有更改
git commit -m "message"             # 提交
git push                            # 推送
git pull                            # 拉取

# SonarCloud 相关
npm run test:coverage               # 生成覆盖率
npm run analyze:sonar               # 运行分析
echo $env:SONAR_TOKEN               # 查看 token（Windows）

# 测试相关
npm test                            # 单元测试
npm run test:e2e                    # E2E 测试
npm run lint                        # 代码检查
```

---

## 下一步

配置完成后，你可以：

1. ✅ 推送代码自动触发 CI
2. ✅ 查看 GitHub Actions 运行记录
3. ✅ 运行 SonarCloud 代码分析
4. ✅ 在 SonarCloud 仪表盘查看代码质量

准备好演示了！🎉
