<div align="center">
  <img src="public/icon/128.png" alt="AkShot Logo" width="128" height="128">
  <h1>🚀 AkShot</h1>
  <p><strong>智能网页截图工具 - 让截图更简单</strong></p>
  
  [![Version](https://img.shields.io/badge/version-0.0.6-blue.svg)](https://github.com/myiya/akshot)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
  [![WXT](https://img.shields.io/badge/WXT-0.20.6-orange.svg)](https://wxt.dev/)
</div>

---

## ✨ 功能特性

### 🎯 核心功能
- **🖱️ 拖拽截图**：在网页上自由拖拽选择截图区域
- **📚 历史管理**：自动保存截图历史，支持按网站分类浏览
- **🔍 智能检测**：自动识别页面是否支持截图功能
- **💾 本地存储**：使用 IndexedDB 本地存储，保护隐私
- **📱 响应式UI**：现代化界面设计，支持多种屏幕尺寸

### 🛡️ 安全特性
- **🔒 隐私保护**：所有数据本地存储，不上传云端
- **🚫 智能限制**：自动禁用不支持截图的页面（如 chrome:// 页面）
- **⚡ 轻量级**：最小权限设计，仅请求必要的浏览器权限

---

## 🛠️ 技术栈

### 前端框架
- **React 19.1.0** - 现代化 UI 框架
- **TypeScript 5.8.3** - 类型安全的 JavaScript
- **Tailwind CSS 4.0.9** - 原子化 CSS 框架

### 扩展开发
- **WXT 0.20.6** - 现代化浏览器扩展开发框架
- **@webext-core/messaging** - 扩展消息传递系统
- **js-web-screen-shot** - 网页截图核心库

### 数据存储
- **IndexedDB (idb)** - 浏览器本地数据库
- **JSZip** - 批量导出功能支持

---

## 🚀 快速开始

### 📋 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0 (推荐) 或 npm >= 8.0.0
- Chrome/Edge/Firefox 浏览器

### 🔧 安装依赖

```bash
# 克隆项目
git clone https://github.com/myiya/akshot.git
cd akshot

# 安装依赖
pnpm install
# 或者使用 npm
npm install
```

### 🏃‍♂️ 开发模式

```bash
# Chrome 开发模式
pnpm dev

# Firefox 开发模式
pnpm dev:firefox
```

### 📦 构建生产版本

```bash
# 构建 Chrome 版本
pnpm build

# 构建 Firefox 版本
pnpm build:firefox

# 打包为 zip 文件
pnpm zip
```

---

## 📖 使用指南

### 🎮 基本操作

1. **安装扩展**
   - 在浏览器中加载开发版本或安装发布版本
   - 确保扩展已启用

2. **开始截图**
   - 点击浏览器工具栏中的 AkShot 图标
   - 点击「开始截图」按钮
   - 在网页上拖拽选择要截取的区域
   - 截图自动保存到本地

3. **查看历史**
   - 点击「查看截图历史」打开侧边栏
   - 按网站分类浏览所有截图
   - 支持下载、删除等操作

### 🔧 高级功能

- **批量导出**：在选项页面可以批量导出截图
- **网站分类**：截图自动按访问的网站进行分类
- **快捷操作**：支持键盘快捷键和右键菜单

---

## 📁 项目结构

```
akshot/
├── 📁 entrypoints/          # 扩展入口点
│   ├── 📁 background/       # 后台脚本
│   ├── 📁 content/          # 内容脚本
│   ├── 📁 popup/            # 弹窗页面
│   └── 📁 option/           # 选项页面
├── 📁 messaging/            # 消息传递系统
├── 📁 utils/                # 工具函数
│   ├── 📄 db.ts            # 数据库操作
│   └── 📄 index.ts         # 通用工具
├── 📁 assets/               # 静态资源
├── 📁 public/               # 公共文件
│   └── 📁 icon/            # 扩展图标
├── 📄 wxt.config.ts        # WXT 配置
├── 📄 package.json         # 项目配置
└── 📄 README.md            # 项目文档
```

---

## 🚀 发布 (Releases)

项目使用 GitHub Actions 自动构建和发布：

### 📦 自动构建
- **CI 检查**: 每次推送和 PR 都会触发自动构建和类型检查
- **多版本测试**: 支持 Node.js 18 和 20 版本测试
- **跨浏览器构建**: 自动构建 Chrome 和 Firefox 版本

### 🏷️ 发布流程

#### 🤖 自动发布（推荐）
```bash
# 自动递增补丁版本并发布
pnpm release

# Windows 用户
pnpm release:win

# 手动指定版本号
pnpm release 1.2.0
```

#### 📋 手动发布
1. 更新 `package.json` 中的版本号
2. 创建 Git 标签: `git tag v1.0.0`
3. 推送标签: `git push origin v1.0.0`
4. GitHub Actions 自动构建并创建 Release

#### ✨ 发布脚本功能
- 🔍 **自动版本检测**: 从 `package.json` 读取当前版本
- 📈 **智能递增**: 自动递增补丁版本号
- ✅ **完整检查**: 分支检查、代码检查、构建测试
- 🏷️ **自动标签**: 创建 Git 标签并推送到远程
- 🚀 **一键发布**: 完整的发布流程自动化

### 📥 安装包下载
从 [GitHub Releases](https://github.com/myiya/akshot/releases) 页面下载对应的安装包：
- **Chrome/Edge**: `akshot-{version}-chrome.zip`
- **Firefox**: `akshot-{version}-firefox.zip`

## 🤝 贡献 (Contributing)

我们欢迎所有形式的贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

### 快速开始
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发工作流
- 🐛 [报告 Bug](https://github.com/myiya/akshot/issues/new?template=bug_report.md)
- 🚀 [功能建议](https://github.com/myiya/akshot/issues/new?template=feature_request.md)
- 📖 查看 [贡献指南](./CONTRIBUTING.md)

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

- [WXT](https://wxt.dev/) - 现代化浏览器扩展开发框架
- [js-web-screen-shot](https://github.com/likaia/js-web-screen-shot) - 强大的网页截图库
- [React](https://reactjs.org/) - 用户界面构建库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

<div align="center">
  <p>如果这个项目对你有帮助，请给它一个 ⭐️</p>
  <p>Made with ❤️ by AkShot Team</p>
</div>
