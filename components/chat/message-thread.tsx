"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/features/chat/actions";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface MessageThreadProps {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  participantNames: Record<string, string>;
  disabled?: boolean;
}

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
  participantNames,
  disabled = false,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    startTransition(() => {
      sendMessage(conversationId, body);
    });
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex-1 overflow-y-auto px-1 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((m) => {
            const isSelf = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={cn("flex flex-col", isSelf ? "items-end" : "items-start")}
              >
                {!isSelf && (
                  <span className="mb-1 px-1 font-mono text-xs text-muted">
                    {participantNames[m.sender_id] || "Member"}
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                    isSelf
                      ? "bg-primary text-background"
                      : "border border-border bg-surface text-foreground"
                  )}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 pt-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={disabled ? "Messaging is disabled by an admin" : "Write a message..."}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || isPending || !draft.trim()}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-background transition-opacity disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
