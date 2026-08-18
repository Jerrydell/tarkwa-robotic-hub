import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { QuizRunner } from "@/components/dashboard/quiz-runner";

interface StoredQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

async function getQuizForAttempt(quizId: string) {
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, questions, lesson_id")
    .eq("id", quizId)
    .single();

  if (!quiz) return null;

  let returnHref = "/dashboard/learn";

  if (quiz.lesson_id) {
    const { data: lesson } = await supabase
      .from("lessons")
      .select("slug, module_id")
      .eq("id", quiz.lesson_id)
      .single();

    if (lesson) {
      const { data: mod } = await supabase
        .from("modules")
        .select("slug")
        .eq("id", lesson.module_id)
        .single();

      if (mod) returnHref = `/dashboard/learn/${mod.slug}/${lesson.slug}`;
    }
  }

  const rawQuestions = quiz.questions as unknown as StoredQuestion[];

  return {
    id: quiz.id,
    title: quiz.title,
    returnHref,
    // Strip correct_index/explanation — the client only ever sees the
    // question and options until after it submits an attempt.
    questions: rawQuestions.map((q) => ({
      question: q.question,
      options: q.options,
    })),
  };
}

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const quiz = await getQuizForAttempt(quizId);
  if (!quiz) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{quiz.title}</h1>
        <p className="mt-1 text-sm text-muted">
          Answer every question, then submit to see your score.
        </p>
      </div>
      <QuizRunner quizId={quiz.id} questions={quiz.questions} returnHref={quiz.returnHref} />
    </div>
  );
}
