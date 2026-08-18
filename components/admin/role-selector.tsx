"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { changeUserRole } from "@/features/admin/users/actions";
import type { Role } from "@/lib/auth/helpers";

const ROLE_OPTIONS: Role[] = ["student", "club_member", "super_admin"];
const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  club_member: "Club Member",
  super_admin: "Super Admin",
};

export function RoleSelector({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: Role;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (isSelf) {
    return (
      <span className="font-mono text-xs uppercase tracking-wider text-muted">
        {ROLE_LABELS[currentRole]} (you)
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={currentRole}
        disabled={isPending}
        onChange={(e) =>
          startTransition(async () => {
            await changeUserRole(userId, e.target.value as Role);
          })
        }
        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-primary"
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />}
    </div>
  );
}
