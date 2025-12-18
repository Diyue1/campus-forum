# 校园论坛 (Campus Forum)

一个基于 Vue 3 + TypeScript + Vite 构建的现代化校园论坛系统，采用 Naive UI 组件库，提供完整的社区功能。

## ✨ 特性

- 🎨 **现代化 UI** - 基于 Naive UI 的美观界面设计
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🔐 **用户系统** - 完整的注册、登录、个人资料管理
- 📝 **内容管理** - 帖子发布、编辑、删除、点赞、收藏
- 💬 **互动功能** - 评论、回复、私信、关注
- 🎯 **3D 校园场景** - 使用 Three.js 构建的沉浸式 3D 校园体验
- 👨‍💼 **管理后台** - 完整的管理员功能，包括用户管理、内容审核、数据统计
- 🔒 **安全特性** - XSS 防护、CSRF 防护、频率限制、密码加密
- 📊 **数据统计** - 用户活动、帖子热度、系统日志

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **类型系统**: TypeScript
- **UI 组件库**: Naive UI
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **3D 渲染**: Three.js + @tresjs/core
- **密码加密**: bcryptjs
- **XSS 防护**: DOMPurify
- **图标**: @vicons/ionicons5, @vicons/material

## 📦 安装

### 前置要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd "Software Engineering Practice"
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

## 🚀 构建部署

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建
```bash
npm run preview
```

## 📁 项目结构

```
Software Engineering Practice/
├── public/                 # 静态资源
├── src/
│   ├── components/        # Vue 组件
│   │   ├── 3D/           # 3D 场景组件
│   │   └── ...           # 其他组件
│   ├── views/            # 页面视图
│   │   ├── admin/        # 管理后台页面
│   │   └── ...          # 其他页面
│   ├── stores/           # Pinia 状态管理
│   ├── router/           # 路由配置
│   ├── utils/            # 工具函数
│   │   ├── database.ts   # 数据存储管理
│   │   ├── logger.ts     # 日志系统
│   │   ├── security.ts   # 安全工具
│   │   └── ...          # 其他工具
│   ├── styles/           # 样式文件
│   └── types/            # TypeScript 类型定义
├── index.html            # HTML 入口
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目配置
```

## 🔑 默认账户

⚠️ **安全警告**: 以下为开发环境默认测试账户，生产环境部署前必须修改密码！

- **管理员账户**
  - 用户名: `admin`
  - 密码: `admin123`

- **普通用户**
  - 用户名: `student001`
  - 密码: `123456`

## 🔒 安全注意事项

### 生产环境部署前必须：

1. **修改默认密码**
   - 修改所有默认账户的密码
   - 启用强密码策略
   - 实现首次登录强制修改密码

2. **禁用演示数据**
   - 在 `src/main.ts` 中禁用 `generateDemoData()`
   - 或设置环境变量控制

3. **启用安全功能**
   - 确保 XSS 防护已启用
   - 启用 CSRF 防护
   - 配置频率限制

4. **数据存储**
   - 当前使用 localStorage，仅适合演示
   - 生产环境应迁移到真实后端 API
   - 敏感数据不应存储在客户端

## 📝 开发规范

### 代码风格

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 最佳实践
- 使用 ESLint 和 Prettier 保持代码一致性

### 提交规范

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### 错误处理

- 统一使用 `Logger` 工具类记录错误
- 使用 `messageService` 显示用户提示
- 避免直接使用 `console.error`

## 🎯 主要功能

### 用户功能
- ✅ 用户注册/登录
- ✅ 个人资料管理
- ✅ 帖子发布/编辑/删除
- ✅ 点赞/收藏/分享
- ✅ 评论和回复
- ✅ 私信功能
- ✅ 关注/粉丝
- ✅ 签到系统
- ✅ 浏览历史

### 管理功能
- ✅ 用户管理（封禁/解封）
- ✅ 帖子审核
- ✅ 内容管理
- ✅ 举报处理
- ✅ 数据统计
- ✅ 系统设置

### 3D 功能
- ✅ 3D 校园场景
- ✅ 角色控制
- ✅ 交互区域
- ✅ 装饰元素

## 🐛 已知问题

- 数据存储在 localStorage，刷新页面会保留，但清除浏览器数据会丢失
- 图片上传为 Base64 编码，不适合生产环境
- 缺少真实的后端 API 支持

## 🔮 未来计划

- [ ] 集成真实后端 API
- [ ] 添加单元测试和 E2E 测试
- [ ] 实现图片上传到云存储
- [ ] 添加 PWA 支持
- [ ] 实现国际化 (i18n)
- [ ] 性能监控和错误追踪
- [ ] 移动端 App

## 📄 许可证

本项目仅供学习和演示使用。

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过 Issue 反馈。

---

**注意**: 这是一个演示项目，使用 localStorage 存储数据。生产环境需要集成真实的后端服务。

