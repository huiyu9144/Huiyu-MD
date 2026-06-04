import { Highlight, themes as prismThemes } from "prism-react-renderer";
import { useState, type HTMLAttributes, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = (): void => {
    if (code.length === 0) return;
    const flash = (): void => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    };
    const writeAsync = navigator.clipboard?.writeText?.bind(navigator.clipboard);
    if (writeAsync !== undefined) {
      void writeAsync(code).then(flash).catch(fallback);
      return;
    }
    fallback();
    function fallback(): void {
      try {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        flash();
      } catch {}
    }
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-1 top-1 inline-flex min-h-11 min-w-11 items-center justify-center rounded bg-neutral-800/80 p-1 text-neutral-400 transition-opacity hover:text-neutral-100 focus:opacity-100 md:min-h-0 md:min-w-0 md:opacity-0 md:group-hover:opacity-100"
      title="Copy code block"
      aria-label="Copy code block"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export function MarkdownRenderer({ text, isDark }: { text: string; isDark: boolean }) {
  const prismTheme = isDark ? prismThemes.vsDark : prismThemes.vsLight;
  const customTheme = {
    ...prismTheme,
    plain: {
      ...prismTheme.plain,
      color: isDark ? "#9ab3cb" : "#666666",
    },
  };

  const CodeRenderer = ({ className, children, ...rest }: HTMLAttributes<HTMLElement>): ReactNode => {
    const langMatch = /language-([\w-]+)/.exec(className ?? "");
    const code = String(children ?? "").replace(/\n$/, "");
    const isBlock = langMatch !== null || code.includes("\n");

    if (!isBlock) {
      return (
        <code
          className="rounded bg-neutral-800 px-1 py-0.5 font-mono text-[0.9em] text-neutral-100"
          {...rest}
        >
          {children}
        </code>
      );
    }
    const language = langMatch?.[1] ?? "text";

    return (
      <div className="group relative">
        <CodeCopyButton code={code} />
        <Highlight code={code} language={language} theme={customTheme}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className="overflow-x-auto rounded border border-[var(--color-code-border)] pt-[10px] pb-2 pr-2 pl-[10px] font-mono text-[12px]"
              style={{ ...style, background: "var(--color-code-bg)" }}
            >
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line });
                return (
                  <div key={i} {...lineProps}>
                    {line.map((token, key) => {
                      const tokenProps = getTokenProps({ token });
                      return <span key={key} {...tokenProps} />;
                    })}
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    );
  };

  const components: Components = {
    h1: ({ children }) => (
      <h1 className="mb-1 mt-3 text-base font-semibold first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-1 mt-3 text-sm font-semibold first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-1 mt-2 text-sm font-semibold first:mt-0">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-1 mt-2 text-xs font-semibold first:mt-0">{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className="mb-1 mt-2 text-xs font-semibold first:mt-0">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="mb-1 mt-2 text-xs font-semibold first:mt-0">{children}</h6>
    ),
    p: ({ children }) => (
      <p className="my-2 first:mt-0 last:mb-0">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="my-2 ml-5 list-disc space-y-1 first:mt-0">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-2 ml-5 list-decimal space-y-1 first:mt-0">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-snug">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="my-2 border-l-2 border-neutral-700 pl-3 text-neutral-400">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="my-2 overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-[var(--color-code-border)] bg-[var(--color-code-bg)] px-2 py-1 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-[var(--color-code-border)] px-2 py-1 align-top">{children}</td>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-link)] underline hover:text-[var(--color-link)]"
      >
        {children}
      </a>
    ),
    hr: () => null,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: CodeRenderer,
    pre: ({ children }) => <>{children}</>,
  };

  return (
    <div className="text-sm break-words [overflow-wrap:anywhere]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
