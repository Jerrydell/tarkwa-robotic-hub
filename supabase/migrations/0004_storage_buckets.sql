-- =============================================================
-- Storage buckets
-- =============================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('project-media', 'project-media', true),
  ('resources', 'resources', false),
  ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Avatars: any authenticated user can upload/update their own avatar file
create policy "avatar_upload_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatar_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Project media: club members can upload into their own project's folder
create policy "project_media_upload_club_members" on storage.objects
  for insert with check (
    bucket_id = 'project-media' and auth.role() = 'authenticated'
  );
create policy "project_media_public_read" on storage.objects
  for select using (bucket_id = 'project-media');

-- Resources: private bucket, access checked at the application layer
-- against the `resources.visibility` column before generating a signed URL
create policy "resources_admin_upload" on storage.objects
  for insert with check (
    bucket_id = 'resources' and auth.role() = 'authenticated'
  );

-- Gallery: public read, admin-only upload (enforced at app layer via
-- requireRole('super_admin') before calling storage upload)
create policy "gallery_public_read" on storage.objects
  for select using (bucket_id = 'gallery');
create policy "gallery_upload_authenticated" on storage.objects
  for insert with check (
    bucket_id = 'gallery' and auth.role() = 'authenticated'
  );
