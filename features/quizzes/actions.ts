"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface QuizReviewItem {
  question: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  explanation?: string;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  review: QuizReviewItem[];
}

/**
 * Scores the quiz server-side from the stored questions/correct answers —
 * the client only ever sends the selected option indices, never a score,
 * so there's no way to fake a pass from the browser.
 */
export async function submitQuizAttempt(
  quizId: string,
  answers: number[]
): Promise<QuizResult | { error: string }> {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("questions, passing_score")
    .eq("id", quizId)
    .single();

  if (!quiz) {
    return { error: "Quiz not found." };
  }

  const questions = quiz.questions as unknown as QuizQuestion[];
  const correctCount = questions.reduce(
    (acc, q, i) => (answers[i] === q.correct_index ? acc + 1 : acc),
    0
  );
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= quiz.passing_score;

  await supabase.from("quiz_attempts").insert({
    quiz_id: quizId,
    user_id: profile.id,
    score,
    passed,
    answers,
  });

  return {
    score,
    passed,
    passingScore: quiz.passing_score,
    correctCount,
    totalQuestions: questions.length,
    review: questions.map((q, i) => ({
      question: q.question,
      options: q.options,
      selectedIndex: answers[i],
      correctIndex: q.correct_index,
      explanation: q.explanation,
    })),
  };
}
