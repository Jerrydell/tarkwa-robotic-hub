import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { ToggleButton } from "@/components/admin/toggle-button";
import { getAllModulesAdmin } from "@/features/admin/learning/queries";
import { deleteModule, toggleModulePublish } from "@/features/admin/learning/actions";

export default async function AdminModulesPage() {
  const modules = await getAllModulesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Learning — Modules"
        description="Modules, lessons, and quizzes for the learning platform."
        action={
          <div className="flex gap-2">
            <Link href="/admin/learning/lessons">
              <Button variant="outline" size="sm">Lessons</Button>
            </Link>
            <Link href="/admin/learning/quizzes">
              <Button variant="outline" size="sm">Quizzes</Button>
            </Link>
            <Link href="/admin/learning/modules/new">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                New module
              </Button>
            </Link>
          </div>
        }
      />

      {modules.length === 0 ? (
        <EmptyState icon={BookOpen} title="No modules yet" description="Create your first module." />
      ) : (
        <div className="flex flex-col gap-2">
          {modules.map((mod) => (
            <Card key={mod.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/learning/modules/${mod.id}/edit`}
                  className="font-medium hover:text-primary"
                >
                  {mod.title}
                </Link>
                <p className="text-xs text-muted">
                  {mod.level} · {mod.lessonCount} {mod.lessonCount === 1 ? "lesson" : "lessons"}
                </p>
              </div>
              <ToggleButton
                action={toggleModulePublish}
                id={mod.id}
                isOn={mod.is_published}
                onLabel="Published"
                offLabel="Draft"
              />
              <DeleteButton
                action={deleteModule}
                id={mod.id}
                confirmMessage="Delete this module and all its lessons? This can't be undone."
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
