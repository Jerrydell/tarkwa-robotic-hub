"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

export function ModerateDeleteButton({
  onDelete,
}: {
  onDelete: (reason: string) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        const reason = window.prompt("Reason for removing this content:");
        if (reason === null) return;
        startTransition(() => onDelete(reason));
      }}
      disabled={isPending}
      className="text-muted transition-colors hover:text-danger"
      aria-label="Remove"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
