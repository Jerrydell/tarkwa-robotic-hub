import { createClient } from "@/lib/supabase/server";

export async function getMembershipApplications(status?: "pending" | "approved" | "rejected") {
  const supabase = await createClient();

  let query = supabase
    .from("membership_applications")
    .select("id, user_id, status, motivation_text, created_at, reviewed_at")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: applications } = await query;
  if (!applications || applications.length === 0) return [];

  const userIds = [...new Set(applications.map((a) => a.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, year_group")
    .in("id", userIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return applications.map((app) => ({
    ...app,
    applicantName: profileById.get(app.user_id)?.full_name || "Student",
    applicantYearGroup: profileById.get(app.user_id)?.year_group || null,
  }));
}
