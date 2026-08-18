"use client";

import { UpvoteButton } from "./upvote-button";
import { toggleReplyUpvote } from "@/features/community/actions";

export function ReplyUpvoteButton({
  replyId,
  postId,
  count,
  hasUpvoted,
}: {
  replyId: string;
  postId: string;
  count: number;
  hasUpvoted: boolean;
}) {
  return (
    <UpvoteButton
      count={count}
      hasUpvoted={hasUpvoted}
      size="sm"
      onToggle={() => toggleReplyUpvote(replyId, postId)}
    />
  );
}
