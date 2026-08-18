-- =============================================================
-- Functions & Triggers
-- =============================================================

-- ---------- updated_at auto-touch ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_modules_updated_at before update on modules
  for each row execute function set_updated_at();
create trigger trg_lessons_updated_at before update on lessons
  for each row execute function set_updated_at();
create trigger trg_projects_updated_at before update on projects
  for each row execute function set_updated_at();
create trigger trg_community_posts_updated_at before update on community_posts
  for each row execute function set_updated_at();

-- ---------- Auto-create profile row on signup ----------
-- Fires on auth.users insert (Supabase-managed table) so every
-- authenticated user gets a profiles row with default role='student'.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));

  insert into public.streaks (user_id, current_streak, longest_streak)
  values (new.id, 0, 0);

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- Streak update on lesson completion ----------
create or replace function update_streak_on_completion()
returns trigger as $$
declare
  last_date date;
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') then
    select last_active_date into last_date from streaks where user_id = new.user_id;

    if last_date is null then
      update streaks
        set current_streak = 1, longest_streak = greatest(longest_streak, 1),
            last_active_date = current_date
        where user_id = new.user_id;
    elsif last_date = current_date then
      -- already logged activity today, no change to streak count
      null;
    elsif last_date = current_date - interval '1 day' then
      update streaks
        set current_streak = current_streak + 1,
            longest_streak = greatest(longest_streak, current_streak + 1),
            last_active_date = current_date
        where user_id = new.user_id;
    else
      -- streak broken, restart at 1
      update streaks
        set current_streak = 1,
            longest_streak = greatest(longest_streak, 1),
            last_active_date = current_date
        where user_id = new.user_id;
    end if;

    new.completed_at = now();
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_lesson_progress_streak
  before update or insert on lesson_progress
  for each row execute function update_streak_on_completion();

-- ---------- Upvote count sync ----------
create or replace function sync_upvote_count()
returns trigger as $$
declare
  delta int;
  affected_id uuid;
  affected_type vote_target_type;
begin
  if tg_op = 'INSERT' then
    delta := 1;
    affected_id := new.target_id;
    affected_type := new.target_type;
  else
    delta := -1;
    affected_id := old.target_id;
    affected_type := old.target_type;
  end if;

  if affected_type = 'post' then
    update community_posts set upvote_count = upvote_count + delta where id = affected_id;
  else
    update community_replies set upvote_count = upvote_count + delta where id = affected_id;
  end if;

  return null;
end;
$$ language plpgsql;

create trigger trg_upvote_insert
  after insert on community_upvotes
  for each row execute function sync_upvote_count();

create trigger trg_upvote_delete
  after delete on community_upvotes
  for each row execute function sync_upvote_count();

-- ---------- Messaging eligibility check ----------
-- Used by RLS on conversation creation. Encodes the locked-in policy:
--  - anyone -> super_admin: allowed
--  - club_member <-> club_member: allowed
--  - student <-> student (non-members): NOT allowed
create or replace function can_message(user_a uuid, user_b uuid)
returns boolean as $$
declare
  role_a user_role;
  role_b user_role;
begin
  select role into role_a from profiles where id = user_a;
  select role into role_b from profiles where id = user_b;

  if role_a = 'super_admin' or role_b = 'super_admin' then
    return true;
  end if;

  if role_a = 'club_member' and role_b = 'club_member' then
    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer set search_path = public;
