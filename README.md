# Tarkwa Senior High Robotic Hub — Full Platform (Phases 2–6)

All six phases are complete: foundation, public experience, auth +
student experience, community/chat/club features, and the full Super
Admin system — membership and project approval, user management,
learning content management with AI-assisted drafting, events/resources/
announcements/gallery CRUD, community moderation, and site-wide settings.

Verified against a real build: `npm install`, `npx tsc --noEmit`,
`npm run build` (61 routes), and `npx next lint` all pass clean.

---

## What's in here

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind, with the color/type/
  animation tokens from the Phase 1 architecture doc
- Supabase auth wired end-to-end: browser client, server client, session
  middleware, and role-based route guards for `/dashboard` and `/admin`
- Full database schema as SQL migrations — 28 tables, all enums,
  triggers (auto-profile-creation, streaks, upvote counts, achievements,
  team-chat auto-provisioning, reply/message notifications), and RLS
  policies enforcing the Student → Club Member → Super Admin model
- Storage bucket setup (avatars, project media, resources, gallery)
- A seed script with realistic placeholder learning/event/gallery content
- Zod validation schemas for every form
- The full public site, student dashboard, club features, and admin
  system — see the phase-by-phase reference below

---

## Setup

### 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Once provisioned, go to **Project Settings → API** and copy the
   **Project URL** and **anon public key**

