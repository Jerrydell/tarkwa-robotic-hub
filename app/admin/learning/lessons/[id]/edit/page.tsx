import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getLessonByIdAdmin, getModulesForSelect } from "@/features/admin/learning/queries";
import { LessonForm } from "@/components/admin/lesson-form";

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lesson, modules] = await Promise.all([
    getLessonByIdAdmin(id),
    getModulesForSelect(),
  ]);
  if (!lesson) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/admin/learning/lessons"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Lessons
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Edit lesson</h1>
      </div>
      <LessonForm
        mode="edit"
        lessonId={lesson.id}
        modules={modules}
        initialTitle={lesson.title}
        initialModuleId={lesson.module_id}
        initialOrderIndex={lesson.order_index}
        initialObjectives={lesson.objectives ?? []}
        initialMaterials={lesson.materials ?? []}
        initialContentBody={
          Array.isArray(lesson.content_body) ? lesson.content_body : []
        }
        initialEstimatedMinutes={lesson.estimated_minutes}
      />
    </div>
  );
}
