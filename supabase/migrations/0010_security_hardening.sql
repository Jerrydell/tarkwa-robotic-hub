-- =============================================================
-- Hardening Security, Messaging, and Data Protection
-- =============================================================

-- 1. QUIZ ANSWER PROTECTION
-- Move correct answers to a separate table that is not readable by standard users.

CREATE TABLE IF NOT EXISTS quiz_answers (
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  PRIMARY KEY (quiz_id, question_index)
);

-- Migrate existing data
DO $$
DECLARE
    q_record RECORD;
    q_json JSONB;
    i INTEGER;
BEGIN
    FOR q_record IN SELECT id, questions FROM quizzes LOOP
        i := 0;
        FOR q_json IN SELECT * FROM jsonb_array_elements(q_record.questions) LOOP
            INSERT INTO quiz_answers (quiz_id, question_index, correct_index, explanation)
            VALUES (q_record.id, i, (q_json->>'correct_index')::int, q_json->>'explanation')
            ON CONFLICT DO NOTHING;
            i := i + 1;
        END LOOP;
    END LOOP;
END $$;

-- Strip correct answers from the public quizzes table
UPDATE quizzes
SET questions = (
    SELECT jsonb_agg(elem - 'correct_index' - 'explanation')
    FROM (SELECT id, jsonb_array_elements(questions) as elem FROM quizzes) as sub
    WHERE sub.id = quizzes.id
);

ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
-- Only Super Admins can see raw answers directly in the DB
CREATE POLICY "quiz_answers_admin_all" ON quiz_answers FOR ALL USING (is_super_admin());

-- 2. MESSAGING POLICY ENFORCEMENT
-- Rules: Super Admins can message anyone. Club members can message club members.
-- Students can only message Super Admins.

CREATE OR REPLACE FUNCTION can_message(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
DECLARE
  role_a user_role;
  role_b user_role;
BEGIN
  -- Super admin check
  -- If either user is a super admin, allow.
  -- (We check both because user_a is sender, user_b is receiver)
  
  SELECT role INTO role_a FROM profiles WHERE id = user_a;
  SELECT role INTO role_b FROM profiles WHERE id = user_b;

  -- Anyone can message a super admin, and vice-versa
  IF role_b = 'super_admin' OR role_a = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  -- Club members can message each other
  IF role_a = 'club_member' AND role_b = 'club_member' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tighten conversation RLS
-- Block direct client inserts; force use of Server Actions (which use service_role after checks).
DROP POLICY IF EXISTS "conversations_insert_authenticated" ON conversations;
CREATE POLICY "conversations_insert_admin_only" ON conversations
  FOR INSERT WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "conversation_participants_insert_checked" ON conversation_participants;
CREATE POLICY "conversation_participants_insert_admin_only" ON conversation_participants
  FOR INSERT WITH CHECK (is_super_admin());

-- 3. MODERATION FIELD PROTECTION
-- Prevent users from changing computed or admin-only fields via triggers.

CREATE OR REPLACE FUNCTION protect_community_post_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF (NOT is_super_admin()) THEN
    -- Check for forbidden field changes
    IF (NEW.is_pinned IS DISTINCT FROM OLD.is_pinned OR
        NEW.upvote_count IS DISTINCT FROM OLD.upvote_count OR
        NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
      RAISE EXCEPTION 'Unauthorized change to moderation/computed fields.';
    END IF;

    -- Only author can resolve
    IF (NEW.is_resolved IS DISTINCT FROM OLD.is_resolved AND OLD.user_id != auth.uid()) THEN
       RAISE EXCEPTION 'Only the author or an admin can resolve this post.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_community_posts
BEFORE UPDATE ON community_posts
FOR EACH ROW EXECUTE FUNCTION protect_community_post_fields();

CREATE OR REPLACE FUNCTION protect_community_reply_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF (NOT is_super_admin()) THEN
    IF (NEW.upvote_count IS DISTINCT FROM OLD.upvote_count OR
        NEW.user_id IS DISTINCT FROM OLD.user_id OR
        NEW.post_id IS DISTINCT FROM OLD.post_id) THEN
      RAISE EXCEPTION 'Unauthorized change to computed fields.';
    END IF;

    -- Only author of the POST can accept an answer
    IF (NEW.is_accepted_answer IS DISTINCT FROM OLD.is_accepted_answer) THEN
      IF NOT EXISTS (
        SELECT 1 FROM community_posts
        WHERE id = OLD.post_id AND user_id = auth.uid()
      ) THEN
        RAISE EXCEPTION 'Only the post author can accept an answer.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_community_replies
BEFORE UPDATE ON community_replies
FOR EACH ROW EXECUTE FUNCTION protect_community_reply_fields();

-- 4. MAINTENANCE MODE FOR ANONYMOUS USERS
-- Allow anyone to check the maintenance mode status via a secure function.

CREATE OR REPLACE FUNCTION get_site_setting(setting_key TEXT)
RETURNS JSONB AS $$
BEGIN
  IF setting_key IN ('maintenance_mode', 'chat_enabled') THEN
    RETURN (SELECT value FROM app_settings WHERE key = setting_key);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_site_setting(TEXT) TO anon, authenticated;

-- Tighten app_settings RLS: only admins can select all settings directly.
-- Standard users use the get_site_setting() RPC for specific keys.
DROP POLICY IF EXISTS "app_settings_select_authenticated" ON app_settings;
CREATE POLICY "app_settings_select_admin" ON app_settings
  FOR SELECT USING (is_super_admin());
