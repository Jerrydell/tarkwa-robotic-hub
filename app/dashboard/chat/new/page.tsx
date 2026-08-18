import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getMessagingEligibleContacts } from "@/features/chat/queries";
import { getSetting } from "@/features/admin/settings/queries";
import { NewConversationPicker } from "@/components/chat/new-conversation-picker";

export default async function NewConversationPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const chatEnabled = await getSetting("chat_enabled");

  if (!chatEnabled) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link
          href="/dashboard/chat"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Messages
        </Link>
        <Card className="flex items-center gap-3 border-warning/40 bg-warning/5 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <p className="text-sm">Messaging is temporarily disabled by an admin.</p>
        </Card>
      </div>
    );
  }

  const contacts = await getMessagingEligibleContacts(profile.id, profile.role);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/chat"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Messages
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">New message</h1>
        <p className="mt-1 text-sm text-muted">
          {profile.role === "student"
            ? "As a Student, you can message Super Admins."
            : "Message a Super Admin or another Club Member."}
        </p>
      </div>
      <NewConversationPicker contacts={contacts} />
    </div>
  );
}
