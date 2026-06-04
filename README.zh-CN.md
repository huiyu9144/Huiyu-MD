# <p align="center"><img src="src-tauri/icons/logo-rounded.png" width="100" alt="Huiyu MD Logo" /></p>

<p align="center">
  <h1 align="center">Huiyu MD</h1>
  <p align="center"><b>极致简洁、极速启动的 Markdown 阅读器，支持 Windows 与 macOS。</b></p>
  <p align="center"><sub>零臃肿 · 即时启动 · 深色/浅色主题 · Ctrl+滚轮缩放</sub></p>
</p>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/English-blue" alt="English" /></a>
  <a href="README.zh-CN.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-red" alt="中文" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/版本-1.4.0-blue" alt="版本" />
  <img src="https://img.shields.io/badge/平台-Windows%20%7C%20macOS-333" alt="平台" />
  <img src="https://img.shields.io/badge/许可证-MIT-green" alt="许可证" />
  <img src="https://img.shields.io/badge/技术栈-Tauri%202.0-orange?logo=tauri" alt="Tauri" />
</p>

<p align="center">
  <img src="docs/screenshots/welcome.jpg" width="70%" alt="Huiyu MD — 欢迎页" style="border-radius:12px; box-shadow: 0 8px 32px rgba(0,0,0,0.45);" />
</p>

<table align="center">
  <tr>
    <td align="center"><img src="docs/screenshots/dark-context.jpg" width="100%" alt="深色模式" style="border-radius:10px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);" /></td>
    <td align="center"><img src="docs/screenshots/light-context.jpg" width="100%" alt="浅色模式" style="border-radius:10px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>🌙 深色模式</b></sub></td>
    <td align="center"><sub><b>☀️ 浅色模式</b></sub></td>
  </tr>
</table>

---

## 🚀 为什么选择 Huiyu MD？

> **无杂乱、无卡顿，只专注你的 Markdown。**

| | Huiyu MD | 常见编辑器 |
|---|:---:|:---:|
| ⚡ 启动速度 | **< 0.3 秒** | 2–5 秒 |
| 📦 应用体积 | **~5 MB** | 80–200 MB |
| 🧠 内存占用 | **~30 MB** | 200–500 MB |
| 🎨 主题 | 深色 + 浅色 | 通常需付费 |
| 🔍 缩放 | ✅ Ctrl+滚轮 | 部分支持 |
| 📐 数学公式 | ✅ KaTeX | 少见 |
| 💻 代码高亮 | ✅ 100+ 语言 | 部分支持 |
| 🖱️ 拖拽打开 | ✅ | 少见 |
| 📁 文件关联 | ✅ 自动 | 需手动设置 |
| 🪟 Win + Mac | ✅ 双平台 | 少见 |

---

## ✨ 功能亮点

<table>
  <tr>
    <td width="50%">

### ⚡ 极速启动

- **零白屏闪烁** — 窗口内容就绪后才显示
- **懒加载** — 初始包仅 213 kB
- **单次 IPC 调用** — 一次读取文件路径和内容

    </td>
    <td width="50%">

### 🎨 精美渲染

- **KaTeX 数学公式** — 行内与块级公式
- **代码块** — 语法高亮 + 一键复制
- **表格、列表、引用块** — 完整 GFM 支持

    </td>
  </tr>
  <tr>
    <td>

### 🔧 智能编辑

- **CodeMirror 6** — 完整编辑器，支持撤销/重做
- **Markdown 语法高亮**
- **Ctrl+S** 保存，**Esc** 取消

    </td>
    <td>

### 🎯 贴心细节

- **Ctrl+滚轮缩放** — 25% 到 400%
- **右键菜单** — 复制、编辑、缩放、切换主题
- **拖拽打开** — 即时打开任意文件
- **单实例** — 不会重复打开窗口

    </td>
  </tr>
</table>

---

## 📥 下载

<div align="center">

### 👉 [下载最新版本](https://github.com/huiyu9144/Huiyu-MD/releases) 👈

</div>

| 平台 | 安装包 | 说明 |
|------|--------|------|
| 🪟 **Windows** | `Huiyu.MD_x64-setup.exe` | NSIS 安装程序 — 自动关联文件 |
| 🪟 **Windows** | `Huiyu.MD_x64_en-US.msi` | MSI 安装程序 — 企业部署 |
| 🍎 **macOS** | `Huiyu.MD_universal.dmg` | 通用版 — 支持 Intel + Apple Silicon |

---

## 🛠️ 安装

### 🪟 Windows

运行 `.exe` 安装程序 → 完成。自动执行：
- 注册 `.md` / `.txt` 为默认打开方式
- 在右键菜单中添加「使用 Huiyu MD 打开」

### 🍎 macOS

挂载 `.dmg` → 将 **Huiyu MD** 拖入 **Applications** 文件夹 → 完成。

> 需要 macOS 10.15 (Catalina) 或更高版本。

---

## 🧑‍💻 开发

### 环境要求

| 工具 | 版本 |
|------|------|
| [Node.js](https://nodejs.org/) | 20+ |
| [Rust](https://rustup.rs/) | 1.77+ |
| [Tauri 系统依赖](https://v2.tauri.app/start/prerequisites/) | — |

### 快速开始

```bash
git clone https://github.com/huiyu9144/Huiyu-MD.git
cd Huiyu-MD
npm install
npm run tauri dev
```

### 构建

```bash
npm run tauri build
```

---

## 📁 项目结构

```
Huiyu MD/
├── src/
│   ├── App.tsx              ← 主组件
│   ├── MarkdownRenderer.tsx ← Markdown 渲染（KaTeX + GFM）
│   ├── MarkdownEditor.tsx   ← CodeMirror 6 编辑器
│   ├── index.css            ← 主题变量
│   └── main.tsx             ← React 入口
└── src-tauri/
    ├── src/lib.rs           ← Tauri 命令
    ├── installer_hooks.nsh  ← Windows 文件关联
    ├── capabilities/        ← 权限配置
    └── tauri.conf.json      ← 应用配置
```

---

## ⚡ 性能优化

| 优化项 | 实现方式 |
|--------|----------|
| 零白屏闪烁 | `visible: false` → 渲染完成后 `show()` |
| 极小包体 | `React.lazy` + 代码分割 → 213 kB |
| 极速读取 | Rust `std::fs::read_to_string` |
| 单次 IPC | 路径 + 内容一次 `invoke` 返回 |

---

## 📄 许可证

[MIT](LICENSE)

---

<p align="center">
  <sub>用 ❤️ 构建，基于 <b>Tauri</b>、<b>React</b> 和 <b>Vite</b></sub>
</p>
