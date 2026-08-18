-- =============================================================
-- Tarkwa Senior High Robotic Hub — Initial Schema
-- Roles: student -> club_member -> super_admin (no exec tier)
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
create type user_role as enum ('student', 'club_member', 'super_admin');
create type application_status as enum ('pending', 'approved', 'rejected');
create type module_level as enum ('beginner', 'intermediate', 'advanced');
create type progress_status as enum ('not_started', 'in_progress', 'completed');
create type achievement_criteria as enum ('streak', 'module_complete', 'quiz_score', 'project_submitted', 'custom');
create type project_status as enum ('draft', 'pending_review', 'approved', 'rejected');
create type event_type as enum ('workshop', 'meeting', 'competition', 'public');
create type registration_status as enum ('registered', 'cancelled', 'attended');
create type resource_type as enum ('pdf', 'code', 'diagram', 'image', 'ebook', 'link');
create type visibility_level as enum ('public', 'student', 'club_member');
create type notification_type as enum (
  'membership_status', 'project_status', 'new_reply',
  'new_message', 'badge_earned', 'announcement', 'event_reminder'
);
create type moderation_action_type as enum (
  'remove_post', 'remove_reply', 'reject_project', 'reject_membership', 'ban_user'
);
create type vote_target_type as enum ('post', 'reply');

-- ---------- PROFILES ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  bio text,
  role user_role not null default 'student',
  year_group text,
  class_track text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- MEMBERSHIP ----------
create table membership_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  status application_status not null default 'pending',
  motivation_text text not null,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- LEARNING SYSTEM ----------
create table modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  level module_level not null default 'beginner',
  order_index int not null default 0,
  cover_image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  slug text not null,
  order_index int not null default 0,
  objectives text[] not null default '{}',
  materials text[] not null default '{}',
  content_body jsonb not null default '[]',
  code_snippets jsonb not null default '[]',
  estimated_minutes int,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade,
  title text not null,
  passing_score int not null default 70,
  questions jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  score int not null,
  passed boolean not null,
  answers jsonb not null default '[]',
  attempted_at timestamptz not null default now()
);

create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  status progress_status not null default 'not_started',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table streaks (
  user_id uuid primary key references profiles(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  icon_url text,
  criteria_type achievement_criteria not null,
  criteria_value int
);

create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

-- ---------- PROJECTS ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover_image_url text,
  summary text,
  problem_statement text,
  materials text[] not null default '{}',
  circuit_diagram_url text,
  code_repo_url text,
  demo_video_url text,
  build_steps jsonb not null default '[]',
  status project_status not null default 'draft',
  submitted_by uuid references profiles(id),
  reviewed_by uuid references profiles(id),
  is_club_project boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_team_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role_label text,
  unique (project_id, user_id)
);

create table project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  image_url text not null,
  caption text,
  order_index int not null default 0
);

create table project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------- EVENTS ----------
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  event_type event_type not null default 'public',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  cover_image_url text,
  is_internal boolean not null default false,
  registration_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  registered_at timestamptz not null default now(),
  status registration_status not null default 'registered',
  unique (event_id, user_id)
);

-- ---------- RESOURCES ----------
create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text not null,
  resource_type resource_type not null,
  visibility visibility_level not null default 'student',
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- COMMUNITY ----------
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  is_pinned boolean not null default false,
  is_resolved boolean not null default false,
  upvote_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  is_accepted_answer boolean not null default false,
  upvote_count int not null default 0,
  created_at timestamptz not null default now()
);

create table community_upvotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  target_type vote_target_type not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

-- ---------- MESSAGING ----------
create table conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean not null default false,
  is_team_chat boolean not null default false,
  project_id uuid references projects(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------- NOTIFICATIONS / ANNOUNCEMENTS / GALLERY ----------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  visibility visibility_level not null default 'public',
  published_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  category text,
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------- MODERATION AUDIT TRAIL ----------
create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id),
  action_type moderation_action_type not null,
  target_type text not null,
  target_id uuid not null,
  reason text,
  created_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index idx_lessons_module on lessons(module_id);
create index idx_lesson_progress_user on lesson_progress(user_id);
create index idx_quiz_attempts_user on quiz_attempts(user_id);
create index idx_projects_status on projects(status);
create index idx_project_team_members_project on project_team_members(project_id);
create index idx_community_replies_post on community_replies(post_id);
create index idx_messages_conversation on messages(conversation_id);
create index idx_notifications_user_unread on notifications(user_id, is_read);
create index idx_membership_applications_status on membership_applications(status);
