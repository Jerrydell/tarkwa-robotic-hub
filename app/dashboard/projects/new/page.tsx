import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/helpers";
import { ProjectSubmitForm } from "@/components/projects/project-submit-form";

export default async function NewProjectPage() {
  await requireRole("club_member");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My Projects
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Submit a project</h1>
      </div>
      <Card className="p-6">
        <ProjectSubmitForm />
      </Card>
    </div>
  );
}
