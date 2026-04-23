-- ═══════════════════════════════════════════════════════════════
-- GameStringer Social Features — Schema MINIMAL
-- SENZA policy complesse, solo tabelle base
-- ═══════════════════════════════════════════════════════════════

-- Pulisci tabelle esistenti (se hanno struttura errata)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_presence CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;

-- ── Tabelle Social Base ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY,
  status TEXT DEFAULT 'offline',
  activity TEXT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'direct',
  name TEXT,
  avatar_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  reply_to_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indici ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON chat_conversations(type);
CREATE INDEX IF NOT EXISTS idx_participants_conversation ON chat_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ── RLS Abilitato ma policy permessive ──────────────────────────────

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

-- ── Done ───────────────────────────────────────────────────────────
