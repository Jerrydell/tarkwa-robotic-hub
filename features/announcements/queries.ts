import { createClient } from "@/lib/supabase/server";

/** Member-only internal updates — visibility='club_member' announcements. */
export async function getMemberUpdates() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, published_at, created_at")
    .eq("visibility", "club_member")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}
