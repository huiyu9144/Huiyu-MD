import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
} from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

const baseTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "var(--color-code-bg)",
      color: "var(--color-neutral-200)",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono)",
      fontSize: "13px",
      lineHeight: "1.6",
    },
    ".cm-gutters": {
      backgroundColor: "var(--color-code-bg)",
      color: "var(--color-neutral-500)",
      border: "none",
      borderRight: "1px solid var(--color-code-border)",
    },
    ".cm-activeLine": {
      backgroundColor: "transparent",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "var(--color-neutral-300)",
    },
    ".cm-content": {
      padding: "10px 0",
      caretColor: "var(--color-neutral-300)",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--color-neutral-300)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
      {
        backgroundColor: "var(--color-link)",
        opacity: "0.25",
      },
    ".cm-searchMatch": {
      backgroundColor: "var(--color-link)",
      color: "var(--color-neutral-50)",
      opacity: "0.4",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      opacity: "0.7",
    },
  },
  { dark: false }
);

export function MarkdownEditor({
  value,
  onChange,
  isDark,
  onSave,
  onCancel,
}: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onChangeRef.current = onChange;
    onSaveRef.current = onSave;
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        indentOnInput(),
        bracketMatching(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        markdown(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        baseTheme,
        isDark ? oneDark : [],
        EditorView.lineWrapping,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
          {
            key: "Mod-s",
            preventDefault: true,
            run: () => {
              onSaveRef.current?.();
              return true;
            },
          },
          {
            key: "Escape",
            preventDefault: true,
            run: () => {
              onCancelRef.current?.();
              return true;
            },
          },
        ]),
        EditorView.updateListener.of((v) => {
          if (v.docChanged) {
            onChangeRef.current(v.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [isDark]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return <div ref={containerRef} className="h-full overflow-hidden" />;
}
