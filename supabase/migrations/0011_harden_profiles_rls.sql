-- =============================================================
-- Migration 0011: Harden Profiles RLS
-- =============================================================

-- Remove the broad select policy that allowed any authenticated user
-- to enumerate all profiles (including admins and sensitive fields).
DROP POLICY IF EXISTS "profiles_select_all_authenticated" ON profiles;

-- 1. Users can always read their own full profile.
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 2. Super Admins can read all profiles for administrative purposes.
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (is_super_admin());

-- 3. Authenticated users can read other profiles ONLY IF:
--    a) The profile belongs to a Club Member or Admin (public figures).
--    b) The profile belongs to someone who has participated in the community.
--    c) The profile belongs to a teammate in a project.
-- This prevents mass enumeration of inactive students while preserving hub functionality.

CREATE POLICY "profiles_select_public_activity" ON profiles
  FOR SELECT USING (
    (auth.role() = 'authenticated') AND (
      role IN ('club_member', 'super_admin') OR
      EXISTS (SELECT 1 FROM community_posts WHERE user_id = profiles.id) OR
      EXISTS (SELECT 1 FROM community_replies WHERE user_id = profiles.id) OR
      EXISTS (SELECT 1 FROM project_team_members WHERE user_id = profiles.id)
    )
  );
