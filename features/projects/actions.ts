"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";
import { projectSubmissionSchema } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";

export interface ProjectFormState {
  success: boolean;
  error?: string;
}

export async function submitProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const profile = await requireRole("club_member");

  const materialsRaw = (formData.get("materials") as string) ?? "";
  const parsed = projectSubmissionSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    problemStatement: formData.get("problemStatement"),
    materials: materialsRaw
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean),
    coverImageUrl: formData.get("coverImageUrl") || "",
    circuitDiagramUrl: formData.get("circuitDiagramUrl") || "",
    codeRepoUrl: formData.get("codeRepoUrl") || "",
    demoVideoUrl: formData.get("demoVideoUrl") || "",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const slug = slugify(parsed.data.title);
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: parsed.data.title,
      slug,
      summary: parsed.data.summary,
      problem_statement: parsed.data.problemStatement,
      materials: parsed.data.materials,
      cover_image_url: parsed.data.coverImageUrl || null,
      circuit_diagram_url: parsed.data.circuitDiagramUrl || null,
      code_repo_url: parsed.data.codeRepoUrl || null,
      demo_video_url: parsed.data.demoVideoUrl || null,
      status: "pending_review",
      submitted_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath("/dashboard/projects");
  redirect(`/projects/${slug}`);
}

export async function addTeamMember(projectId: string, userId: string) {
  await requireRole("club_member");
  const supabase = await createClient();

  await supabase
    .from("project_team_members")
    .insert({ project_id: projectId, user_id: userId, role_label: "Member" });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function removeTeamMember(projectId: string, userId: string) {
  await requireRole("club_member");
  const supabase = await createClient();

  await supabase
    .from("project_team_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateProject(
  projectId: string,
  projectSlug: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const profile = await requireRole("club_member");

  const materialsRaw = (formData.get("materials") as string) ?? "";
  const parsed = projectSubmissionSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    problemStatement: formData.get("problemStatement"),
    materials: materialsRaw
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean),
    coverImageUrl: formData.get("coverImageUrl") || "",
    circuitDiagramUrl: formData.get("circuitDiagramUrl") || "",
    codeRepoUrl: formData.get("codeRepoUrl") || "",
    demoVideoUrl: formData.get("demoVideoUrl") || "",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  // RLS also restricts this to the owner while status is draft/pending_review
  const { error } = await supabase
    .from("projects")
    .update({
      title: parsed.data.title,
      summary: parsed.data.summary,
      problem_statement: parsed.data.problemStatement,
      materials: parsed.data.materials,
      cover_image_url: parsed.data.coverImageUrl || null,
      circuit_diagram_url: parsed.data.circuitDiagramUrl || null,
      code_repo_url: parsed.data.codeRepoUrl || null,
      demo_video_url: parsed.data.demoVideoUrl || null,
    })
    .eq("id", projectId)
    .eq("submitted_by", profile.id);

  if (error) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/projects/${projectSlug}`);
  revalidatePath(`/dashboard/projects/${projectId}/edit`);
  return { success: true };
}

export interface ProjectCommentFormState {
  success: boolean;
  error?: string;
}

export async function createProjectComment(
  projectId: string,
  projectSlug: string,
  _prevState: ProjectCommentFormState,
  formData: FormData
): Promise<ProjectCommentFormState> {
  const profile = await requireRole("student");
  const body = (formData.get("body") as string)?.trim();

  if (!body || body.length < 1) {
    return { success: false, error: "Write something first." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("project_comments")
    .insert({ project_id: projectId, user_id: profile.id, body });

  if (error) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/projects/${projectSlug}`);
  return { success: true };
}
