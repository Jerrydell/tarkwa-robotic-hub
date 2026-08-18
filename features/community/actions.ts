"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";
import { communityPostSchema, communityReplySchema } from "@/lib/validation/schemas";

export interface CommunityFormState {
  success: boolean;
  error?: string;
}

export async function createPost(
  _prevState: CommunityFormState,
  formData: FormData
): Promise<CommunityFormState> {
  const profile = await requireRole("student");

  const parsed = communityPostSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_posts")
    .insert({ user_id: profile.id, title: parsed.data.title, body: parsed.data.body })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath("/dashboard/community");
  redirect(`/dashboard/community/${data.id}`);
}

export async function createReply(
  postId: string,
  _prevState: CommunityFormState,
  formData: FormData
): Promise<CommunityFormState> {
  const profile = await requireRole("student");

  const parsed = communityReplySchema.safeParse({ body: formData.get("body") });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("community_replies")
    .insert({ post_id: postId, user_id: profile.id, body: parsed.data.body });

  if (error) {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/dashboard/community/${postId}`);
  return { success: true };
}

export async function togglePostUpvote(postId: string) {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("community_upvotes")
    .select("id")
    .eq("user_id", profile.id)
    .eq("target_type", "post")
    .eq("target_id", postId)
    .maybeSingle();

  if (existing) {
    await supabase.from("community_upvotes").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("community_upvotes")
      .insert({ user_id: profile.id, target_type: "post", target_id: postId });
  }

  revalidatePath("/dashboard/community");
  revalidatePath(`/dashboard/community/${postId}`);
}

export async function toggleReplyUpvote(replyId: string, postId: string) {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("community_upvotes")
    .select("id")
    .eq("user_id", profile.id)
    .eq("target_type", "reply")
    .eq("target_id", replyId)
    .maybeSingle();

  if (existing) {
    await supabase.from("community_upvotes").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("community_upvotes")
      .insert({ user_id: profile.id, target_type: "reply", target_id: replyId });
  }

  revalidatePath(`/dashboard/community/${postId}`);
}

export async function markPostResolved(postId: string) {
  const profile = await requireRole("student");
  const supabase = await createClient();

  // RLS also enforces this, but check here too for a clean error path
  const { data: post } = await supabase
    .from("community_posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (post?.user_id !== profile.id) return;

  await supabase.from("community_posts").update({ is_resolved: true }).eq("id", postId);
  revalidatePath(`/dashboard/community/${postId}`);
}
