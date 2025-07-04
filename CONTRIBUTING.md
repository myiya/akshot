# 🤝 贡献指南 (Contributing Guide)

感谢您对 AkShot 项目的关注！我们欢迎所有形式的贡献。

## 📋 贡献方式 (Ways to Contribute)

- 🐛 报告 Bug
- 🚀 提出新功能建议
- 📝 改进文档
- 💻 提交代码
- 🌍 翻译
- 📢 推广项目

## 🚀 快速开始 (Quick Start)

### 环境要求
- Node.js 18+ 
- pnpm 8+
- Git

### 本地开发

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 Fork 项目到你的账户
   ```

2. **克隆代码**
   ```bash
   git clone https://github.com/your-username/akshot.git
   cd akshot
   ```

3. **安装依赖**
   ```bash
   pnpm install
   ```

4. **启动开发服务器**
   ```bash
   # Chrome 开发
   pnpm dev
   
   # Firefox 开发
   pnpm dev:firefox
   ```

5. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

## 📝 代码规范 (Code Standards)

### 命名规范
- **文件名**: 使用 PascalCase (如 `App.tsx`) 或 kebab-case (如 `utils.ts`)
- **组件名**: 使用 PascalCase (如 `ScreenshotButton`)
- **函数名**: 使用 camelCase (如 `handleScreenshot`)
- **常量**: 使用 UPPER_SNAKE_CASE (如 `MAX_HISTORY_COUNT`)

### 代码风格
- 使用 TypeScript
- 使用函数式组件和 Hooks
- 优先使用 `const` 和 `let`，避免 `var`
- 使用有意义的变量和函数名
- 添加必要的注释

### 提交规范
使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型 (Type)**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动

**示例**:
```bash
feat(popup): add page detection for screenshot button
fix(content): resolve screenshot capture issue on special pages
docs: update installation guide in README
```

## 🧪 测试 (Testing)

在提交 PR 之前，请确保：

1. **类型检查通过**
   ```bash
   pnpm compile
   ```

2. **构建成功**
   ```bash
   pnpm build
   pnpm build:firefox
   ```

3. **功能测试**
   - 在 Chrome 和 Firefox 中测试扩展功能
   - 测试截图功能
   - 测试历史记录功能
   - 测试在不同类型页面的行为

## 📋 Pull Request 流程

1. **确保你的分支是最新的**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **提交你的更改**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin your-branch
   ```

3. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待代码审查

4. **响应审查意见**
   - 根据反馈修改代码
   - 推送更新

## 🐛 报告 Bug

使用 [Bug Report 模板](https://github.com/your-username/akshot/issues/new?template=bug_report.md) 报告问题，请包含：

- 详细的问题描述
- 复现步骤
- 期望行为
- 实际行为
- 环境信息（操作系统、浏览器版本等）
- 截图或错误日志

## 🚀 功能建议

使用 [Feature Request 模板](https://github.com/your-username/akshot/issues/new?template=feature_request.md) 提出建议，请包含：

- 功能描述
- 使用场景
- 预期收益
- 可能的实现方案

## 📚 文档贡献

文档同样重要！你可以：

- 修复文档中的错误
- 改进现有文档的清晰度
- 添加缺失的文档
- 翻译文档到其他语言

## 🎯 项目结构 (Project Structure)

```
akshot/
├── entrypoints/          # 扩展入口点
│   ├── background/       # 后台脚本
│   ├── content/          # 内容脚本
│   ├── popup/            # 弹窗页面
│   └── option/           # 选项页面
├── messaging/            # 消息通信
├── utils/                # 工具函数
├── assets/               # 静态资源
└── public/               # 公共文件
```

## 🤔 需要帮助？

- 📖 查看 [README.md](./README.md)
- 💬 在 [Issues](https://github.com/your-username/akshot/issues) 中提问
- 📧 联系维护者

## 📄 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](./LICENSE) 下授权。

---

再次感谢您的贡献！🎉