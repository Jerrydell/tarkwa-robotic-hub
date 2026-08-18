"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { startConversation } from "@/features/chat/actions";

interface Contact {
  id: string;
  full_name: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  club_member: "Club Member",
  super_admin: "Super Admin",
};

export function NewConversationPicker({ contacts }: { contacts: Contact[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (contacts.length === 0) {
    return (
      <p className="text-sm text-muted">
        You don&apos;t have anyone available to message yet.
      </p>
    );
  }

  function handleSelect(contactId: string) {
    setError(null);
    setPendingId(contactId);
    startTransition(async () => {
      const result = await startConversation(contactId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-danger">{error}</p>}
      {contacts.map((contact) => (
        <button
          key={contact.id}
          disabled={isPending}
          onClick={() => handleSelect(contact.id)}
          className="text-left"
        >
          <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-primary/50">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-muted">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="font-medium">{contact.full_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="muted">{ROLE_LABELS[contact.role] ?? contact.role}</Badge>
              {isPending && pendingId === contact.id && (
                <Loader2 className="h-4 w-4 animate-spin text-muted" />
              )}
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
