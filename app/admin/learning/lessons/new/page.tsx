import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getModulesForSelect } from "@/features/admin/learning/queries";
import { LessonForm } from "@/components/admin/lesson-form";

export default async function NewLessonPage() {
  const modules = await getModulesForSelect();

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
        <h1 className="mt-3 text-2xl font-semibold">New lesson</h1>
      </div>
      <LessonForm mode="create" modules={modules} />
    </div>
  );
}
