"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type BlockType = "text" | "code" | "list" | "image";

interface Block {
  type: BlockType;
  content?: string;
  language?: string;
  itemsText?: string; // one item per line, joined into `items` on submit
  url?: string;
  caption?: string;
}

interface StoredBlock {
  type: BlockType;
  content?: string;
  language?: string;
  items?: string[];
  url?: string;
  caption?: string;
}

// AI drafts and persisted JSON aren't statically typed — this is the
// loose shape we accept in, validated/normalized before it becomes
// internal Block state.
interface IncomingBlock {
  type: string;
  content?: string;
  language?: string;
  items?: string[];
  url?: string;
  caption?: string;
}

const VALID_BLOCK_TYPES: BlockType[] = ["text", "code", "list", "image"];

function fromStored(blocks: IncomingBlock[]): Block[] {
  return blocks.map((b) => ({
    ...b,
    type: VALID_BLOCK_TYPES.includes(b.type as BlockType) ? (b.type as BlockType) : "text",
    itemsText: b.items?.join("\n") ?? "",
  }));
}

function toStored(blocks: Block[]): StoredBlock[] {
  return blocks.map((b) => {
    if (b.type === "list") {
      return {
        type: "list",
        items: (b.itemsText ?? "").split("\n").map((i) => i.trim()).filter(Boolean),
      };
    }
    if (b.type === "image") {
      return { type: "image", url: b.url, caption: b.caption };
    }
    if (b.type === "code") {
      return { type: "code", content: b.content, language: b.language };
    }
    return { type: "text", content: b.content };
  });
}

const fieldClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

export function LessonContentEditor({
  initialBlocks,
  fieldName = "contentBody",
}: {
  initialBlocks?: IncomingBlock[];
  fieldName?: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks && initialBlocks.length > 0
      ? fromStored(initialBlocks)
      : [{ type: "text", content: "" }]
  );

  function updateBlock(index: number, patch: Partial<Block>) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  function addBlock(type: BlockType) {
    setBlocks((prev) => [...prev, { type }]);
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name={fieldName} value={JSON.stringify(toStored(blocks))} />

      {blocks.map((block, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between gap-2">
            <select
              value={block.type}
              onChange={(e) => updateBlock(i, { type: e.target.value as BlockType })}
              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="text">Text</option>
              <option value="code">Code</option>
              <option value="list">List</option>
              <option value="image">Image</option>
            </select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveBlock(i, -1)}
                className="text-muted hover:text-foreground"
                aria-label="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveBlock(i, 1)}
                className="text-muted hover:text-foreground"
                aria-label="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(i)}
                className="ml-1 text-muted hover:text-danger"
                aria-label="Remove block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3">
            {block.type === "text" && (
              <textarea
                value={block.content ?? ""}
                onChange={(e) => updateBlock(i, { content: e.target.value })}
                rows={3}
                placeholder="Paragraph text..."
                className={fieldClass}
              />
            )}
            {block.type === "code" && (
              <div className="flex flex-col gap-2">
                <input
                  value={block.language ?? ""}
                  onChange={(e) => updateBlock(i, { language: e.target.value })}
                  placeholder="Language (e.g. cpp, python)"
                  className={fieldClass}
                />
                <textarea
                  value={block.content ?? ""}
                  onChange={(e) => updateBlock(i, { content: e.target.value })}
                  rows={5}
                  placeholder="Code snippet..."
                  className={`${fieldClass} font-mono`}
                />
              </div>
            )}
            {block.type === "list" && (
              <textarea
                value={block.itemsText ?? ""}
                onChange={(e) => updateBlock(i, { itemsText: e.target.value })}
                rows={4}
                placeholder={"One item per line"}
                className={fieldClass}
              />
            )}
            {block.type === "image" && (
              <div className="flex flex-col gap-2">
                <input
                  value={block.url ?? ""}
                  onChange={(e) => updateBlock(i, { url: e.target.value })}
                  placeholder="Image URL"
                  className={fieldClass}
                />
                <input
                  value={block.caption ?? ""}
                  onChange={(e) => updateBlock(i, { caption: e.target.value })}
                  placeholder="Caption (optional)"
                  className={fieldClass}
                />
              </div>
            )}
          </div>
        </Card>
      ))}

      <div className="flex flex-wrap gap-2">
        {(["text", "code", "list", "image"] as BlockType[]).map((type) => (
          <Button key={type} type="button" variant="outline" size="sm" onClick={() => addBlock(type)}>
            <Plus className="h-3.5 w-3.5" />
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
}
