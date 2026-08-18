import { createClient } from "@/lib/supabase/server";

export interface ModuleWithProgress {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: "beginner" | "intermediate" | "advanced";
  order_index: number;
  totalLessons: number;
  completedLessons: number;
}

/** Modules with per-user lesson completion counts, for the "My Learning" page. */
export async function getModulesWithProgress(
  userId: string
): Promise<ModuleWithProgress[]> {
  const supabase = await createClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, title, slug, description, level, order_index")
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (!modules || modules.length === 0) return [];

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, module_id")
    .eq("is_published", true)
    .in(
      "module_id",
      modules.map((m) => m.id)
    );

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", userId)
    .eq("status", "completed");

  const completedLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));

  return modules.map((mod) => {
    const moduleLessons = (lessons ?? []).filter((l) => l.module_id === mod.id);
    const completedLessons = moduleLessons.filter((l) =>
      completedLessonIds.has(l.id)
    ).length;

    return {
      ...mod,
      totalLessons: moduleLessons.length,
      completedLessons,
    };
  });
}

/** A single module with its ordered, published lessons and per-lesson status. */
export async function getModuleWithLessons(moduleSlug: string, userId: string) {
  const supabase = await createClient();

  const { data: mod } = await supabase
    .from("modules")
    .select("id, title, slug, description, level")
    .eq("slug", moduleSlug)
    .eq("is_published", true)
    .single();

  if (!mod) return null;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, slug, order_index, estimated_minutes")
    .eq("module_id", mod.id)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", userId);

  const statusByLessonId = new Map(
    (progress ?? []).map((p) => [p.lesson_id, p.status])
  );

  return {
    module: mod,
    lessons: (lessons ?? []).map((lesson) => ({
      ...lesson,
      status: statusByLessonId.get(lesson.id) ?? "not_started",
    })),
  };
}

/** A single lesson plus its module context, quiz (if any), and the user's progress row. */
export async function getLessonDetail(
  moduleSlug: string,
  lessonSlug: string,
  userId: string
) {
  const supabase = await createClient();

  const { data: mod } = await supabase
    .from("modules")
    .select("id, title, slug")
    .eq("slug", moduleSlug)
    .single();

  if (!mod) return null;

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "id, title, slug, objectives, materials, content_body, code_snippets, estimated_minutes, order_index"
    )
    .eq("module_id", mod.id)
    .eq("slug", lessonSlug)
    .eq("is_published", true)
    .single();

  if (!lesson) return null;

  const [{ data: progress }, { data: quiz }, { data: siblingLessons }] =
    await Promise.all([
      supabase
        .from("lesson_progress")
        .select("status")
        .eq("user_id", userId)
        .eq("lesson_id", lesson.id)
        .maybeSingle(),
      supabase
        .from("quizzes")
        .select("id, title")
        .eq("lesson_id", lesson.id)
        .maybeSingle(),
      supabase
        .from("lessons")
        .select("slug, order_index")
        .eq("module_id", mod.id)
        .eq("is_published", true)
        .order("order_index", { ascending: true }),
    ]);

  const siblings = siblingLessons ?? [];
  const currentIndex = siblings.findIndex((l) => l.slug === lesson.slug);
  const nextLesson = siblings[currentIndex + 1] ?? null;
  const previousLesson = currentIndex > 0 ? siblings[currentIndex - 1] : null;

  return {
    module: mod,
    lesson,
    status: progress?.status ?? "not_started",
    quiz,
    nextLesson,
    previousLesson,
  };
}

/** Overall completion summary used on the dashboard home and progress pages. */
export async function getProgressSummary(userId: string) {
  const supabase = await createClient();

  const [{ count: totalLessons }, { count: completedLessons }, { data: streak }] =
    await Promise.all([
      supabase.from("lessons").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed"),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak, last_active_date")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  return {
    totalLessons: totalLessons ?? 0,
    completedLessons: completedLessons ?? 0,
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
  };
}

/** The next not-yet-completed published lesson, in module/lesson order. */
export async function getNextLesson(userId: string) {
  const supabase = await createClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, slug, title, order_index")
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (!modules || modules.length === 0) return null;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, slug, title, module_id, order_index")
    .eq("is_published", true)
    .in(
      "module_id",
      modules.map((m) => m.id)
    )
    .order("order_index", { ascending: true });

  if (!lessons || lessons.length === 0) return null;

  const { data: completed } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("status", "completed");

  const completedIds = new Set((completed ?? []).map((c) => c.lesson_id));
  const moduleBySlugOrder = new Map(modules.map((m) => [m.id, m]));

  const sorted = [...lessons].sort((a, b) => {
    const modA = moduleBySlugOrder.get(a.module_id)!;
    const modB = moduleBySlugOrder.get(b.module_id)!;
    if (modA.order_index !== modB.order_index) return modA.order_index - modB.order_index;
    return a.order_index - b.order_index;
  });

  const next = sorted.find((l) => !completedIds.has(l.id));
  if (!next) return null;

  const mod = moduleBySlugOrder.get(next.module_id)!;
  return { moduleSlug: mod.slug, lessonSlug: next.slug, lessonTitle: next.title };
}
