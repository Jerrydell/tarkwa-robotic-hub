"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";

export async function updateSetting(key: string, value: boolean) {
  const admin = await requireRole("super_admin");
  const supabase = await createClient();

  await supabase
    .from("app_settings")
    .update({ value, updated_at: new Date().toISOString(), updated_by: admin.id })
    .eq("key", key);

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/dashboard");
}
