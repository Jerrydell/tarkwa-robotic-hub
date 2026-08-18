"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";
import { slugify } from "@/lib/utils";
import type { ModuleLevel } from "@/types/database.types";

export interface AdminFormState {
  success: boolean;
  error?: string;
}

// ---------- Modules ----------

export async function createModule(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  const title = formData.get("title") as string;
  if (!title?.trim()) return { success: false, error: "Title is required." };

  const { data, error } = await supabase
    .from("modules")
    .insert({
      title,
      slug: slugify(title),
      description: (formData.get("description") as string) || null,
      level: formData.get("level") as ModuleLevel,
      order_index: Number(formData.get("orderIndex")) || 0,
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/learning/modules");
  redirect("/admin/learning/modules");
}

export async function updateModule(
  moduleId: string,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("modules")
    .update({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      level: formData.get("level") as ModuleLevel,
      order_index: Number(formData.get("orderIndex")) || 0,
    })
    .eq("id", moduleId);

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/learning/modules");
  revalidatePath(`/admin/learning/modules/${moduleId}/edit`);
  return { success: true };
}

export async function toggleModulePublish(moduleId: string, isPublished: boolean) {
  await requireRole("super_admin");
  const supabase = await createClient();
  await supabase.from("modules").update({ is_published: !isPublished }).eq("id", moduleId);
  revalidatePath("/admin/learning/modules");
  revalidatePath("/learn");
}

export async function deleteModule(moduleId: string) {
  await requireRole("super_admin");
  const supabase = await createClient();
  await supabase.from("modules").delete().eq("id", moduleId);
  revalidatePath("/admin/learning/modules");
}

// ---------- Lessons ----------

export async function createLesson(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const moduleId = formData.get("moduleId") as string;
  if (!title?.trim() || !moduleId) {
    return { success: false, error: "Title and module are required." };
  }

  let contentBody = [];
  try {
    contentBody = JSON.parse((formData.get("contentBody") as string) || "[]");
  } catch {
    return { success: false, error: "Content couldn't be parsed." };
  }

  const objectives = ((formData.get("objectives") as string) || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const materials = ((formData.get("materials") as string) || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      title,
      slug: slugify(title),
      order_index: Number(formData.get("orderIndex")) || 0,
      objectives,
      materials,
      content_body: contentBody,
      estimated_minutes: Number(formData.get("estimatedMinutes")) || null,
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/learning/lessons");
  redirect("/admin/learning/lessons");
}

export async function updateLesson(
  lessonId: string,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  let contentBody = [];
  try {
    contentBody = JSON.parse((formData.get("contentBody") as string) || "[]");
  } catch {
    return { success: false, error: "Content couldn't be parsed." };
  }

  const objectives = ((formData.get("objectives") as string) || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const materials = ((formData.get("materials") as string) || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("lessons")
    .update({
      title: formData.get("title") as string,
      order_index: Number(formData.get("orderIndex")) || 0,
      objectives,
      materials,
      content_body: contentBody,
      estimated_minutes: Number(formData.get("estimatedMinutes")) || null,
    })
    .eq("id", lessonId);

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/learning/lessons");
  revalidatePath(`/admin/learning/lessons/${lessonId}/edit`);
  return { success: true };
}

export async function toggleLessonPublish(lessonId: string, isPublished: boolean) {
  await requireRole("super_admin");
  const supabase = await createClient();
  await supabase.from("lessons").update({ is_published: !isPublished }).eq("id", lessonId);
  revalidatePath("/admin/learning/lessons");
}

export async function deleteLesson(lessonId: string) {
  await requireRole("super_admin");
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", lessonId);
  revalidatePath("/admin/learning/lessons");
}

// ---------- Quizzes ----------

export async function createQuiz(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  const title = formData.get("title") as string;
  if (!title?.trim()) return { success: false, error: "Title is required." };

  let questions = [];
  try {
    questions = JSON.parse((formData.get("questions") as string) || "[]");
  } catch {
    return { success: false, error: "Questions couldn't be parsed." };
  }

  const lessonId = (formData.get("lessonId") as string) || null;

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      title,
      lesson_id: lessonId || null,
      passing_score: Number(formData.get("passingScore")) || 70,
      questions,
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/learning/quizzes");
  redirect("/admin/learning/quizzes");
}

export async function updateQuiz(
  quizId: string,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  let questions = [];
  try {
    questions = JSON.parse((formData.get("questions") as string) || "[]");
  } catch {
    return { success: false, error: "Questions couldn't be parsed." };
  }

  const { error } = await supabase
    .from("quizzes")
    .update({
      title: formData.get("title") as string,
      passing_score: Number(formData.get("passingScore")) || 70,
      questions,
    })
    .eq("id", quizId);

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/learning/quizzes");
  revalidatePath(`/admin/learning/quizzes/${quizId}/edit`);
  return { success: true };
}

export async function deleteQuiz(quizId: string) {
  await requireRole("super_admin");
  const supabase = await createClient();
  await supabase.from("quizzes").delete().eq("id", quizId);
  revalidatePath("/admin/learning/quizzes");
}
