import { Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { requireRole } from "@/lib/auth/helpers";
import { getMemberUpdates } from "@/features/announcements/queries";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function UpdatesPage() {
  await requireRole("club_member");
  const updates = await getMemberUpdates();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <div className="mb-2">
          <Badge tone="identity">Club Member exclusive</Badge>
        </div>
        <h1 className="text-2xl font-semibold">Internal Updates</h1>
        <p className="mt-1 text-sm text-muted">
          Announcements visible only to verified Club Members.
        </p>
      </div>

      {updates.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No internal updates yet"
          description="Member-only announcements from the Super Admin will show up here."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {updates.map((update) => (
            <Card key={update.id} className="p-5">
              <p className="font-mono text-xs text-muted">
                {formatDate(update.published_at ?? update.created_at)}
              </p>
              <h3 className="mt-1 font-semibold">{update.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {update.body}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
