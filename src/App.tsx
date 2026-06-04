import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  lazy,
  Suspense,
} from "react";
import { Clipboard, ClipboardPaste, FolderOpen, Moon, Pencil, Save, Scissors, SquareDashedMousePointer, Sun, X } from "lucide-react";

const MarkdownRenderer = lazy(async () => ({ default: (await import("./MarkdownRenderer")).MarkdownRenderer }));
const MarkdownEditor = lazy(async () => ({ default: (await import("./MarkdownEditor")).MarkdownEditor }));

let isTauri = false;
let tauriDialog = null;
let tauriFs = null;
let tauriInvoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T> = null as any;
let tauriWindow: any = null;

async function ensureTauri() {
  if (!isTauri) {
    try {
      const d = await import("@tauri-apps/plugin-dialog");
      const f = await import("@tauri-apps/plugin-fs");
      const c = await import("@tauri-apps/api/core");
      tauriDialog = d;
      tauriFs = f;
      tauriInvoke = c.invoke;
      const w = await import("@tauri-apps/api/window");
      tauriWindow = w;
      isTauri = true;
    } catch (e) {}
  }
  return isTauri;
}

function getExt(p) {
  const dot = p.lastIndexOf(".");
  return dot >= 0 ? p.slice(dot).toLowerCase() : "";
}

const MD_EXTS = new Set([".md", ".mdx", ".markdown", ".mdown", ".txt"]);

interface CtxMenu {
  x: number;
  y: number;
  items: { label?: string; onClick?: () => void; icon?: React.ReactNode; danger?: boolean; disabled?: boolean; separator?: boolean }[];
}

