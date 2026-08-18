-- =============================================================
-- Phase 5: team chat auto-provisioning, realtime, and
-- notification triggers for replies and messages.
-- =============================================================

-- ---------- Let project owners manage their team roster ----------
-- (0003 only had SELECT/INSERT for project_team_members; this closes the gap
-- so a submitter can remove a teammate they added by mistake before review)
create policy "project_team_members_owner_delete" on project_team_members
  for delete using (
    exists (select 1 from projects p where p.id = project_id and p.submitted_by = auth.uid())
    or is_super_admin()
  );

-- ---------- Enable Realtime on messages (chat) and notifications ----------
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;

-- ---------- Auto-provision a team conversation when someone joins a project team ----------
create or replace function ensure_team_conversation(p_project_id uuid)
returns uuid as $$
declare
  v_conversation_id uuid;
begin
  select id into v_conversation_id
  from conversations
  where project_id = p_project_id and is_team_chat = true;

  if v_conversation_id is null then
    insert into conversations (is_group, is_team_chat, project_id)
    values (true, true, p_project_id)
    returning id into v_conversation_id;
  end if;

  return v_conversation_id;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function handle_team_member_added()
returns trigger as $$
declare
  v_conversation_id uuid;
begin
  v_conversation_id := ensure_team_conversation(new.project_id);

  insert into conversation_participants (conversation_id, user_id)
  values (v_conversation_id, new.user_id)
  on conflict (conversation_id, user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_team_member_added
  after insert on project_team_members
  for each row execute function handle_team_member_added();

-- The project submitter is a team member too — ensures they land in the
-- team chat immediately on submission, before adding anyone else.
create or replace function handle_project_submitted()
returns trigger as $$
begin
  if new.submitted_by is not null then
    insert into project_team_members (project_id, user_id, role_label)
    values (new.id, new.submitted_by, 'Lead')
    on conflict (project_id, user_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_project_submitted
  after insert on projects
  for each row execute function handle_project_submitted();

-- ---------- Notify on new community replies ----------
create or replace function notify_on_new_reply()
returns trigger as $$
declare
  v_post_owner uuid;
  v_post_title text;
begin
  select user_id, title into v_post_owner, v_post_title
  from community_posts where id = new.post_id;

  if v_post_owner is not null and v_post_owner != new.user_id then
    insert into notifications (user_id, type, title, body, link_url)
    values (
      v_post_owner,
      'new_reply',
      'New reply to your question',
      v_post_title,
      '/dashboard/community/' || new.post_id
    );
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_notify_new_reply
  after insert on community_replies
  for each row execute function notify_on_new_reply();

-- ---------- Notify on new chat messages ----------
create or replace function notify_on_new_message()
returns trigger as $$
declare
  recipient record;
begin
  for recipient in
    select user_id from conversation_participants
    where conversation_id = new.conversation_id and user_id != new.sender_id
  loop
    insert into notifications (user_id, type, title, body, link_url)
    values (
      recipient.user_id,
      'new_message',
      'New message',
      left(new.body, 120),
      '/dashboard/chat/' || new.conversation_id
    );
  end loop;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_notify_new_message
  after insert on messages
  for each row execute function notify_on_new_message();
