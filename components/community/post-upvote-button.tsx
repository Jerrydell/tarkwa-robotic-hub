"use client";

import { UpvoteButton } from "./upvote-button";
import { togglePostUpvote } from "@/features/community/actions";

export function PostUpvoteButton({
  postId,
  count,
  hasUpvoted,
  size,
}: {
  postId: string;
  count: number;
  hasUpvoted: boolean;
  size?: "sm" | "md";
}) {
  return (
    <UpvoteButton
      count={count}
      hasUpvoted={hasUpvoted}
      size={size}
      onToggle={() => togglePostUpvote(postId)}
    />
  );
}