By default, Supabase requires email confirmation before a new account
can log in. For faster local testing, turn this off under
**Authentication → Providers → Email → Confirm email** — remember to
turn it back on before this goes live to real students.

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase URL/key. If you want to test AI-assisted content
drafting (Phase 6), also add an `OPENROUTER_API_KEY` — free, no card
required, from [openrouter.ai](https://openrouter.ai).

### 3. Install dependencies

```bash
npm install
```

### 4. Apply the database migrations

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

This applies, in order:

| Migration | Adds |
|---|---|
| `0001_schema.sql` | All tables and enums |
| `0002_functions_triggers.sql` | Profile auto-creation, streaks, upvote sync, messaging eligibility function |
| `0003_rls_policies.sql` | Row-level security for every table |
| `0004_storage_buckets.sql` | Storage buckets and their access policies |
| `0005_contact_messages.sql` | Contact form table |
| `0006_achievement_engine.sql` | Auto-awards badges via triggers |
| `0007_phase5_realtime_and_triggers.sql` | Realtime on `messages`/`notifications`, team-chat auto-provisioning, reply/message notifications |
| `0008_app_settings.sql` | Site-wide settings table |
| `0009_community_replies_delete_policy.sql` | Fixes a missing RLS policy needed for reply moderation |

No CLI? Paste each file's contents into the Supabase Dashboard's SQL
Editor and run them in order instead.

### 5. Seed placeholder data (recommended)

Paste `supabase/seed.sql` into the SQL Editor and run it. Adds sample
modules, lessons, a quiz, achievements, events, announcements, and
gallery items. Doesn't seed user profiles — those are created
automatically on signup.

### 6. Generate accurate TypeScript types

`types/database.types.ts` is a hand-written starting point. Once your
migrations are live, regenerate the authoritative version:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > types/database.types.ts
```

### 7. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## 🛡️ Security Hardening (August 2026)

This repository has been hardened with the following measures:

- **Quiz Answer Protection**: Correct answers are now stored in a separate `quiz_answers` table. The `quizzes.questions` JSONB has been stripped of sensitive fields. Scoring is performed server-side using a service-role client.
- **Messaging Enforcement**: Direct messaging is restricted via RLS and Server Action checks. Students can only message Super Admins; Club Members can message each other. Direct database inserts into `conversations` are blocked for standard users.
- **Moderation Protection**: Database triggers prevent regular users from modifying moderation fields (e.g., `is_pinned`, `is_resolved`) or computed fields (e.g., `upvote_count`).
- **Open Redirect Prevention**: A utility `getSafeRedirect` is used to validate all `redirectTo` parameters, ensuring they only point to internal relative paths.
- **Maintenance Mode Fix**: Anonymous visitors are now correctly redirected to `/maintenance` when enabled, via a secure RPC that bypasses the restriction on the `app_settings` table.

**Important for Production:**
1. **Rotate Keys**: If your `SUPABASE_SERVICE_ROLE_KEY` has ever been checked into version control or exposed, rotate it immediately.
2. **Environment Hygiene**: Never commit your `.env` file. Use placeholders in `.env.example`.
3. **RLS is Primary**: While the UI provides a good experience, Row Level Security is the ultimate source of truth for all data access rules.

---

## 🧪 Testing

The repository includes unit tests for core security helpers.

```bash
npm test
```

Currently includes:
- Redirect sanitization logic

---

### Creating your first Super Admin

There's no signup flow for this — after signing up once, promote
yourself directly in the SQL Editor:

```sql
update profiles set role = 'super_admin' where id = 'your-user-uuid-here';
```

Find your UUID under **Authentication → Users**.

---

## Phase-by-phase reference

### Phase 3 — public site

| Page | Route | Data source |
|---|---|---|
| Home | `/` | Live stats, featured approved projects |
| About | `/about` | Static |
| Learn | `/learn` | Published modules, grouped by level |
| Projects | `/projects` | Approved projects |
| Events | `/events` | Public upcoming events |
| Resources | `/resources` | All resources; downloads gated by visibility |
| Community | `/community` | Recent posts (read-only preview) |
| Join | `/join` | Static + CTA |
| Contact | `/contact` | Working form → `contact_messages` table |
| Gallery | `/gallery` | Gallery items |

Every page degrades gracefully if a table is empty — a proper empty
state, not a crash.

### Phase 4 — auth + student experience

| Page | Route | What it does |
|---|---|---|
| Login / Sign up | `/login`, `/signup` | Supabase email/password auth |
| Dashboard home | `/dashboard` | Streak, next lesson, membership status, notifications preview |
| My Learning | `/dashboard/learn` | Modules with progress bars |
| Lesson viewer | `/dashboard/learn/[moduleSlug]/[lessonSlug]` | Content, objectives, materials; mark-complete drives streaks + achievements |
| Quiz | `/dashboard/quizzes/[quizId]` | Scored server-side only |
| Progress & Badges | `/dashboard/progress` | Full badge grid (locked + earned) |
| Membership | `/dashboard/membership` | Apply / view application status |
| Notifications | `/dashboard/notifications` | Full feed, mark-as-read |
| Profile | `/dashboard/profile` | Edit name, year group, bio |

**Achievement engine**: badges are awarded by Postgres triggers, not
application code, when a student hits a streak milestone, completes
enough lessons, passes a quiz, or submits a project.

**Quiz security**: correct answers never reach the browser before
submission — scoring happens entirely server-side.

### Phase 5 — community, chat & club member features

| Page | Route | What it does |
|---|---|---|
| Community | `/dashboard/community` | Full Q&A: post, reply, upvote |
| Public project | `/projects/[projectSlug]` | Full detail, team roster, comments |
| My Projects | `/dashboard/projects` | Projects you submitted or joined |
| Submit project | `/dashboard/projects/new` | Club Member+ only |
| Messages | `/dashboard/chat` | Inbox, realtime conversation threads |
| Internal Updates | `/dashboard/updates` | Club Member+ only announcements |

**Messaging enforcement**: the restricted policy (Student→Super Admin
always; Club Member↔Club Member; team chats auto-provisioned) is
enforced server-side in `startConversation` via the `can_message()`
Postgres function — not just in the UI.

**Team chats are automatic**: a trigger creates the conversation and
adds members the instant someone joins `project_team_members`,
including the submitter on submission.

**Realtime**: messages stream in live via Supabase Realtime — no
polling.

### Phase 6 — the Super Admin system

All routes require `role = super_admin` (middleware + `requireRole` +
RLS — three layers).

| Area | Route(s) | What it does |
|---|---|---|
| Overview | `/admin` | Queue counts across the whole system |
| Membership | `/admin/membership` | Approve/reject — approval promotes to Club Member |
| Projects | `/admin/projects` | Approve/reject submissions |
| Users | `/admin/users` | Change role, suspend/reactivate |
| Learning | `/admin/learning/*` | Full CRUD + **AI-assisted drafting** |
| Events / Resources / Announcements / Gallery | `/admin/*` | Full CRUD |
| Moderation | `/admin/community` | Pin/unpin, remove posts/replies (audit-logged) |
| Contact Messages | `/admin/contact` | View and mark read |
| Settings | `/admin/settings` | Site-wide toggles |

**AI-assisted drafting (OpenRouter)**: on `/admin/learning/lessons/new`
and `/admin/learning/quizzes/new`, give a topic + level and get a draft
that fills the normal editable form — nothing publishes until you hit
Save. Quizzes can also be generated grounded in an existing lesson's
actual content. Uses the `openrouter/free` auto-router, not a pinned
model. Needs `OPENROUTER_API_KEY`; without it, Generate shows a clear
error instead of failing silently.

**Settings are real, not decorative**: turning off "Direct messaging"
actually blocks the chat Server Actions server-side. "Maintenance mode"
actually redirects everyone except a logged-in Super Admin, checked in
middleware on every request.

**Suspension is real**: toggling a user to "Suspended" sets
`profiles.is_active = false`, checked in both `requireRole()` and
middleware — enforced on their very next request.

---

## End-to-end testing checklist

Once setup (above) is done, work through this in order:

**Setup**
- [ ] `npm install` completes with no errors
- [ ] Sign up account A, promote it to `super_admin` via SQL
- [ ] Sign up account B, leave it as `student`

**Public site**
- [ ] Homepage loads with the boot-sequence animation, then the hero
- [ ] About, Learn, Projects, Events, Resources, Community, Join, Contact, Gallery all render
- [ ] Contact form submission appears at `/admin/contact`

**Student experience (account B)**
- [ ] Complete a lesson in Arduino Basics → streak increments, "First Steps" badge appears
- [ ] Take the Blink LED quiz → score shown, review shows correct/incorrect
- [ ] Edit profile, apply for club membership

**Admin: membership (account A)**
- [ ] Approve account B's application at `/admin/membership`
- [ ] Account B now shows "Club Member" and can reach `/dashboard/projects/new` and `/dashboard/updates`

**Community**
- [ ] Post a question (B), reply (A), upvote both
- [ ] Mark the post resolved as the original poster

**Projects**
- [ ] Submit a project as account B
- [ ] Approve it at `/admin/projects` → confirm it's on public `/projects` and B gets a notification
- [ ] Add a second Club Member to the team → confirm a team chat appears for both automatically

**Messaging**
- [ ] B messages A → realtime delivery (open both side by side)
- [ ] Toggle "Direct messaging" off in `/admin/settings` → sending now fails gracefully

**Admin content management**
- [ ] Create a module, a lesson (try "Generate draft" if `OPENROUTER_API_KEY` is set), and a quiz
- [ ] Generate a quiz from an existing lesson's content
- [ ] Create an event, a resource, and a `club_member`-visibility announcement → confirm it shows at `/dashboard/updates`
- [ ] Add a gallery photo → confirm it's on `/gallery`

**Moderation & admin controls**
- [ ] Pin a post and remove a reply from `/admin/community`
- [ ] Suspend account B → confirm redirect to `/suspended` on their next request
- [ ] Toggle "Maintenance mode" on → confirm A still has access while a logged-out visitor is redirected to `/maintenance`, then toggle back off
