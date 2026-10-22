"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CITATION = /\[(E\d+)\](?!\()/g;

/** The agent's Markdown answer. Each [E3] becomes a chip that jumps to that evidence. */
export function Answer({ markdown, onCite }: { markdown: string; onCite: (evidenceId: string) => void }) {
  const linked = markdown.replace(CITATION, (_, id: string) => `[${id}](#evidence-${id})`);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mb-2 prose-p:my-2 prose-ul:my-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) =>
            href?.startsWith("#evidence-") ? (
              <button
                type="button"
                onClick={() => onCite(href.slice("#evidence-".length))}
                className="mx-0.5 rounded bg-accent px-1 py-px align-baseline text-[0.8em] font-semibold text-accent-foreground no-underline hover:opacity-80"
              >
                {children}
              </button>
            ) : (
              <a href={href} target="_blank" rel="noreferrer">{children}</a>
            ),
        }}
      >
        {linked}
      </ReactMarkdown>
    </div>
  );
}
