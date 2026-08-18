"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";

export async function togglePinPost(postId: string, isPinned: boolean) {
  await requireRole("super_admin");
  const supabase = await createClient();
  await supabase.from("community_posts").update({ is_pinned: !isPinned }).eq("id", postId);
  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
}

export async function moderateDeletePost(postId: string, reason: string) {
  const admin = await requireRole("super_admin");
  const supabase = await createClient();

  await supabase.from("community_posts").delete().eq("id", postId);

  await supabase.from("moderation_actions").insert({
    admin_id: admin.id,
    action_type: "remove_post",
    target_type: "community_post",
    target_id: postId,
    reason,
  });

  revalidatePath("/admin/community");
  revalidatePath("/dashboard/community");
}

export async function moderateDeleteReply(replyId: string, postId: string, reason: string) {
  const admin = await requireRole("super_admin");
  const supabase = await createClient();

  await supabase.from("community_replies").delete().eq("id", replyId);

  await supabase.from("moderation_actions").insert({
    admin_id: admin.id,
    action_type: "remove_reply",
    target_type: "community_reply",
    target_id: replyId,
    reason,
  });

  revalidatePath("/admin/community");
  revalidatePath(`/dashboard/community/${postId}`);
}
