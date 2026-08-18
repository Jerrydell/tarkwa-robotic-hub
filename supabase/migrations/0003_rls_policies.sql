-- =============================================================
-- Row Level Security
-- This is the real enforcement layer (see Phase 1 doc, Section 5).
-- Middleware and Server Action checks are UX conveniences on top of this.
-- =============================================================

-- ---------- Helper functions ----------
create or replace function current_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function is_club_member_or_above()
returns boolean as $$
  select current_role() in ('club_member', 'super_admin');
$$ language sql stable;

create or replace function is_super_admin()
returns boolean as $$
  select current_role() = 'super_admin';
$$ language sql stable;

-- ---------- Enable RLS everywhere ----------
alter table profiles enable row level security;
alter table membership_applications enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table quizzes enable row level security;
alter table quiz_attempts enable row level security;
alter table lesson_progress enable row level security;
alter table streaks enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;
alter table projects enable row level security;
alter table project_team_members enable row level security;
alter table project_images enable row level security;
alter table project_comments enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table resources enable row level security;
alter table community_posts enable row level security;
alter table community_replies enable row level security;
alter table community_upvotes enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table announcements enable row level security;
alter table gallery_items enable row level security;
alter table moderation_actions enable row level security;

-- ---------- PROFILES ----------
create policy "profiles_select_all_authenticated" on profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_update_own_non_role_fields" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles where id = auth.uid()));

create policy "profiles_super_admin_full_access" on profiles
  for all using (is_super_admin());

-- ---------- MEMBERSHIP APPLICATIONS ----------
create policy "membership_own_select" on membership_applications
  for select using (user_id = auth.uid() or is_super_admin());

create policy "membership_own_insert" on membership_applications
  for insert with check (user_id = auth.uid());

create policy "membership_admin_update" on membership_applications
  for update using (is_super_admin());

-- ---------- MODULES / LESSONS / QUIZZES (published content is student-readable) ----------
create policy "modules_select_published" on modules
  for select using (is_published = true or is_super_admin());
create policy "modules_admin_write" on modules
  for all using (is_super_admin());

create policy "lessons_select_published" on lessons
  for select using (is_published = true or is_super_admin());
create policy "lessons_admin_write" on lessons
  for all using (is_super_admin());

create policy "quizzes_select_authenticated" on quizzes
  for select using (auth.role() = 'authenticated');
create policy "quizzes_admin_write" on quizzes
  for all using (is_super_admin());

-- ---------- QUIZ ATTEMPTS / PROGRESS / STREAKS (own data only) ----------
create policy "quiz_attempts_own" on quiz_attempts
  for select using (user_id = auth.uid() or is_super_admin());
create policy "quiz_attempts_insert_own" on quiz_attempts
  for insert with check (user_id = auth.uid());

create policy "lesson_progress_own" on lesson_progress
  for select using (user_id = auth.uid() or is_super_admin());
create policy "lesson_progress_upsert_own" on lesson_progress
  for insert with check (user_id = auth.uid());
create policy "lesson_progress_update_own" on lesson_progress
  for update using (user_id = auth.uid());

create policy "streaks_own_select" on streaks
  for select using (user_id = auth.uid() or is_super_admin());

-- ---------- ACHIEVEMENTS ----------
create policy "achievements_select_all" on achievements
  for select using (auth.role() = 'authenticated');
create policy "achievements_admin_write" on achievements
  for all using (is_super_admin());

create policy "user_achievements_own_select" on user_achievements
  for select using (user_id = auth.uid() or is_super_admin());

-- ---------- PROJECTS ----------
create policy "projects_select_approved_or_own" on projects
  for select using (
    status = 'approved'
    or submitted_by = auth.uid()
    or is_super_admin()
    or exists (
      select 1 from project_team_members ptm
      where ptm.project_id = projects.id and ptm.user_id = auth.uid()
    )
  );

create policy "projects_insert_club_members" on projects
  for insert with check (is_club_member_or_above() and submitted_by = auth.uid());

create policy "projects_update_own_draft_or_admin" on projects
  for update using (
    (submitted_by = auth.uid() and status in ('draft', 'pending_review'))
    or is_super_admin()
  );

create policy "project_team_members_select" on project_team_members
  for select using (
    user_id = auth.uid()
    or is_super_admin()
    or exists (select 1 from projects p where p.id = project_id and p.status = 'approved')
  );

