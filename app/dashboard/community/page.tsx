import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getCommunityPosts } from "@/features/community/queries";
import { PostCard } from "@/components/community/post-card";

export default async function CommunityPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const posts = await getCommunityPosts(profile.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Community</h1>
          <p className="mt-1 text-sm text-muted">
            Ask questions, help others, and upvote good answers.
          </p>
        </div>
        <Link href="/dashboard/community/new">
          <Button>
            <Plus className="h-4 w-4" />
            Ask a question
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No discussions yet"
          description="Be the first to ask a question and get the community started."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              body={post.body}
              authorName={post.authorName}
              upvoteCount={post.upvote_count}
              replyCount={post.replyCount}
              isPinned={post.is_pinned}
              isResolved={post.is_resolved}
              hasUpvoted={post.hasUpvoted}
              createdAt={post.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
