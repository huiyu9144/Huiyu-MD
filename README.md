# Huiyu MD

A fast, beautiful Markdown & Text file viewer built with **Tauri 2.0** and **React**.

![macOS](https://img.shields.io/badge/platform-macOS-333?logo=apple) ![Windows](https://img.shields.io/badge/platform-Windows-0078D4?logo=windows) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Lightning fast startup** — lazy-loaded code splitting, hidden window until ready
- **Markdown rendering** with KaTeX math formula support
- **Code editing** via CodeMirror 6 (syntax highlighting, undo/redo)
- **Dark / Light theme** — automatically persists preference
- **File association** — open .md / .txt files by double-clicking
- **Context menu** — "Open with Huiyu MD" for any file
- **Drag & drop** — drop files directly into the window
- **Single instance** — reuses existing window; no duplicate processes
- **Cross-platform** — Windows (NSIS/MSI) and macOS (DMG)

## Download

| Platform | Installer |
|---|---|
| Windows | `Huiyu.MD_1.0.0_x64-setup.exe` (NSIS) |
| Windows | `Huiyu.MD_1.0.0_x64_en-US.msi` (MSI) |
| macOS (Intel) | `Huiyu.MD_1.0.0_x64.dmg` |
| macOS (Apple Silicon) | `Huiyu.MD_1.0.0_aarch64.dmg` |
| macOS (Universal) | `Huiyu.MD_1.0.0_universal.dmg` |

👉 **[Download the latest Release](https://github.com/huiyu9144/Huiyu-MD/releases)**

### Windows

Run the NSIS installer (recommended). It will:
- Install the app
- Register `.md` / `.txt` as default file handler
- Add "Open with Huiyu MD" to every file right-click menu

### macOS

Mount the `.dmg` and drag "Huiyu MD" to your **Applications** folder.

> **Note:** macOS requires **10.15 (Catalina)** or later.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://rustup.rs/) 1.77+
- [Tauri system dependencies](https://v2.tauri.app/start/prerequisites/)

### Get started

```bash
git clone https://github.com/huiyu9144/Huiyu-MD.git
cd Huiyu-MD
npm install
npm run tauri dev
```

### Build for production

```bash
npm run tauri build
```

On macOS, to create a **universal** binary (Intel + Apple Silicon):

```bash
npm run tauri build -- --target universal-apple-darwin --bundles dmg
```

## Architecture

```
src/
├── App.tsx              # Main app component + file-open orchestration
├── MarkdownRenderer.tsx  # Markdown to HTML (react-markdown + KaTeX)
├── MarkdownEditor.tsx    # CodeMirror 6 editor
├── index.css             # Global styles / theme variables
└── main.tsx              # React entry point

src-tauri/
├── src/lib.rs            # Tauri commands (read_file, read_startup_file)
├── installer_hooks.nsh   # NSIS hooks for Windows file association
├── capabilities/         # Permission scopes (fs, dialog, event, etc.)
└── tauri.conf.json       # App / bundle configuration
```

## Performance optimizations

| Technique | Benefit |
|---|---|
| `visible: false` to `show()` | No white flash; window appears only when content is ready |
| `React.lazy` + code splitting | 213 kB initial bundle (vs 1.27 MB) |
| Rust-side `std::fs::read_to_string` | Reads files directly, bypasses JS fs scope checks |
| Single IPC call for startup | Returns path + content in one `invoke` |
| Module caching | `invoke`, `getCurrentWindow` cached in module scope |

## License

MIT
