"use client";

import { useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveMembership, rejectMembership } from "@/features/admin/membership/actions";

export function MembershipActionButtons({
  applicationId,
  applicantUserId,
}: {
  applicationId: string;
  applicantUserId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(() => approveMembership(applicationId, applicantUserId))
        }
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          const reason = window.prompt("Reason (optional, shown to the applicant):") ?? "";
          startTransition(() => rejectMembership(applicationId, applicantUserId, reason));
        }}
      >
        <X className="h-3.5 w-3.5" />
        Reject
      </Button>
    </div>
  );
}
