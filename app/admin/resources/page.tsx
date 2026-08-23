import Link from "next/link";
import { Plus, Library } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAllResourcesAdmin } from "@/features/admin/content/queries";
import { deleteResource } from "@/features/admin/content/actions";

export default async function AdminResourcesPage() {
  const resources = await getAllResourcesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Resources"
        action={
          <Link href="/admin/resources/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              New resource
            </Button>
          </Link>
        }
      />

      {resources.length === 0 ? (
        <EmptyState icon={Library} title="No resources yet" description="Add your first resource." />
      ) : (
        <div className="flex flex-col gap-2">
          {resources.map((r) => (
            <Card key={r.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/resources/${r.id}/edit`} className="font-medium hover:text-primary">
                  {r.title}
                </Link>
                <p className="text-xs text-muted">{r.resource_type}</p>
              </div>
              <Badge tone="muted">{r.visibility}</Badge>
              <DeleteButton action={deleteResource} id={r.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
