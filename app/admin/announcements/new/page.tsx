import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnnouncementForm } from "@/components/admin/announcement-form";

export default function NewAnnouncementPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/announcements" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Announcements
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">New announcement</h1>
      </div>
      <Card className="p-6">
        <AnnouncementForm mode="create" />
      </Card>
    </div>
  );
}
