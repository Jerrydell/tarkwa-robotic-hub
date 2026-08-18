"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";
import { membershipApplicationSchema } from "@/lib/validation/schemas";

export interface MembershipFormState {
  success: boolean;
  error?: string;
}

export async function applyForMembership(
  _prevState: MembershipFormState,
  formData: FormData
): Promise<MembershipFormState> {
  const profile = await requireRole("student");

  const parsed = membershipApplicationSchema.safeParse({
    motivationText: formData.get("motivationText"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("membership_applications").insert({
    user_id: profile.id,
    motivation_text: parsed.data.motivationText,
  });

  if (error) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath("/dashboard/membership");
  revalidatePath("/dashboard");

  return { success: true };
}
