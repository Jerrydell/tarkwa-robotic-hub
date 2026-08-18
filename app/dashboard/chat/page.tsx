import Link from "next/link";
import { MessageCircle, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getConversations } from "@/features/chat/queries";
import { getSetting } from "@/features/admin/settings/queries";
import { ConversationListItem } from "@/components/chat/conversation-list-item";

export default async function ChatInboxPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [conversations, chatEnabled] = await Promise.all([
    getConversations(profile.id),
    getSetting("chat_enabled"),
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {!chatEnabled && (
        <Card className="flex items-center gap-3 border-warning/40 bg-warning/5 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm">
            Messaging is temporarily disabled by an admin. You can still read
            past conversations.
          </p>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Messages</h1>
          <p className="mt-1 text-sm text-muted">
            Message Super Admins anytime, or other Club Members once you&apos;re verified.
          </p>
        </div>
        {chatEnabled && (
          <Link href="/dashboard/chat/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </Link>
        )}
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          description="Start a conversation with a Super Admin, or a fellow Club Member."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conv) => (
            <ConversationListItem key={conv.id} conversation={conv} />
          ))}
        </div>
      )}
    </div>
  );
}
