-- Migration 0012: Fix recursive profile RLS evaluation
-- =============================================================
-- The profiles activity policy queried project_team_members directly.
-- That table's SELECT policy calls is_super_admin(), which reads profiles,
-- causing PostgreSQL to raise infinite recursion during profile lookup.

create or replace function user_has_project_membership(target_user_id uuid)
returns boolean as $$
  select exists (
    select 1
    from public.project_team_members
    where user_id = target_user_id
  );
$$ language sql stable security definer set search_path = public;

revoke all on function user_has_project_membership(uuid) from public;
grant execute on function user_has_project_membership(uuid) to authenticated;

drop policy if exists "profiles_select_public_activity" on public.profiles;

create policy "profiles_select_public_activity" on public.profiles
  for select using (
    (auth.role() = 'authenticated') and (
      role in ('club_member', 'super_admin') or
      exists (select 1 from public.community_posts where user_id = profiles.id) or
      exists (select 1 from public.community_replies where user_id = profiles.id) or
      user_has_project_membership(profiles.id)
    )
  );

comment on function user_has_project_membership(uuid) is
  'Checks project membership for profile visibility without recursively evaluating project_team_members RLS.';

-- Keep the helper non-public and executable only by authenticated users.
revoke all on function user_has_project_membership(uuid) from anon;
revoke all on function user_has_project_membership(uuid) from service_role;
grant execute on function user_has_project_membership(uuid) to authenticated;

select 1;
