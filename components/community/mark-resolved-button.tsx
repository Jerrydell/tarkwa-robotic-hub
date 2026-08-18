"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markPostResolved } from "@/features/community/actions";

export function MarkResolvedButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => markPostResolved(postId))}
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      Mark resolved
    </Button>
  );
}
