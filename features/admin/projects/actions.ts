"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";

export async function approveProject(projectId: string, submittedBy: string | null) {
  const admin = await requireRole("super_admin");
  const supabase = await createClient();

  await supabase
    .from("projects")
    .update({ status: "approved", reviewed_by: admin.id })
    .eq("id", projectId);

  if (submittedBy) {
    await supabase.from("notifications").insert({
      user_id: submittedBy,
      type: "project_status",
      title: "Your project was approved!",
      body: "It's now live on the public Projects page.",
      link_url: "/dashboard/projects",
    });
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function rejectProject(projectId: string, submittedBy: string | null, reason: string) {
  const admin = await requireRole("super_admin");
  const supabase = await createClient();

  await supabase
    .from("projects")
    .update({ status: "rejected", reviewed_by: admin.id })
    .eq("id", projectId);

  if (submittedBy) {
    await supabase.from("notifications").insert({
      user_id: submittedBy,
      type: "project_status",
      title: "Your project needs changes",
      body: reason || "It wasn't approved this time — check the project page for details.",
      link_url: "/dashboard/projects",
    });
  }

  await supabase.from("moderation_actions").insert({
    admin_id: admin.id,
    action_type: "reject_project",
    target_type: "project",
    target_id: projectId,
    reason,
  });

  revalidatePath("/admin/projects");
}
