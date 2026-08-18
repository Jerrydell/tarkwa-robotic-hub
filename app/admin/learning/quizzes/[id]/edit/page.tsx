import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getQuizByIdAdmin, getLessonsForSelect } from "@/features/admin/learning/queries";
import { QuizForm } from "@/components/admin/quiz-form";

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quiz, lessons] = await Promise.all([
    getQuizByIdAdmin(id),
    getLessonsForSelect(),
  ]);
  if (!quiz) notFound();

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
        <h1 className="mt-3 text-2xl font-semibold">Edit quiz</h1>
      </div>
      <QuizForm
        mode="edit"
        quizId={quiz.id}
        lessons={lessons}
        initialTitle={quiz.title}
        initialLessonId={quiz.lesson_id}
        initialPassingScore={quiz.passing_score}
        initialQuestions={Array.isArray(quiz.questions) ? quiz.questions : []}
      />
    </div>
  );
}
