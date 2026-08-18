"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";
import type { Role } from "@/lib/auth/helpers";

export async function changeUserRole(userId: string, newRole: Role) {
  const admin = await requireRole("super_admin");

  if (userId === admin.id) {
    return { error: "You can't change your own role from here." };
  }

  const supabase = await createClient();
  await supabase.from("profiles").update({ role: newRole }).eq("id", userId);

  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: string, currentlyActive: boolean) {
  const admin = await requireRole("super_admin");

  if (userId === admin.id) {
    return { error: "You can't deactivate your own account." };
  }

  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: !currentlyActive }).eq("id", userId);

  if (currentlyActive) {
    await supabase.from("moderation_actions").insert({
      admin_id: admin.id,
      action_type: "ban_user",
      target_type: "profile",
      target_id: userId,
      reason: "Account suspended",
    });
  }

  revalidatePath("/admin/users");
}
