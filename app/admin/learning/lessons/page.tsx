import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { ToggleButton } from "@/components/admin/toggle-button";
import { getAllLessonsAdmin } from "@/features/admin/learning/queries";
import { deleteLesson, toggleLessonPublish } from "@/features/admin/learning/actions";

export default async function AdminLessonsPage() {
  const lessons = await getAllLessonsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Learning — Lessons"
        action={
          <div className="flex gap-2">
            <Link href="/admin/learning/modules">
              <Button variant="outline" size="sm">Modules</Button>
            </Link>
            <Link href="/admin/learning/lessons/new">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                New lesson
              </Button>
            </Link>
          </div>
        }
      />

      {lessons.length === 0 ? (
        <EmptyState icon={FileText} title="No lessons yet" description="Create a module first, then add lessons." />
      ) : (
        <div className="flex flex-col gap-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/learning/lessons/${lesson.id}/edit`}
                  className="font-medium hover:text-primary"
                >
                  {lesson.title}
                </Link>
                <p className="text-xs text-muted">{lesson.moduleTitle}</p>
              </div>
              <ToggleButton
                isOn={lesson.is_published}
                onToggle={() => toggleLessonPublish(lesson.id, lesson.is_published)}
                onLabel="Published"
                offLabel="Draft"
              />
              <DeleteButton onDelete={() => deleteLesson(lesson.id)} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
