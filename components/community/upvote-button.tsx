"use client";

import { useTransition } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  count: number;
  hasUpvoted: boolean;
  onToggle: () => Promise<void>;
  size?: "sm" | "md";
}

export function UpvoteButton({ count, hasUpvoted, onToggle, size = "md" }: UpvoteButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => onToggle());
      }}
      disabled={isPending}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg border px-2.5 py-1.5 transition-colors",
        hasUpvoted
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted hover:border-primary/40 hover:text-primary",
        size === "sm" && "px-2 py-1"
      )}
    >
      <ArrowUp className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span className="font-mono text-xs">{count}</span>
    </button>
  );
}
