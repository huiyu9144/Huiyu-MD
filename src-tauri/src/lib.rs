use std::sync::{Mutex, OnceLock};
use serde::Serialize;
use tauri::Emitter;

static STARTUP_FILE: OnceLock<String> = OnceLock::new();
static SINGLE_INSTANCE_FILE: Mutex<Option<String>> = Mutex::new(None);

const FILE_EXTS: &[&str] = &[".md", ".mdx", ".markdown", ".mdown"];

fn is_file_arg(arg: &str) -> bool {
    let lower = arg.to_lowercase();
    FILE_EXTS.iter().any(|ext| lower.ends_with(ext))
}

#[derive(Serialize)]
pub struct StartupFile {
    pub path: String,
    pub content: String,
}

#[tauri::command]
fn get_startup_file() -> Option<String> {
    if let Ok(mut guard) = SINGLE_INSTANCE_FILE.lock() {
        if let Some(path) = guard.take() {
            return Some(path);
        }
    }
    STARTUP_FILE.get().cloned()
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_startup_file() -> Option<StartupFile> {
    let path = if let Ok(mut guard) = SINGLE_INSTANCE_FILE.lock() {
        if let Some(p) = guard.take() {
            Some(p)
        } else {
            STARTUP_FILE.get().cloned()
        }
    } else {
        STARTUP_FILE.get().cloned()
    };

    if let Some(p) = path {
        if let Ok(content) = std::fs::read_to_string(&p) {
            return Some(StartupFile { path: p, content });
        }
    }
    None
}

#[cfg(windows)]
fn register_file_assocs_once() {
    use winreg::enums::*;
    use winreg::RegKey;

    let marker = std::env::temp_dir().join("huiyu_md_assoc_registered");
    if marker.exists() {
        return;
    }

    let app_exe = match std::env::current_exe() {
        Ok(p) => p,
        Err(_) => return,
    };
    let cmd = format!("\"{}\" \"%1\"", app_exe.display());

    let hkcu = match RegKey::predef(HKEY_CURRENT_USER)
        .open_subkey_with_flags("Software\\Classes", KEY_WRITE)
    {
        Ok(k) => k,
        Err(_) => return,
    };

    if let Ok(progid) = hkcu.create_subkey("HuiyuMD.md") {
        let _ = progid.0.set_value("", &"Markdown File");
        if let Ok(cmd_key) = progid.0.create_subkey("shell\\open\\command") {
            let _ = cmd_key.0.set_value("", &cmd);
        }
    }

    for ext in &[".md", ".mdx", ".markdown", ".mdown"] {
        if let Ok(k) = hkcu.open_subkey_with_flags(ext, KEY_WRITE) {
            let _ = k.set_value("", &"HuiyuMD.md");
        }
        if let Ok(owp) = hkcu.create_subkey(&format!("{}\\OpenWithProgids", ext)) {
            let _ = owp.0.set_value("HuiyuMD.md", &"");
        }
    }

    let _ = std::fs::write(&marker, b"1");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
      for arg in &args {
        if is_file_arg(arg) {
          if let Ok(mut guard) = SINGLE_INSTANCE_FILE.lock() {
            *guard = Some(arg.clone());
          }
          let _ = app.emit("file-opened", arg.clone());
          break;
        }
      }
    }))
    .setup(|app| {
      #[cfg(windows)]
      std::thread::spawn(|| register_file_assocs_once());

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      let args: Vec<String> = std::env::args().collect();
      for arg in &args {
        if is_file_arg(arg) {
          let _ = STARTUP_FILE.set(arg.clone());
          break;
        }
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![get_startup_file, read_file, read_startup_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}