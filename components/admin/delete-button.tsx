"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeleteButton({
  onDelete,
  label = "Delete",
  confirmMessage = "Are you sure? This can't be undone.",
  className,
}: {
  onDelete: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(() => onDelete());
        }
      }}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-danger",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}
