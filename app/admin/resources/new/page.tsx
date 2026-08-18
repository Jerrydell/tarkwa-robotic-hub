import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ResourceForm } from "@/components/admin/resource-form";

export default function NewResourcePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/resources" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Resources
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">New resource</h1>
      </div>
      <Card className="p-6">
        <ResourceForm mode="create" />
      </Card>
    </div>
  );
}
