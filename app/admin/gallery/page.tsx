import Link from "next/link";
import Image from "next/image";
import { Plus, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAllGalleryItemsAdmin } from "@/features/admin/content/queries";
import { deleteGalleryItem } from "@/features/admin/content/actions";

export default async function AdminGalleryPage() {
  const items = await getAllGalleryItemsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Gallery"
        action={
          <Link href="/admin/gallery/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add photo
            </Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No photos yet" description="Add your first gallery photo." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <Image src={item.image_url} alt={item.caption ?? ""} fill className="object-cover" />
              </div>
              <div className="flex items-center justify-between p-3">
                <p className="truncate text-xs text-muted">{item.caption || item.category || "—"}</p>
                <DeleteButton action={deleteGalleryItem} id={item.id} label="" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
