"use client";

import { useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveProject, rejectProject } from "@/features/admin/projects/actions";

export function ProjectActionButtons({
  projectId,
  submittedBy,
}: {
  projectId: string;
  submittedBy: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => approveProject(projectId, submittedBy))}
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          const reason = window.prompt("Reason (shown to the submitter):") ?? "";
          startTransition(() => rejectProject(projectId, submittedBy, reason));
        }}
      >
        <X className="h-3.5 w-3.5" />
        Reject
      </Button>
    </div>
  );
}