create policy "project_team_members_admin_or_owner_write" on project_team_members
  for insert with check (
    is_club_member_or_above()
    and exists (select 1 from projects p where p.id = project_id and p.submitted_by = auth.uid())
  );

create policy "project_images_select" on project_images
  for select using (
    exists (
      select 1 from projects p where p.id = project_id
      and (p.status = 'approved' or p.submitted_by = auth.uid() or is_super_admin())
    )
  );

create policy "project_comments_select_authenticated" on project_comments
  for select using (auth.role() = 'authenticated');
create policy "project_comments_insert_own" on project_comments
  for insert with check (user_id = auth.uid());

-- ---------- EVENTS ----------
create policy "events_select_public_or_member" on events
  for select using (is_internal = false or is_club_member_or_above());
create policy "events_admin_write" on events
  for all using (is_super_admin());

create policy "event_registrations_own" on event_registrations
  for select using (user_id = auth.uid() or is_super_admin());
create policy "event_registrations_insert_own" on event_registrations
  for insert with check (user_id = auth.uid());

-- ---------- RESOURCES ----------
create policy "resources_select_by_visibility" on resources
  for select using (
    visibility = 'public'
    or (visibility = 'student' and auth.role() = 'authenticated')
    or (visibility = 'club_member' and is_club_member_or_above())
    or is_super_admin()
  );
create policy "resources_admin_write" on resources
  for all using (is_super_admin());

-- ---------- COMMUNITY ----------
create policy "community_posts_select_all" on community_posts
  for select using (true);
create policy "community_posts_insert_own" on community_posts
  for insert with check (user_id = auth.uid());
create policy "community_posts_update_own_or_admin" on community_posts
  for update using (user_id = auth.uid() or is_super_admin());
create policy "community_posts_delete_own_or_admin" on community_posts
  for delete using (user_id = auth.uid() or is_super_admin());

create policy "community_replies_select_all" on community_replies
  for select using (true);
create policy "community_replies_insert_own" on community_replies
  for insert with check (user_id = auth.uid());
create policy "community_replies_update_own_or_admin" on community_replies
  for update using (user_id = auth.uid() or is_super_admin());

create policy "community_upvotes_select_own" on community_upvotes
  for select using (user_id = auth.uid());
create policy "community_upvotes_insert_own" on community_upvotes
  for insert with check (user_id = auth.uid());
create policy "community_upvotes_delete_own" on community_upvotes
  for delete using (user_id = auth.uid());

-- ---------- MESSAGING (restricted per locked-in policy) ----------
create policy "conversations_select_participant" on conversations
  for select using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = id and cp.user_id = auth.uid()
    )
    or is_super_admin()
  );

-- Conversation creation itself is handled via a Server Action that
-- validates can_message() for every participant pair before inserting,
-- since RLS can't easily validate "all pairs" at insert time for group chats.
create policy "conversations_insert_authenticated" on conversations
  for insert with check (auth.role() = 'authenticated');

create policy "conversation_participants_select_own" on conversation_participants
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from conversation_participants cp2
      where cp2.conversation_id = conversation_id and cp2.user_id = auth.uid()
    )
  );

create policy "conversation_participants_insert_checked" on conversation_participants
  for insert with check (
    -- Self-add is fine only when the inviter is already a participant
    -- and messaging eligibility holds; real gate lives in the Server Action.
    auth.role() = 'authenticated'
  );

create policy "messages_select_participant" on messages
  for select using (
    exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );

create policy "messages_insert_participant" on messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversation_participants cp
      where cp.conversation_id = conversation_id and cp.user_id = auth.uid()
    )
  );

-- ---------- NOTIFICATIONS ----------
create policy "notifications_own_select" on notifications
  for select using (user_id = auth.uid());
create policy "notifications_own_update" on notifications
  for update using (user_id = auth.uid());

-- ---------- ANNOUNCEMENTS / GALLERY ----------
create policy "announcements_select_by_visibility" on announcements
  for select using (
    visibility = 'public'
    or (visibility = 'student' and auth.role() = 'authenticated')
    or (visibility = 'club_member' and is_club_member_or_above())
    or is_super_admin()
  );
create policy "announcements_admin_write" on announcements
  for all using (is_super_admin());

create policy "gallery_select_all" on gallery_items
  for select using (true);
create policy "gallery_admin_write" on gallery_items
  for all using (is_super_admin());

-- ---------- MODERATION ----------
create policy "moderation_admin_only" on moderation_actions
  for all using (is_super_admin());
