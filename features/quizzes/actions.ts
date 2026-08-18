"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";

interface QuizQuestion {
  question: string;
  options: string[];
}

interface QuizAnswer {
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
  const adminClient = await createAdminClient();

  // 1. Fetch public quiz data (questions, passing score)
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("questions, passing_score")
    .eq("id", quizId)
    .single();

  if (!quiz) {
    return { error: "Quiz not found." };
  }

  // 2. Fetch secure answers using admin client
  const { data: correctAnswers } = await adminClient
    .from("quiz_answers")
    .select("question_index, correct_index, explanation")
    .eq("quiz_id", quizId)
    .order("question_index", { ascending: true });

  if (!correctAnswers || correctAnswers.length === 0) {
    return { error: "Quiz answers not configured correctly." };
  }

  const questions = quiz.questions as unknown as QuizQuestion[];
  
  // Create a map for quick lookup
  const answerMap = new Map(correctAnswers.map(a => [a.question_index, a]));

  const correctCount = questions.reduce(
    (acc, _q, i) => (answers[i] === answerMap.get(i)?.correct_index ? acc + 1 : acc),
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
      correctIndex: answerMap.get(i)?.correct_index ?? 0,
      explanation: answerMap.get(i)?.explanation ?? undefined,
    })),
  };
}
