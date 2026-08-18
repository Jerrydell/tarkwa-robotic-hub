import { createClient } from "@/lib/supabase/server";

export async function getNotifications(userId: string, limit?: number) {
  const supabase = await createClient();

  let query = supabase
    .from("notifications")
    .select("id, type, title, body, link_url, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data } = await query;
  return data ?? [];
}
