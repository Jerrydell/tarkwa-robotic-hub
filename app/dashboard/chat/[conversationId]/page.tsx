import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/helpers";
import {
  getConversationMessages,
  getConversationParticipants,
} from "@/features/chat/queries";
import { getSetting } from "@/features/admin/settings/queries";
import { MessageThread } from "@/components/chat/message-thread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [messages, participantNames, chatEnabled] = await Promise.all([
    getConversationMessages(conversationId),
    getConversationParticipants(conversationId),
    getSetting("chat_enabled"),
  ]);

  // RLS returns an empty message list for conversations the user isn't
  // part of — but we also need to distinguish "empty conversation" from
  // "not a participant at all" for a clean 404 instead of a blank thread.
  if (Object.keys(participantNames).length === 0) notFound();

  const otherNames = Object.entries(participantNames)
    .filter(([id]) => id !== profile.id)
    .map(([, name]) => name);

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <Link
            href="/dashboard/chat"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Messages
          </Link>
          <h1 className="mt-2 text-lg font-semibold">
            {otherNames.join(", ") || "Conversation"}
          </h1>
        </div>
      </div>

      <MessageThread
        conversationId={conversationId}
        initialMessages={messages}
        currentUserId={profile.id}
        participantNames={participantNames}
        disabled={!chatEnabled}
      />
    </div>
  );
}
