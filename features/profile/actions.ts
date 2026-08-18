"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";
import { profileUpdateSchema } from "@/lib/validation/schemas";

export interface ProfileFormState {
  success: boolean;
  error?: string;
}

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const profile = await requireRole("student");

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    bio: formData.get("bio") || undefined,
    yearGroup: formData.get("yearGroup") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      bio: parsed.data.bio ?? null,
      year_group: parsed.data.yearGroup ?? null,
    })
    .eq("id", profile.id);

  if (error) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { success: true };
}
