import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GalleryForm } from "@/components/admin/gallery-form";

export default function NewGalleryItemPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/gallery" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Gallery
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Add photo</h1>
      </div>
      <Card className="p-6">
        <GalleryForm />
      </Card>
    </div>
  );
}
