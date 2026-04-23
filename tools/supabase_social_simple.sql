-- ═══════════════════════════════════════════════════════════════
-- GameStringer Social Features — Schema Semplificato
-- SENZA vincoli foreign key per evitare conflitti
-- ═══════════════════════════════════════════════════════════════

-- ── Friendships (senza FK a user_profiles) ───────────────────────────

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK(user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- ── User Presence (senza FK) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  activity TEXT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON user_presence(last_seen);

-- ── Chat Conversations ───────────────────────────────────────────────

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

-- ── Chat Participants (senza FK) ────────────────────────────────────

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

-- ── Chat Messages (senza FK) ──────────────────────────────────────────

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

-- ── Notifications (senza FK) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'message', 'mention', 'system')),
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ── RLS Policies semplificate ─────────────────────────────────────────

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy semplice: autenticato può vedere tutto per ora
DROP POLICY IF EXISTS "Authenticated users can view all" ON friendships;
CREATE POLICY "Authenticated users can view all" ON friendships
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert" ON friendships;
CREATE POLICY "Authenticated users can insert" ON friendships
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update" ON friendships;
CREATE POLICY "Authenticated users can update" ON friendships
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete" ON friendships;
CREATE POLICY "Authenticated users can delete" ON friendships
  FOR DELETE USING (auth.role() = 'authenticated');

-- User Presence
DROP POLICY IF EXISTS "Authenticated users can view presence" ON user_presence;
CREATE POLICY "Authenticated users can view presence" ON user_presence
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update presence" ON user_presence;
CREATE POLICY "Authenticated users can update presence" ON user_presence
  FOR ALL USING (auth.role() = 'authenticated');

-- Chat
DROP POLICY IF EXISTS "Authenticated users can view conversations" ON chat_conversations;
CREATE POLICY "Authenticated users can view conversations" ON chat_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON chat_conversations;
CREATE POLICY "Authenticated users can create conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view participants" ON chat_participants;
CREATE POLICY "Authenticated users can view participants" ON chat_participants
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage participants" ON chat_participants;
CREATE POLICY "Authenticated users can manage participants" ON chat_participants
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can view messages" ON chat_messages;
CREATE POLICY "Authenticated users can view messages" ON chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert messages" ON chat_messages;
CREATE POLICY "Authenticated users can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update messages" ON chat_messages;
CREATE POLICY "Authenticated users can update messages" ON chat_messages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Notifications
DROP POLICY IF EXISTS "Authenticated users can view notifications" ON notifications;
CREATE POLICY "Authenticated users can view notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update notifications" ON notifications;
CREATE POLICY "Authenticated users can update notifications" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ── Done ───────────────────────────────────────────────────────────
