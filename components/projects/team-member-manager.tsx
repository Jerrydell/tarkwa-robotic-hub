"use client";

import { useState, useTransition } from "react";
import { UserMinus, UserPlus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addTeamMember, removeTeamMember } from "@/features/projects/actions";

interface TeamMember {
  user_id: string;
  name: string;
  role_label: string | null;
}

interface EligibleTeammate {
  id: string;
  full_name: string;
}

export function TeamMemberManager({
  projectId,
  team,
  eligibleTeammates,
  isOwner,
  currentUserId,
}: {
  projectId: string;
  team: TeamMember[];
  eligibleTeammates: EligibleTeammate[];
  isOwner: boolean;
  currentUserId: string;
}) {
  const [selected, setSelected] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="p-6">
      <p className="font-mono text-xs uppercase tracking-wider text-muted">Team</p>
      <div className="mt-4 flex flex-col gap-3">
        {team.map((member) => (
          <div key={member.user_id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{member.name}</span>
              {member.role_label && <Badge tone="muted">{member.role_label}</Badge>}
            </div>
            {isOwner && member.user_id !== currentUserId && (
              <button
                onClick={() =>
                  startTransition(() => removeTeamMember(projectId, member.user_id))
                }
                disabled={isPending}
                aria-label={`Remove ${member.name}`}
                className="text-muted transition-colors hover:text-danger"
              >
                <UserMinus className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {isOwner && eligibleTeammates.length > 0 && (
        <div className="mt-5 flex gap-2 border-t border-border/60 pt-4">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">Add a club member...</option>
            {eligibleTeammates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!selected || isPending}
            onClick={() =>
              startTransition(() => {
                addTeamMember(projectId, selected);
                setSelected("");
              })
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Add
          </Button>
        </div>
      )}
    </Card>
  );
}
