import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLessonsForSelect } from "@/features/admin/learning/queries";
import { QuizForm } from "@/components/admin/quiz-form";

export default async function NewQuizPage() {
  const lessons = await getLessonsForSelect();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/admin/learning/quizzes"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quizzes
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">New quiz</h1>
      </div>
      <QuizForm mode="create" lessons={lessons} />
    </div>
  );
}
