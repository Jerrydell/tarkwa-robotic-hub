import { createClient } from "@/lib/supabase/server";

export interface ConversationSummary {
  id: string;
  isGroup: boolean;
  isTeamChat: boolean;
  projectId: string | null;
  title: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

/** Conversations the user participates in, with a display title and last-message preview. */
export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const supabase = await createClient();

  const { data: participantRows } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  const conversationIds = (participantRows ?? []).map((p) => p.conversation_id);
  if (conversationIds.length === 0) return [];

  const [{ data: conversations }, { data: allParticipants }, { data: projects }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("id, is_group, is_team_chat, project_id, created_at")
        .in("id", conversationIds),
      supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", conversationIds),
      supabase.from("projects").select("id, title"),
    ]);

  const otherUserIds = [
    ...new Set(
      (allParticipants ?? [])
        .filter((p) => p.user_id !== userId)
        .map((p) => p.user_id)
    ),
  ];

  const { data: profiles } = otherUserIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", otherUserIds)
    : { data: [] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));
  const projectTitleById = new Map((projects ?? []).map((p) => [p.id, p.title]));

  // Last message per conversation, fetched in one query then grouped in JS.
  const { data: recentMessages } = await supabase
    .from("messages")
    .select("conversation_id, body, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  const lastMessageByConversation = new Map<
    string,
    { body: string; created_at: string }
  >();
  for (const m of recentMessages ?? []) {
    if (!lastMessageByConversation.has(m.conversation_id)) {
      lastMessageByConversation.set(m.conversation_id, m);
    }
  }

  return (conversations ?? [])
    .map((conv) => {
      const others = (allParticipants ?? []).filter(
        (p) => p.conversation_id === conv.id && p.user_id !== userId
      );

      let title: string;
      if (conv.is_team_chat && conv.project_id) {
        title = `${projectTitleById.get(conv.project_id) ?? "Project"} team`;
      } else if (others.length === 1) {
        title = nameById.get(others[0].user_id) || "Member";
      } else {
        title = others.map((o) => nameById.get(o.user_id) || "Member").join(", ");
      }

      const last = lastMessageByConversation.get(conv.id);

      return {
        id: conv.id,
        isGroup: conv.is_group,
        isTeamChat: conv.is_team_chat,
        projectId: conv.project_id,
        title,
        lastMessage: last?.body ?? null,
        lastMessageAt: last?.created_at ?? conv.created_at,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
    );
}

export async function getConversationMessages(conversationId: string) {
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const senderIds = [...new Set((messages ?? []).map((m) => m.sender_id))];
  const { data: profiles } = senderIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", senderIds)
    : { data: [] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (messages ?? []).map((m) => ({
    ...m,
    senderName: nameById.get(m.sender_id) || "Member",
  }));
}

export async function getConversationParticipants(conversationId: string) {
  const supabase = await createClient();

  const { data: participants } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId);

  const userIds = (participants ?? []).map((p) => p.user_id);
  if (userIds.length === 0) return {};

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  return Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]));
}

/** People this user is allowed to start a direct conversation with. */
export async function getMessagingEligibleContacts(userId: string, role: string) {
  const supabase = await createClient();

  const { data: admins } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("role", "super_admin")
    .neq("id", userId);

  if (role !== "club_member" && role !== "super_admin") {
    return admins ?? [];
  }

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("role", "club_member")
    .neq("id", userId);

  return [...(admins ?? []), ...(members ?? [])];
}
