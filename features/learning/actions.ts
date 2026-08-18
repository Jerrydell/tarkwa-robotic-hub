"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";

/**
 * Marks a lesson complete for the current user. The actual streak update
 * and achievement checks happen in Postgres triggers (see migrations
 * 0002 and 0006) — this action's only job is the upsert.
 */
export async function markLessonComplete(lessonId: string, moduleSlug: string) {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: profile.id,
      lesson_id: lessonId,
      status: "completed",
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/learn/${moduleSlug}`);
  revalidatePath("/dashboard/learn");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/progress");

  return { success: true };
}
