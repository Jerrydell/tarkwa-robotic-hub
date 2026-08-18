import { createClient } from "@/lib/supabase/server";

export async function getAllPostsForModeration() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("community_posts")
    .select("id, title, is_pinned, is_resolved, upvote_count, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!posts || posts.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", [...new Set(posts.map((p) => p.user_id))]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return posts.map((p) => ({ ...p, authorName: nameById.get(p.user_id) || "Student" }));
}

export async function getRecentRepliesForModeration() {
  const supabase = await createClient();

  const { data: replies } = await supabase
    .from("community_replies")
    .select("id, body, post_id, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!replies || replies.length === 0) return [];

  const [{ data: profiles }, { data: posts }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", [...new Set(replies.map((r) => r.user_id))]),
    supabase.from("community_posts").select("id, title").in("id", [...new Set(replies.map((r) => r.post_id))]),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const postTitleById = new Map((posts ?? []).map((p) => [p.id, p.title]));

  return replies.map((r) => ({
    ...r,
    authorName: nameById.get(r.user_id) || "Student",
    postTitle: postTitleById.get(r.post_id) || "Untitled post",
  }));
}
