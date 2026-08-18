import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReplyUpvoteButton } from "./reply-upvote-button";

interface ReplyItemProps {
  id: string;
  postId: string;
  body: string;
  authorName: string;
  upvoteCount: number;
  hasUpvoted: boolean;
  isAcceptedAnswer: boolean;
}

export function ReplyItem(reply: ReplyItemProps) {
  return (
    <Card
      className={
        reply.isAcceptedAnswer
          ? "flex items-start gap-4 border-success/30 bg-success/5 p-5"
          : "flex items-start gap-4 p-5"
      }
    >
      <ReplyUpvoteButton
        replyId={reply.id}
        postId={reply.postId}
        count={reply.upvoteCount}
        hasUpvoted={reply.hasUpvoted}
      />
      <div className="min-w-0 flex-1">
        {reply.isAcceptedAnswer && (
          <Badge tone="success" className="mb-2">
            <CheckCircle2 className="h-3 w-3" />
            Accepted answer
          </Badge>
        )}
        <p className="text-sm leading-relaxed text-foreground/90">{reply.body}</p>
        <p className="mt-2 font-mono text-xs text-muted">{reply.authorName}</p>
      </div>
    </Card>
  );
}
