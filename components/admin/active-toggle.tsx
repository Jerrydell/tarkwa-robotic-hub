"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toggleUserActive } from "@/features/admin/users/actions";

export function ActiveToggle({
  userId,
  isActive,
  isSelf,
}: {
  userId: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (isSelf) return <Badge tone="success">Active</Badge>;

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (isActive && !window.confirm("Suspend this account?")) return;
        startTransition(async () => {
          await toggleUserActive(userId, isActive);
        });
      }}
    >
      <Badge tone={isActive ? "success" : "danger"} className="cursor-pointer">
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        {isActive ? "Active" : "Suspended"}
      </Badge>
    </button>
  );
}
