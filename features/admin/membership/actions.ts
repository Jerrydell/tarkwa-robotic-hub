"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";

export async function approveMembership(applicationId: string, applicantUserId: string) {
  const admin = await requireRole("super_admin");
  const supabase = await createClient();

  await supabase
    .from("membership_applications")
    .update({ status: "approved", reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq("id", applicationId);

  await supabase
    .from("profiles")
    .update({ role: "club_member" })
    .eq("id", applicantUserId);

  await supabase.from("notifications").insert({
    user_id: applicantUserId,
    type: "membership_status",
    title: "You're a Club Member!",
    body: "Your membership application was approved. You can now join project teams.",
    link_url: "/dashboard/membership",
  });

  revalidatePath("/admin/membership");
}

export async function rejectMembership(applicationId: string, applicantUserId: string, reason: string) {
  const admin = await requireRole("super_admin");
  const supabase = await createClient();

  await supabase
    .from("membership_applications")
    .update({ status: "rejected", reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq("id", applicationId);

  await supabase.from("notifications").insert({
    user_id: applicantUserId,
    type: "membership_status",
    title: "Membership application update",
    body: reason || "Your application wasn't approved this time.",
    link_url: "/dashboard/membership",
  });

  await supabase.from("moderation_actions").insert({
    admin_id: admin.id,
    action_type: "reject_membership",
    target_type: "membership_application",
    target_id: applicationId,
    reason,
  });

  revalidatePath("/admin/membership");
}
