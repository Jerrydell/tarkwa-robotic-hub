import Link from "next/link";
import { Users, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ConversationSummary } from "@/features/chat/queries";

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function ConversationListItem({ conversation }: { conversation: ConversationSummary }) {
  return (
    <Link href={`/dashboard/chat/${conversation.id}`}>
      <Card className="flex items-center gap-3 p-4 transition-colors hover:border-primary/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-muted">
          {conversation.isTeamChat ? (
            <Users className="h-4 w-4" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{conversation.title}</p>
          <p className="truncate text-sm text-muted">
            {conversation.lastMessage ?? "No messages yet"}
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted">
          {timeAgo(conversation.lastMessageAt)}
        </span>
      </Card>
    </Link>
  );
}
