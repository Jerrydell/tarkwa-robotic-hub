import { createClient } from "@/lib/supabase/server";

export async function getCommunityPosts(userId: string) {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("community_posts")
    .select("id, title, body, is_pinned, is_resolved, upvote_count, created_at, user_id")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (!posts || posts.length === 0) return [];

  const [authorsResult, replyCountsResult, myUpvotesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", [...new Set(posts.map((p) => p.user_id))]),
    supabase
      .from("community_replies")
      .select("post_id")
      .in(
        "post_id",
        posts.map((p) => p.id)
      ),
    supabase
      .from("community_upvotes")
      .select("target_id")
      .eq("user_id", userId)
      .eq("target_type", "post"),
  ]);

  const authorNameById = new Map(
    (authorsResult.data ?? []).map((a) => [a.id, a.full_name])
  );
  const replyCountByPostId = new Map<string, number>();
  for (const r of replyCountsResult.data ?? []) {
    replyCountByPostId.set(r.post_id, (replyCountByPostId.get(r.post_id) ?? 0) + 1);
  }
  const myUpvotedPostIds = new Set((myUpvotesResult.data ?? []).map((u) => u.target_id));

  return posts.map((post) => ({
    ...post,
    authorName: authorNameById.get(post.user_id) || "Student",
    replyCount: replyCountByPostId.get(post.id) ?? 0,
    hasUpvoted: myUpvotedPostIds.has(post.id),
  }));
}

export async function getPostDetail(postId: string, userId: string) {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("community_posts")
    .select("id, title, body, is_pinned, is_resolved, upvote_count, created_at, user_id")
    .eq("id", postId)
    .single();

  if (!post) return null;

  const { data: replies } = await supabase
    .from("community_replies")
    .select("id, body, is_accepted_answer, upvote_count, created_at, user_id")
    .eq("post_id", postId)
    .order("is_accepted_answer", { ascending: false })
    .order("created_at", { ascending: true });

  const userIds = [...new Set([post.user_id, ...(replies ?? []).map((r) => r.user_id)])];

  const [authorsResult, myPostUpvote, myReplyUpvotes] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", userIds),
    supabase
      .from("community_upvotes")
      .select("id")
      .eq("user_id", userId)
      .eq("target_type", "post")
      .eq("target_id", postId)
      .maybeSingle(),
    supabase
      .from("community_upvotes")
      .select("target_id")
      .eq("user_id", userId)
      .eq("target_type", "reply"),
  ]);

  const authorNameById = new Map(
    (authorsResult.data ?? []).map((a) => [a.id, a.full_name])
  );
  const myUpvotedReplyIds = new Set((myReplyUpvotes.data ?? []).map((u) => u.target_id));

  return {
    post: { ...post, authorName: authorNameById.get(post.user_id) || "Student" },
    hasUpvotedPost: !!myPostUpvote.data,
    replies: (replies ?? []).map((reply) => ({
      ...reply,
      authorName: authorNameById.get(reply.user_id) || "Student",
      hasUpvoted: myUpvotedReplyIds.has(reply.id),
    })),
  };
}
