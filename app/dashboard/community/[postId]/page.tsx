import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pin, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getPostDetail } from "@/features/community/queries";
import { PostUpvoteButton } from "@/components/community/post-upvote-button";
import { ReplyItem } from "@/components/community/reply-item";
import { ReplyForm } from "@/components/community/reply-form";
import { MarkResolvedButton } from "@/components/community/mark-resolved-button";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const data = await getPostDetail(postId, profile.id);
  if (!data) notFound();

  const { post, replies, hasUpvotedPost } = data;
  const isOwner = post.user_id === profile.id;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/dashboard/community"
        className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Community
      </Link>

      <Card className="flex items-start gap-4 p-6">
        <PostUpvoteButton
          postId={post.id}
          count={post.upvote_count}
          hasUpvoted={hasUpvotedPost}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {post.is_pinned && (
              <Badge tone="identity">
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            )}
            {post.is_resolved && (
              <Badge tone="success">
                <CheckCircle2 className="h-3 w-3" />
                Resolved
              </Badge>
            )}
          </div>
          <h1 className="mt-2 text-xl font-semibold leading-snug">{post.title}</h1>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {post.body}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <p className="font-mono text-xs text-muted">{post.authorName}</p>
            {isOwner && !post.is_resolved && <MarkResolvedButton postId={post.id} />}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold">
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              id={reply.id}
              postId={post.id}
              body={reply.body}
              authorName={reply.authorName}
              upvoteCount={reply.upvote_count}
              hasUpvoted={reply.hasUpvoted}
              isAcceptedAnswer={reply.is_accepted_answer}
            />
          ))}
        </div>
      </div>

      <Card className="p-6">
        <p className="mb-3 text-sm font-medium">Add a reply</p>
        <ReplyForm postId={post.id} />
      </Card>
    </div>
  );
}
