import { createClient } from "@/lib/supabase/server";

export async function getProjectDetail(slug: string, userId: string) {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, title, slug, cover_image_url, summary, problem_statement, materials, circuit_diagram_url, code_repo_url, demo_video_url, build_steps, status, submitted_by, is_club_project, created_at"
    )
    .eq("slug", slug)
    .single();

  // RLS already restricts which rows are visible (approved, own, team
  // member, or admin) — a null result here just means "not found or
  // not visible to this user", which is the same not-found UX.
  if (!project) return null;

  const [{ data: team }, { data: images }, { data: comments }] = await Promise.all([
    supabase
      .from("project_team_members")
      .select("user_id, role_label")
      .eq("project_id", project.id),
    supabase
      .from("project_images")
      .select("id, image_url, caption, order_index")
      .eq("project_id", project.id)
      .order("order_index", { ascending: true }),
    supabase
      .from("project_comments")
      .select("id, body, created_at, user_id")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true }),
  ]);

  const memberIds = [
    ...new Set([
      ...(team ?? []).map((t) => t.user_id),
      ...(comments ?? []).map((c) => c.user_id),
    ]),
  ];

  const { data: profiles } = memberIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", memberIds)
    : { data: [] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return {
    project,
    isOwner: project.submitted_by === userId,
    isTeamMember: (team ?? []).some((t) => t.user_id === userId),
    team: (team ?? []).map((t) => ({ ...t, name: nameById.get(t.user_id) || "Member" })),
    images: images ?? [],
    comments: (comments ?? []).map((c) => ({
      ...c,
      authorName: nameById.get(c.user_id) || "Student",
    })),
  };
}

/** Projects the user submitted or is a team member on — for "My Projects". */
/** Fetch a project by id for the edit form — RLS already scopes this to
 *  the owner (while draft/pending_review) or a Super Admin. */
export async function getProjectForEdit(projectId: string) {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, title, slug, summary, problem_statement, materials, cover_image_url, circuit_diagram_url, code_repo_url, demo_video_url, status, submitted_by"
    )
    .eq("id", projectId)
    .single();

  if (!project) return null;

  const { data: team } = await supabase
    .from("project_team_members")
    .select("user_id, role_label")
    .eq("project_id", projectId);

  const memberIds = (team ?? []).map((t) => t.user_id);
  const { data: profiles } = memberIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", memberIds)
    : { data: [] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return {
    project,
    team: (team ?? []).map((t) => ({ ...t, name: nameById.get(t.user_id) || "Member" })),
  };
}

export async function getUserProjects(userId: string) {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("project_team_members")
    .select("project_id")
    .eq("user_id", userId);

  const projectIds = [...new Set((memberships ?? []).map((m) => m.project_id))];
  if (projectIds.length === 0) return [];

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, slug, cover_image_url, summary, status, is_club_project, submitted_by")
    .in("id", projectIds)
    .order("created_at", { ascending: false });

  return (projects ?? []).map((p) => ({ ...p, isOwner: p.submitted_by === userId }));
}

/** Other club members eligible to be added to a project team. */
export async function getEligibleTeammates(excludeUserIds: string[]) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["club_member", "super_admin"])
    .order("full_name", { ascending: true });

  if (excludeUserIds.length > 0) {
    query = query.not("id", "in", `(${excludeUserIds.join(",")})`);
  }

  const { data } = await query;
  return data ?? [];
}
