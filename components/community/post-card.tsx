import Link from "next/link";
import { MessageCircle, Pin, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostUpvoteButton } from "./post-upvote-button";

interface PostCardProps {
  id: string;
  title: string;
  body: string;
  authorName: string;
  upvoteCount: number;
  replyCount: number;
  isPinned: boolean;
  isResolved: boolean;
  hasUpvoted: boolean;
  createdAt: string;
}

export function PostCard(post: PostCardProps) {
  return (
    <Link href={`/dashboard/community/${post.id}`}>
      <Card className="flex items-start gap-4 p-5 transition-colors hover:border-primary/50">
        <PostUpvoteButton
          postId={post.id}
          count={post.upvoteCount}
          hasUpvoted={post.hasUpvoted}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {post.isPinned && (
              <Badge tone="identity">
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            )}
            {post.isResolved && (
              <Badge tone="success">
                <CheckCircle2 className="h-3 w-3" />
                Resolved
              </Badge>
            )}
          </div>
          <h3 className="mt-2 font-semibold leading-snug">{post.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{post.body}</p>
          <div className="mt-3 flex items-center gap-4 font-mono text-xs text-muted">
            <span>{post.authorName}</span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
