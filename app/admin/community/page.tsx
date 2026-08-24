import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PinToggleButton } from "@/components/admin/pin-toggle-button";
import { ModerateDeleteButton } from "@/components/admin/moderate-delete-button";
import {
  getAllPostsForModeration,
  getRecentRepliesForModeration,
} from "@/features/admin/community/queries";
import { moderateDeletePost, moderateDeleteReply } from "@/features/admin/community/actions";

export default async function AdminCommunityPage() {
  const [posts, replies] = await Promise.all([
    getAllPostsForModeration(),
    getRecentRepliesForModeration(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Community Moderation"
        description="Pin, unpin, or remove posts and replies."
      />

      <div>
        <h2 className="text-lg font-semibold">Posts</h2>
        {posts.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No posts yet" className="mt-4" description="" />
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {posts.map((post) => (
              <Card key={post.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/community/${post.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-muted">{post.authorName}</p>
                </div>
                {post.is_resolved && <Badge tone="success">Resolved</Badge>}
                <PinToggleButton postId={post.id} isPinned={post.is_pinned} />
                <ModerateDeleteButton action={moderateDeletePost} id={post.id} />
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Recent replies</h2>
        {replies.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No replies yet" className="mt-4" description="" />
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {replies.map((reply) => (
              <Card key={reply.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-foreground/90">{reply.body}</p>
                  <p className="mt-1 text-xs text-muted">
                    {reply.authorName} on{" "}
                    <Link href={`/dashboard/community/${reply.post_id}`} className="hover:text-primary">
                      {reply.postTitle}
                    </Link>
                  </p>
                </div>
                <ModerateDeleteButton
                  action={moderateDeleteReply}
                  id={reply.id}
                  postId={reply.post_id}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
