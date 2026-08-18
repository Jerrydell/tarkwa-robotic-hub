-- =============================================================
-- Achievement engine
-- Awards badges automatically as students hit criteria, and drops
-- a notification when they do. Matches the criteria_type values
-- already used by the seeded achievements (streak, module_complete,
-- quiz_score, project_submitted).
-- =============================================================

create or replace function award_achievement_if_missing(p_user_id uuid, p_achievement_id uuid)
returns void as $$
declare
  a_title text;
begin
  insert into user_achievements (user_id, achievement_id)
  values (p_user_id, p_achievement_id)
  on conflict (user_id, achievement_id) do nothing;

  if found then
    select title into a_title from achievements where id = p_achievement_id;
    insert into notifications (user_id, type, title, body)
    values (p_user_id, 'badge_earned', 'New badge earned', a_title);
  end if;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------- Streak-based achievements ----------
create or replace function check_streak_achievements()
returns trigger as $$
declare
  ach record;
begin
  for ach in
    select id from achievements
    where criteria_type = 'streak' and criteria_value <= new.current_streak
  loop
    perform award_achievement_if_missing(new.user_id, ach.id);
  end loop;

  return new;
end;
$$ language plpgsql;

create trigger trg_streak_achievements
  after update of current_streak on streaks
  for each row execute function check_streak_achievements();

-- ---------- Lesson-completion-based achievements ----------
create or replace function check_lesson_completion_achievements()
returns trigger as $$
declare
  completed_count int;
  ach record;
begin
  if new.status = 'completed' and (old.status is distinct from 'completed') then
    select count(*) into completed_count
    from lesson_progress
    where user_id = new.user_id and status = 'completed';

    for ach in
      select id from achievements
      where criteria_type = 'module_complete' and criteria_value <= completed_count
    loop
      perform award_achievement_if_missing(new.user_id, ach.id);
    end loop;
  end if;

  return new;
end;
$$ language plpgsql;

-- Runs after the existing streak-update trigger on the same table
create trigger trg_lesson_completion_achievements
  after update or insert on lesson_progress
  for each row execute function check_lesson_completion_achievements();

-- ---------- Quiz-score-based achievements ----------
create or replace function check_quiz_score_achievements()
returns trigger as $$
declare
  ach record;
begin
  if new.passed then
    for ach in
      select id from achievements
      where criteria_type = 'quiz_score' and criteria_value <= new.score
    loop
      perform award_achievement_if_missing(new.user_id, ach.id);
    end loop;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_quiz_score_achievements
  after insert on quiz_attempts
  for each row execute function check_quiz_score_achievements();

-- ---------- Project-submission-based achievements ----------
-- Inert until Phase 5 ships project submission, but correct and ready.
create or replace function check_project_submission_achievements()
returns trigger as $$
declare
  submitted_count int;
  ach record;
begin
  if new.submitted_by is not null then
    select count(*) into submitted_count
    from projects
    where submitted_by = new.submitted_by;

    for ach in
      select id from achievements
      where criteria_type = 'project_submitted' and criteria_value <= submitted_count
    loop
      perform award_achievement_if_missing(new.submitted_by, ach.id);
    end loop;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_project_submission_achievements
  after insert on projects
  for each row execute function check_project_submission_achievements();
