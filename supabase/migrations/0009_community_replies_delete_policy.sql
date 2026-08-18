-- =============================================================
-- Phase 6 fix: community_replies was missing a DELETE policy
-- (0003 only had SELECT/INSERT/UPDATE), so admin reply moderation
-- had nothing to authorize against.
-- =============================================================

create policy "community_replies_delete_own_or_admin" on community_replies
  for delete using (user_id = auth.uid() or is_super_admin());
