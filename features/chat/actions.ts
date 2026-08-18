"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";
import { getSetting } from "@/features/admin/settings/queries";

export interface StartConversationResult {
  error?: string;
}

/**
 * Finds an existing 1:1 conversation with the given recipient, or creates
 * one — but only after confirming eligibility via the can_message()
 * Postgres function (see migration 0002). This is the real enforcement
 * point for the restricted-messaging policy; RLS on conversations/
 * conversation_participants is permissive by design (see 0003) and
 * defers to this check.
 */
export async function startConversation(recipientId: string): Promise<StartConversationResult> {
  const profile = await requireRole("student");

  if (!(await getSetting("chat_enabled"))) {
    return { error: "Messaging is currently disabled by an admin." };
  }

  if (recipientId === profile.id) {
    return { error: "You can't message yourself." };
  }

  const supabase = await createClient();

  const { data: eligible } = await supabase.rpc("can_message", {
    user_a: profile.id,
    user_b: recipientId,
  });

  if (!eligible) {
    return { error: "You're not able to message this person." };
  }

  // Look for an existing 1:1 (non-group, non-team) conversation between
  // exactly these two people.
  const { data: myConversations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", profile.id);

  const { data: theirConversations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", recipientId);

  const shared = (myConversations ?? [])
    .map((c) => c.conversation_id)
    .filter((id) => (theirConversations ?? []).some((t) => t.conversation_id === id));

  if (shared.length > 0) {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .in("id", shared)
      .eq("is_group", false)
      .eq("is_team_chat", false)
      .limit(1)
      .maybeSingle();

    if (existing) {
      redirect(`/dashboard/chat/${existing.id}`);
    }
  }

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ is_group: false, is_team_chat: false })
    .select("id")
    .single();

  if (error || !conversation) {
    return { error: "Something went wrong starting the conversation." };
  }

  await supabase.from("conversation_participants").insert([
    { conversation_id: conversation.id, user_id: profile.id },
    { conversation_id: conversation.id, user_id: recipientId },
  ]);

  redirect(`/dashboard/chat/${conversation.id}`);
}

export async function sendMessage(conversationId: string, body: string) {
  const profile = await requireRole("student");
  if (!body.trim()) return;

  if (!(await getSetting("chat_enabled"))) return;

  const supabase = await createClient();
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: profile.id,
    body: body.trim(),
  });

  revalidatePath(`/dashboard/chat/${conversationId}`);
  revalidatePath("/dashboard/chat");
}
