interface ContentBlock {
  type: "text" | "code" | "image" | "list";
  content?: string;
  language?: string;
  items?: string[];
  url?: string;
  caption?: string;
}

export function LessonContentRenderer({ blocks }: { blocks: unknown }) {
  const parsedBlocks = Array.isArray(blocks) ? (blocks as ContentBlock[]) : [];

  if (parsedBlocks.length === 0) {
    return (
      <p className="text-sm text-muted">
        This lesson&apos;s content is being written — check back soon.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {parsedBlocks.map((block, i) => {
        switch (block.type) {
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-xl border border-border bg-surface-elevated p-4 font-mono text-sm"
              >
                <code>{block.content}</code>
              </pre>
            );
          case "list":
            return (
              <ul key={i} className="flex flex-col gap-2 pl-1">
                {(block.items ?? []).map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "image":
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={block.url}
                alt={block.caption ?? ""}
                className="rounded-xl border border-border"
              />
            );
          case "text":
          default:
            return (
              <p key={i} className="leading-relaxed text-foreground/90">
                {block.content}
              </p>
            );
        }
      })}
    </div>
  );
}
