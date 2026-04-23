-- ═══════════════════════════════════════════════════════════════
-- GameStringer Social Features — Schema COMPATIBILE
-- Nomi colonne corrispondenti a lib/social.ts
-- ═══════════════════════════════════════════════════════════════

-- Pulisci tabelle esistenti
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_presence CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;

-- ── Friendships (user requester_id/addressee_id come nel codice) ──────────

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK(requester_id != addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- ── User Presence (last_heartbeat come nel codice) ───────────────────────

CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  current_activity TEXT,
  current_game TEXT,
  last_heartbeat TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_presence_heartbeat ON user_presence(last_heartbeat);

-- ── Chat Conversations ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'channel')),
  name TEXT,
  avatar_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON chat_conversations(type);

-- ── Chat Participants ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_conversation ON chat_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON chat_participants(user_id);

-- ── Chat Messages ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'image', 'file')),
  reply_to_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at DESC);

-- ── Notifications (is_read come nel codice) ────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'thread_reply', 'mention', 'like', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  sender_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ── RLS Policies ───────────────────────────────────────────────────────

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: tutti gli utenti autenticati possono fare tutto
DROP POLICY IF EXISTS "allow_all" ON friendships;
CREATE POLICY "allow_all" ON friendships FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all" ON user_presence;
CREATE POLICY "allow_all" ON user_presence FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all" ON chat_conversations;
CREATE POLICY "allow_all" ON chat_conversations FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all" ON chat_participants;
CREATE POLICY "allow_all" ON chat_participants FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all" ON chat_messages;
CREATE POLICY "allow_all" ON chat_messages FOR ALL USING (true);

DROP POLICY IF EXISTS "allow_all" ON notifications;
CREATE POLICY "allow_all" ON notifications FOR ALL USING (true);

-- ── RPC Function: update_user_presence ───────────────────────────────────

CREATE OR REPLACE FUNCTION update_user_presence(
  p_user_id UUID,
  p_status TEXT DEFAULT 'offline',
  p_activity TEXT DEFAULT NULL,
  p_game TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, current_activity, current_game, last_heartbeat, updated_at)
  VALUES (p_user_id, p_status, p_activity, p_game, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET
    status = EXCLUDED.status,
    current_activity = EXCLUDED.current_activity,
    current_game = EXCLUDED.current_game,
    last_heartbeat = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Done ─────────────────────────────────────────────────────────────
