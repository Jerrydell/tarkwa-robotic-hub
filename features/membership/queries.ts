import { createClient } from "@/lib/supabase/server";

export async function getMembershipApplication(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("membership_applications")
    .select("id, status, motivation_text, created_at, reviewed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .maybeSingle();

  return data;
}
