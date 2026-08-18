-- =============================================================
-- Contact messages — public inquiry form submissions.
-- Not part of the original Phase 1 schema (that focused on the core
-- platform entities); added here since the Contact page needs
-- somewhere real to write to.
-- =============================================================

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- Anyone (including anonymous visitors) can submit the contact form
create policy "contact_messages_insert_anyone" on contact_messages
  for insert with check (true);

-- Only Super Admin can read submissions
create policy "contact_messages_select_super_admin" on contact_messages
  for select using (is_super_admin());

create policy "contact_messages_update_super_admin" on contact_messages
  for update using (is_super_admin());
