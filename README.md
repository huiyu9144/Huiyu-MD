# <p align="center"><img src="src-tauri/icons/logo-rounded.png" width="100" alt="Huiyu MD Logo" /></p>

<p align="center">
  <h1 align="center">Huiyu MD</h1>
  <p align="center"><b>A minimal, lightning-fast Markdown reader for Windows & macOS.</b></p>
  <p align="center"><sub>Zero bloat · Instant startup · Dark & Light themes · Ctrl+scroll zoom</sub></p>
</p>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/English-blue" alt="English" /></a>
  <a href="README.zh-CN.md"><img src="https://img.shields.io/badge/%E4%B8%AD%E6%96%87-red" alt="中文" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.4.0-blue" alt="Version" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-333" alt="Platform" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/built_with-Tauri%202.0-orange?logo=tauri" alt="Tauri" />
</p>

<p align="center">
  <img src="docs/screenshots/welcome.jpg" width="70%" alt="Huiyu MD — Welcome" style="border-radius:12px; box-shadow: 0 8px 32px rgba(0,0,0,0.45);" />
</p>

<table align="center">
  <tr>
    <td align="center"><img src="docs/screenshots/dark-context.jpg" width="100%" alt="Dark Mode" style="border-radius:10px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);" /></td>
    <td align="center"><img src="docs/screenshots/light-context.jpg" width="100%" alt="Light Mode" style="border-radius:10px; box-shadow: 0 4px 20px rgba(0,0,0,0.4);" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>🌙 Dark Mode</b></sub></td>
    <td align="center"><sub><b>☀️ Light Mode</b></sub></td>
  </tr>
</table>

---

## 🚀 Why Huiyu MD?

> **No clutter. No lag. Just your Markdown.**

| | Huiyu MD | Typical Editors |
|---|:---:|:---:|
| ⚡ Startup time | **< 0.3s** | 2–5s |
| 📦 App size | **~5 MB** | 80–200 MB |
| 🧠 RAM usage | **~30 MB** | 200–500 MB |
| 🎨 Theme | Dark + Light | Often paid |
| 🔍 Zoom | ✅ Ctrl+scroll | Varies |
| 📐 Math formulas | ✅ KaTeX | Rare |
| 💻 Code highlighting | ✅ 100+ langs | Varies |
| 🖱️ Drag & drop | ✅ | Rare |
| 📁 File association | ✅ Auto | Manual |
| 🪟 Win + Mac | ✅ Both | Rare |

---

## ✨ Features

<table>
  <tr>
    <td width="50%">

### ⚡ Blazing Fast

- **Zero white flash** — window hidden until content renders
- **Lazy-loaded** — only 213 kB initial bundle
- **Single IPC call** — reads file + path in one shot

    </td>
    <td width="50%">

### 🎨 Beautiful Rendering

- **KaTeX math** — inline and block formulas
- **Code blocks** — syntax highlighting + copy button
- **Tables, lists, blockquotes** — full GFM support

    </td>
  </tr>
  <tr>
    <td>

### 🔧 Smart Editing

- **CodeMirror 6** — full editor with undo/redo
- **Syntax highlighting** for Markdown
- **Ctrl+S** to save, **Esc** to cancel

    </td>
    <td>

### 🎯 Thoughtful Details

- **Ctrl+scroll zoom** — 25% to 400%
- **Right-click menu** — copy, edit, zoom, theme
- **Drag & drop** — open any file instantly
- **Single instance** — no duplicate windows

    </td>
  </tr>
</table>

---

## 📥 Download

<div align="center">

### 👉 [Download Latest Release](https://github.com/huiyu9144/Huiyu-MD/releases) 👈

</div>

| Platform | Installer | Notes |
|----------|-----------|-------|
| 🪟 **Windows** | `Huiyu.MD_x64-setup.exe` | ⭐ **NSIS installer (推荐)** — 自动文件关联 |
| 🪟 **Windows** | `Huiyu.MD_x64_en-US.msi` | MSI installer — 企业批量部署，无自动关联 |
| 🍎 **macOS** | `Huiyu.MD_universal.dmg` | Universal — Intel + Apple Silicon |

---

## 🛠️ Install

### 🪟 Windows

**推荐下载 `.exe` 版本**（`.msi` 不会自动关联文件）。运行安装程序后自动：
- Registers `.md` / `.txt` as default handler
- Adds "Open with Huiyu MD" to right-click menu

### 🍎 macOS

Mount the `.dmg` → drag **Huiyu MD** to **Applications** → done.

> Requires macOS 10.15 (Catalina) or later.

---

## 🧑‍💻 Development

### Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | 20+ |
| [Rust](https://rustup.rs/) | 1.77+ |
| [Tauri system deps](https://v2.tauri.app/start/prerequisites/) | — |

### Quick Start

```bash
git clone https://github.com/huiyu9144/Huiyu-MD.git
cd Huiyu-MD
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

---

## 📁 Project Structure

```
Huiyu MD/
├── src/
│   ├── App.tsx              ← Main component
│   ├── MarkdownRenderer.tsx ← Markdown rendering (KaTeX + GFM)
│   ├── MarkdownEditor.tsx   ← CodeMirror 6 editor
│   ├── index.css            ← Theme variables
│   └── main.tsx             ← React entry
└── src-tauri/
    ├── src/lib.rs           ← Tauri commands
    ├── installer_hooks.nsh  ← Windows file association
    ├── capabilities/        ← Permission scopes
    └── tauri.conf.json      ← App configuration
```

---

## ⚡ Performance

| What | How |
|------|-----|
| No white flash | `visible: false` → `show()` after render |
| Tiny bundle | `React.lazy` + code splitting → 213 kB |
| Fast file reads | Rust `std::fs::read_to_string` |
| Single IPC call | Path + content in one `invoke` |

---

## 📄 License

[MIT](LICENSE)

---

<p align="center">
  <sub>Built with ❤️ using <b>Tauri</b>, <b>React</b>, and <b>Vite</b></sub>
</p>