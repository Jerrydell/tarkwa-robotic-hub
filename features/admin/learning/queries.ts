import { createClient } from "@/lib/supabase/server";

export async function getAllModulesAdmin() {
  const supabase = await createClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, slug, level, order_index, is_published")
    .order("order_index", { ascending: true });

  if (!modules || modules.length === 0) return [];

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, module_id")
    .in("module_id", modules.map((m) => m.id));

  const lessonCountByModule = new Map<string, number>();
  for (const l of lessons ?? []) {
    lessonCountByModule.set(l.module_id, (lessonCountByModule.get(l.module_id) ?? 0) + 1);
  }

  return modules.map((m) => ({ ...m, lessonCount: lessonCountByModule.get(m.id) ?? 0 }));
}

export async function getModuleByIdAdmin(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("modules").select("*").eq("id", id).single();
  return data;
}

export async function getModulesForSelect() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("modules")
    .select("id, title")
    .order("order_index", { ascending: true });
  return data ?? [];
}

export async function getAllLessonsAdmin(moduleId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("lessons")
    .select("id, title, slug, module_id, order_index, is_published")
    .order("order_index", { ascending: true });

  if (moduleId) query = query.eq("module_id", moduleId);

  const { data: lessons } = await query;
  if (!lessons || lessons.length === 0) return [];

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title")
    .in("id", [...new Set(lessons.map((l) => l.module_id))]);

  const moduleTitleById = new Map((modules ?? []).map((m) => [m.id, m.title]));

  return lessons.map((l) => ({ ...l, moduleTitle: moduleTitleById.get(l.module_id) || "—" }));
}

export async function getLessonByIdAdmin(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("lessons").select("*").eq("id", id).single();
  return data;
}

export async function getLessonsForSelect() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("id, title")
    .order("order_index", { ascending: true });
  return data ?? [];
}

export async function getAllQuizzesAdmin() {
  const supabase = await createClient();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, passing_score, lesson_id, created_at")
    .order("created_at", { ascending: false });

  if (!quizzes || quizzes.length === 0) return [];

  const lessonIds = [...new Set(quizzes.map((q) => q.lesson_id).filter(Boolean))] as string[];
  const { data: lessons } = lessonIds.length
    ? await supabase.from("lessons").select("id, title").in("id", lessonIds)
    : { data: [] };

  const lessonTitleById = new Map((lessons ?? []).map((l) => [l.id, l.title]));

  return quizzes.map((q) => ({
    ...q,
    lessonTitle: q.lesson_id ? lessonTitleById.get(q.lesson_id) || "—" : "Standalone",
  }));
}

export async function getQuizByIdAdmin(id: string) {
  const supabase = await createClient();
  
  // 1. Fetch the quiz
  const { data: quiz } = await supabase.from("quizzes").select("*").eq("id", id).single();
  if (!quiz) return null;

  // 2. Fetch the answers
  const { data: answers } = await supabase
    .from("quiz_answers")
    .select("*")
    .eq("quiz_id", id)
    .order("question_index", { ascending: true });

  // 3. Merge them back into the questions JSON for the admin UI
  const questions = (quiz.questions as any[] || []).map((q, i) => {
    const answer = answers?.find(a => a.question_index === i);
    return {
      ...q,
      correct_index: answer?.correct_index ?? 0,
      explanation: answer?.explanation ?? ""
    };
  });

  return { ...quiz, questions };
}
