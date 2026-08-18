"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markLessonComplete } from "@/features/learning/actions";

export function MarkCompleteButton({
  lessonId,
  moduleSlug,
  isComplete,
}: {
  lessonId: string;
  moduleSlug: string;
  isComplete: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (isComplete) {
    return (
      <Button variant="outline" disabled className="border-success/40 text-success">
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </Button>
    );
  }

  return (
    <Button
      onClick={() =>
        startTransition(() => {
          markLessonComplete(lessonId, moduleSlug);
        })
      }
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      {isPending ? "Saving..." : "Mark as complete"}
    </Button>
  );
}
