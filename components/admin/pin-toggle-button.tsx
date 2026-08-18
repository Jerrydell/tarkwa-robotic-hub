"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { togglePinPost } from "@/features/admin/community/actions";

export function PinToggleButton({ postId, isPinned }: { postId: string; isPinned: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button onClick={() => startTransition(() => togglePinPost(postId, isPinned))} disabled={isPending}>
      <Badge tone={isPinned ? "identity" : "muted"} className="cursor-pointer">
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        {isPinned ? "Pinned" : "Pin"}
      </Badge>
    </button>
  );
}
