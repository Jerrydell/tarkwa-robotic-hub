import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ResourceForm } from "@/components/admin/resource-form";
import { getResourceByIdAdmin } from "@/features/admin/content/queries";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resource = await getResourceByIdAdmin(id);
  if (!resource) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/resources" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Resources
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Edit resource</h1>
      </div>
      <Card className="p-6">
        <ResourceForm
          mode="edit"
          resourceId={resource.id}
          initialTitle={resource.title}
          initialDescription={resource.description}
          initialFileUrl={resource.file_url}
          initialResourceType={resource.resource_type}
          initialVisibility={resource.visibility}
        />
      </Card>
    </div>
  );
}
