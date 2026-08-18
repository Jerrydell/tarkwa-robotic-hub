import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAllProjectsForAdmin } from "@/features/admin/projects/queries";
import { ProjectActionButtons } from "@/components/admin/project-action-buttons";

const STATUS_TONE = {
  draft: "muted",
  pending_review: "warning",
  approved: "success",
  rejected: "danger",
} as const;

export default async function AdminProjectsPage() {
  const [pending, all] = await Promise.all([
    getAllProjectsForAdmin("pending_review"),
    getAllProjectsForAdmin(),
  ]);

  const reviewed = all.filter((p) => p.status !== "pending_review" && p.status !== "draft");

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Projects"
        description="Review submissions and manage what's publicly visible."
      />

      <div>
        <h2 className="text-lg font-semibold">Pending review ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Nothing to review"
            description="New submissions will show up here."
            className="mt-4"
          />
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {pending.map((p) => (
              <Card key={p.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={`/projects/${p.slug}`} className="font-medium hover:text-primary">
                    {p.title}
                  </Link>
                  <p className="text-xs text-muted">by {p.submitterName}</p>
                  {p.summary && <p className="mt-2 max-w-lg text-sm text-foreground/90">{p.summary}</p>}
                </div>
                <ProjectActionButtons projectId={p.id} submittedBy={p.submitted_by} />
              </Card>
            ))}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Reviewed</h2>
          <div className="mt-4 flex flex-col gap-2">
            {reviewed.map((p) => (
              <Card key={p.id} className="flex items-center justify-between p-4">
                <Link href={`/projects/${p.slug}`} className="text-sm font-medium hover:text-primary">
                  {p.title}
                </Link>
                <Badge tone={STATUS_TONE[p.status]}>{p.status.replace("_", " ")}</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