export default function App() {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved === 'dark';
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [dragOver, setDragOver] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [mode, setMode] = useState("view");
  const [editContent, setEditContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [bottomH, setBottomH] = useState(30);
  const isDirtyRef = useRef(false);
  isDirtyRef.current = isDirty;
  const modeRef = useRef("view");
  modeRef.current = mode;
  const savingRef = useRef(false);
  savingRef.current = saving;
  const contentRef = useRef("");
  contentRef.current = content;
  const editContentRef = useRef("");
  editContentRef.current = editContent;

  useEffect(() => {
    const theme = isDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.setProperty("--bg", isDark ? "#171717" : "#F5F5F5");
    try { localStorage.setItem("theme", theme); } catch {}
  }, [isDark]);

  // Show window AFTER file is loaded and rendered (avoids blank flash)
  useEffect(() => {
    (async () => {
      if (!(await ensureTauri())) return;
      try {
        // Preload MarkdownRenderer in parallel with IPC call
        const [startup] = await Promise.all([
          tauriInvoke<{path:string;content:string}|null>("read_startup_file"),
          import("./MarkdownRenderer"),
        ]);

        if (startup) {
          setContent(startup.content);
          const parts = startup.path.replace(/\\/g, "/").split("/");
          setFileName(parts[parts.length - 1] ?? startup.path);
          setFilePath(startup.path);
          // Wait for React to render content
          await new Promise(r => requestAnimationFrame(r));
        }

        await tauriWindow.getCurrentWindow().show();
      } catch {}
    })();
  }, []);

  useLayoutEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    setBottomH(el.offsetHeight);
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => setBottomH(el.offsetHeight));
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [isDark]);

  const isMd = content ? MD_EXTS.has(getExt(filePath || fileName)) : false;

  const loadFile = useCallback(async (path) => {
    if (await ensureTauri()) {
      try {
      const text = await tauriInvoke("read_file", { path }) as string;
        setContent(text);
        const parts = String(path).replace(/\\/g, "/").split("/");
        setFileName(parts[parts.length - 1] ?? String(path));
        setFilePath(String(path));
        setMode("view");
        setIsDirty(false);
        setEditContent("");
      } catch (err) {
        console.error("read error:", err);
      }
    }
  }, []);

  const handleOpen = useCallback(async () => {
    if (await ensureTauri()) {
      const sel = await tauriDialog.open({
        multiple: false,
        filters: [
          { name: "Markdown / Text", extensions: ["md", "mdx", "markdown", "mdown", "txt"] },
          { name: "All files", extensions: ["*"] },
        ],
      });
      if (sel) {
        await loadFile(String(sel));
      }
    } else {
      inputRef.current?.click();
    }
  }, [loadFile]);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    file.text().then(setContent);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);
    file.text().then(setContent);
  }, []);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  const enterEdit = useCallback(() => {
    setEditContent(content);
    setIsDirty(false);
    setMode("edit");
  }, [content]);

  const cancelEdit = useCallback(() => {
    if (isDirty) {
      const ok = window.confirm("There are unsaved changes. Discard?");
      if (!ok) return;
    }
    setMode("view");
    setIsDirty(false);
    setEditContent("");
  }, [isDirty]);

  const saveEdit = useCallback(async () => {
    if (!isDirty || !filePath) return;
    if (!(await ensureTauri())) return;
    setSaving(true);
    try {
      await tauriFs.writeTextFile(filePath, editContent);
      setContent(editContent);
      setMode("view");
      setIsDirty(false);
      setEditContent("");
    } catch (err) {
      console.error("write error:", err);
      window.alert("Save failed: " + String(err));
    } finally {
      setSaving(false);
    }
  }, [isDirty, filePath, editContent]);

  const onEditorChange = useCallback(
    (v) => {
      setEditContent(v);
      setIsDirty(v !== content);
    },
    [content]
  );

  // ---- Close handler with re-entry guard ----
  const closeRequestedRef = useRef(false);
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      if (!(await ensureTauri())) return;
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const win = getCurrentWindow();
        unlisten = await win.onCloseRequested((event) => {
          // Re-entry guard: if we triggered this close ourselves, let it through
          if (closeRequestedRef.current) {
            closeRequestedRef.current = false;
            return; // do NOT preventDefault → window closes normally
          }
          // No unsaved changes → let close happen
          if (!isDirtyRef.current) {
            return; // do NOT preventDefault
          }
          // Has unsaved changes → block close and ask
          event.preventDefault();
          const ok = window.confirm("There are unsaved changes. Close anyway?");
          if (ok) {
            isDirtyRef.current = false;
            closeRequestedRef.current = true;
            win.close(); // re-triggers onCloseRequested, but guard will let it through
          }
        });
      } catch (e) {
        console.warn("onCloseRequested not available", e);
      }
    })();
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  // ---- Drag-drop ----
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    (async () => {
      if (!(await ensureTauri())) return;
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const win = getCurrentWindow();
        const unlisten = await win.onDragDropEvent((event) => {
          if (event.payload.type === "over") {
            setDragOver(true);
          } else if (event.payload.type === "leave") {
            setDragOver(false);
          } else if (event.payload.type === "drop") {
            setDragOver(false);
            const path = event.payload.paths?.[0];
            if (path) loadFile(path);
          }
        });
        cleanup = unlisten;
      } catch (e) {
        console.warn("Tauri drag-drop not available", e);
      }
    })();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // ---- Context menu (React onContextMenu on root) ----
  const clipboard = {
    cut: () => { try { document.execCommand("cut"); } catch (_) {} },
    copy: () => { try { document.execCommand("copy"); } catch (_) {} },
    paste: () => { try { document.execCommand("paste"); } catch (_) {} },
    selectAll: () => { try { document.execCommand("selectAll"); } catch (_) {} },
  };

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const hasSelection = !!window.getSelection()?.toString();
      type Item = { label?: string; onClick?: () => void; icon?: React.ReactNode; danger?: boolean; disabled?: boolean; separator?: boolean };

      if (modeRef.current === "edit") {
        const items: Item[] = [
          { label: "Cut", icon: <Scissors size={12} />, onClick: clipboard.cut, disabled: !hasSelection },
          { label: "Copy", icon: <Clipboard size={12} />, onClick: clipboard.copy, disabled: !hasSelection },
          { label: "Paste", icon: <ClipboardPaste size={12} />, onClick: clipboard.paste },
          { separator: true },
          { label: "Select All", icon: <SquareDashedMousePointer size={12} />, onClick: clipboard.selectAll },
          { separator: true },
          { label: "Save", icon: <Save size={12} />, onClick: saveEdit, disabled: !isDirtyRef.current || savingRef.current },
          { label: "Cancel", icon: <X size={12} />, onClick: cancelEdit, disabled: savingRef.current },
          { separator: true },
          { label: isDark ? "Switch to Light" : "Switch to Dark", icon: isDark ? <Sun size={12} /> : <Moon size={12} />, onClick: toggleTheme },
        ];
        setCtxMenu({ x: e.clientX, y: e.clientY, items });
      } else {
        const appItems: Item[] = contentRef.current ? [
          { label: "Edit", icon: <Pencil size={12} />, onClick: enterEdit, disabled: !MD_EXTS.has(getExt(filePath || fileName)) },
          { label: "Open file...", icon: <FolderOpen size={12} />, onClick: handleOpen },
        ] : [];
        const items: Item[] = [
          { label: "Copy", icon: <Clipboard size={12} />, onClick: clipboard.copy, disabled: !hasSelection },
          ...(contentRef.current ? [{ label: "Select All", icon: <SquareDashedMousePointer size={12} />, onClick: clipboard.selectAll }] : []),
          ...(appItems.length > 0 ? [{ separator: true as const }, ...appItems] : []),
          { separator: true },
          { label: isDark ? "Switch to Light" : "Switch to Dark", icon: isDark ? <Sun size={12} /> : <Moon size={12} />, onClick: toggleTheme },
        ];
        setCtxMenu({ x: e.clientX, y: e.clientY, items });
      }
    },
    [isDark, toggleTheme, saveEdit, cancelEdit, enterEdit, handleOpen, filePath, fileName]
  );

  // Close context menu on click outside
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [ctxMenu]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && mode === "edit") {
        e.preventDefault();
        saveEdit();
      } else if (e.key === "Escape" && mode === "edit") {
        e.preventDefault();
        cancelEdit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, saveEdit, cancelEdit]);

  // Listen for file-open events (second instance via single_instance)
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      if (!(await ensureTauri())) return;
      try {
        const { listen } = await import("@tauri-apps/api/event");
        unlisten = await listen<string>("file-opened", (event) => {
          loadFile(event.payload);
        });
      } catch {}
    })();
    return () => { if (unlisten) unlisten(); };
  }, [loadFile]);

  return (
    <div
      className="relative flex h-screen flex-col overflow-hidden"
      onContextMenu={onContextMenu}
      onDragOver={(e) => {
        if (mode === "edit") return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (mode === "edit") return;
        handleDrop(e);
      }}
    >
      {/* Content area */}
      <div
        className={`custom-scrollbar relative z-10 flex-1 overflow-auto p-3 transition-colors ${
          mode === "edit" ? "bg-[var(--color-code-bg)]" : "bg-[var(--color-header-bg)]"
        }`}
      >
        {mode === "view" && !content && (
          <div className="flex h-full flex-col items-center justify-center gap-2.5 text-neutral-500">
            <img
              src="/logo.png"
              alt="Huiyu MD"
              className="h-16 w-16 select-none rounded-lg"
              draggable={false}
            />
            <h1 className="text-2xl font-bold text-neutral-300">Huiyu MD</h1>
            <button
              type="button"
              onClick={handleOpen}
              className="mt-2 rounded bg-neutral-800 px-5 py-1.5 text-sm font-semibold text-neutral-300 hover:bg-neutral-700"
            >
              Open
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".md,.mdx,.markdown,.mdown,.txt"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}
        {mode === "view" && content && !isMd && (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-neutral-200">
            {content}
          </pre>
        )}
        <Suspense fallback={null}>
          {mode === "view" && content && isMd && (
            <MarkdownRenderer text={content} isDark={isDark} />
          )}
          {mode === "edit" && (
            <MarkdownEditor
              value={editContent}
              onChange={onEditorChange}
              isDark={isDark}
              onSave={saveEdit}
              onCancel={cancelEdit}
            />
          )}
        </Suspense>
      </div>

      {/* Drag-over hint */}
      {dragOver && mode === "view" && (
        <div className="pointer-events-none absolute inset-0 z-40 m-2 rounded border-2 border-dashed border-[var(--color-link)]/60" />
      )}

      {/* Bottom toolbar trigger */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{ height: bottomH || 30 }}
        onMouseEnter={() => setShowToolbar(true)}
      />

      <div
        ref={toolbarRef}
        className={`absolute bottom-0 left-0 right-0 z-30 flex items-center gap-1.5 bg-[var(--color-header-bg)] px-3 py-1.5 transition-opacity ${
          showToolbar ? "pointer-events-auto visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
        onMouseEnter={() => setShowToolbar(true)}
        onMouseLeave={() => setShowToolbar(false)}
      >
        <span
          className={`flex-1 truncate font-mono text-xs font-semibold ${
            isDirty ? "text-[var(--color-link)]" : "text-neutral-300"
          }`}
          title={isDirty ? "Unsaved" : ""}
        >
          {fileName || "Huiyu MD"}
          {isDirty ? " \u2022" : ""}
        </span>
        {mode === "view" && (
          <>
            <button
              type="button"
              onClick={handleOpen}
              className="rounded p-1 text-neutral-500 hover:bg-[var(--color-btn-hover-bg)] hover:text-[var(--color-btn-hover-text)]"
              title="Open file"
            >
              <FolderOpen size={12} />
            </button>
            {content && isMd && (
              <button
                type="button"
                onClick={enterEdit}
                className="rounded p-1 text-neutral-500 hover:bg-[var(--color-btn-hover-bg)] hover:text-[var(--color-btn-hover-text)]"
                title="Edit"
              >
                <Pencil size={12} />
              </button>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded p-1 text-neutral-500 hover:bg-[var(--color-btn-hover-bg)] hover:text-[var(--color-btn-hover-text)]"
              title={isDark ? "Light" : "Dark"}
            >
              {isDark ? <Sun size={12} /> : <Moon size={12} />}
            </button>
          </>
        )}
        {mode === "edit" && (
          <>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="rounded p-1 text-neutral-500 hover:bg-[var(--color-btn-hover-bg)] hover:text-[var(--color-btn-hover-text)] disabled:opacity-50"
              title="Cancel (Esc)"
            >
              <X size={12} />
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={!isDirty || saving}
              className={`rounded p-1 hover:bg-[var(--color-btn-hover-bg)] hover:text-[var(--color-btn-hover-text)] disabled:opacity-40 ${
                isDirty ? "text-[var(--color-link)]" : "text-neutral-500"
              }`}
              title="Save (Ctrl+S)"
            >
              <Save size={12} />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded p-1 text-neutral-500 hover:bg-[var(--color-btn-hover-bg)] hover:text-[var(--color-btn-hover-text)]"
              title={isDark ? "Light" : "Dark"}
            >
              {isDark ? <Sun size={12} /> : <Moon size={12} />}
            </button>
          </>
        )}
      </div>

      {/* Context menu dropdown */}
      {ctxMenu && (
        <div
          className="fixed z-50 min-w-[160px] rounded border border-[var(--color-code-border)] bg-[var(--color-header-bg)] py-1 shadow-lg"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={(e) => e.stopPropagation()}
        >
          {ctxMenu.items.map((item, i) => (
            item.separator ? (
              <div key={i} className="my-1 border-t border-[var(--color-code-border)]" />
            ) : (
              <button
                key={i}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setCtxMenu(null);
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-[var(--color-btn-hover-bg)] hover:text-[var(--color-btn-hover-text)] disabled:opacity-40 ${
                  item.danger ? "text-red-400" : "text-neutral-300"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}
