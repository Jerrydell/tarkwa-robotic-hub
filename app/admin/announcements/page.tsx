import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAllAnnouncementsAdmin } from "@/features/admin/content/queries";
import { deleteAnnouncement } from "@/features/admin/content/actions";

export default async function AdminAnnouncementsPage() {
  const announcements = await getAllAnnouncementsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Announcements"
        description="Public announcements and internal updates (visibility = Club Members) all live here."
        action={
          <Link href="/admin/announcements/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              New announcement
            </Button>
          </Link>
        }
      />

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements yet" description="Create your first announcement." />
      ) : (
        <div className="flex flex-col gap-2">
          {announcements.map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/announcements/${a.id}/edit`} className="font-medium hover:text-primary">
                  {a.title}
                </Link>
              </div>
              <Badge tone="muted">{a.visibility}</Badge>
              <Badge tone={a.published_at ? "success" : "warning"}>
                {a.published_at ? "Published" : "Draft"}
              </Badge>
              <DeleteButton onDelete={() => deleteAnnouncement(a.id)} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
