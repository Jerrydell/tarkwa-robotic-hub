"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getRequiredUuid(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string" || !UUID_PATTERN.test(value.trim())) {
    throw new Error(`${name} must be a valid UUID.`);
  }
  return value.trim();
}

function getModerationReason(formData: FormData): string {
  const value = formData.get("reason");
  if (typeof value !== "string") {
    throw new Error("A moderation reason is required.");
  }
  const reason = value.trim();
  if (!reason) {
    throw new Error("A moderation reason is required.");
  }
  if (reason.length > 500) {
    throw new Error("The moderation reason is too long.");
  }
  return reason;
}

export async function togglePinPost(postId: string, isPinned: boolean) {
  await requireRole("super_admin");
  const supabase = await createClient();
  await supabase.from("community_posts").update({ is_pinned: !isPinned }).eq("id", postId);
  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
}

export async function moderateDeletePost(formData: FormData) {
  const admin = await requireRole("super_admin");
  const postId = getRequiredUuid(formData, "id");
  const reason = getModerationReason(formData);
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);
  if (deleteError) throw new Error("Could not remove the post.");

  const { error: logError } = await supabase.from("moderation_actions").insert({
    admin_id: admin.id,
    action_type: "remove_post",
    target_type: "community_post",
    target_id: postId,
    reason,
  });
  if (logError) throw new Error("Could not record the moderation action.");

  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
}

export async function moderateDeleteReply(formData: FormData) {
  const admin = await requireRole("super_admin");
  const replyId = getRequiredUuid(formData, "id");
  const postId = getRequiredUuid(formData, "postId");
  const reason = getModerationReason(formData);
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("community_replies")
    .delete()
    .eq("id", replyId);
  if (deleteError) throw new Error("Could not remove the reply.");

  const { error: logError } = await supabase.from("moderation_actions").insert({
    admin_id: admin.id,
    action_type: "remove_reply",
    target_type: "community_reply",
    target_id: replyId,
    reason,
  });
  if (logError) throw new Error("Could not record the moderation action.");

  revalidatePath("/admin/community");
  revalidatePath(`/dashboard/community/${postId}`);
}
