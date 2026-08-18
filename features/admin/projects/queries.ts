import { createClient } from "@/lib/supabase/server";

export async function getAllProjectsForAdmin(status?: "pending_review" | "approved" | "rejected" | "draft") {
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select("id, title, slug, summary, status, submitted_by, is_club_project, created_at")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: projects } = await query;
  if (!projects || projects.length === 0) return [];

  const submitterIds = [...new Set(projects.map((p) => p.submitted_by).filter(Boolean))] as string[];
  const { data: profiles } = submitterIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", submitterIds)
    : { data: [] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return projects.map((p) => ({
    ...p,
    submitterName: p.submitted_by ? nameById.get(p.submitted_by) || "Member" : "—",
  }));
}
