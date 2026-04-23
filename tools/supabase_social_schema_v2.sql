-- ═══════════════════════════════════════════════════════════════
-- GameStringer Social Features — Supabase Schema (SAFE v2)
-- Aggiunge solo tabelle/colonne mancanti, non distrugge dati
-- Esegui nel SQL Editor di Supabase Dashboard
-- ═══════════════════════════════════════════════════════════════

-- ── User Profiles - Aggiunge colonne mancanti ─────────────────────

ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS discord TEXT,
  ADD COLUMN IF NOT EXISTS github TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS favorite_language TEXT,
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ── Friendships ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK(user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- ── User Presence ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
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
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON chat_conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON chat_conversations(created_at DESC);

-- ── Chat Participants ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_conversation ON chat_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON chat_participants(user_id);

-- ── Chat Messages ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'image', 'file')),
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply ON chat_messages(reply_to_id);

-- ── Notifications ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'message', 'mention', 'system')),
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ── RLS Policies ─────────────────────────────────────────────────────

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Friendships
DROP POLICY IF EXISTS "Users view own friendships" ON friendships;
CREATE POLICY "Users view own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users create friendships" ON friendships;
CREATE POLICY "Users create friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own friendships" ON friendships;
CREATE POLICY "Users update own friendships" ON friendships
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own friendships" ON friendships;
CREATE POLICY "Users delete own friendships" ON friendships
  FOR DELETE USING (auth.uid() = user_id);

-- User Presence
DROP POLICY IF EXISTS "Users can view all presence" ON user_presence;
CREATE POLICY "Users can view all presence" ON user_presence
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own presence" ON user_presence;
CREATE POLICY "Users update own presence" ON user_presence
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Chat Conversations
DROP POLICY IF EXISTS "Users view conversations they participate in" ON chat_conversations;
CREATE POLICY "Users view conversations they participate in" ON chat_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.conversation_id = chat_conversations.id 
      AND chat_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users create conversations" ON chat_conversations;
CREATE POLICY "Users create conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users update own conversations" ON chat_conversations;
CREATE POLICY "Users update own conversations" ON chat_conversations
  FOR UPDATE USING (auth.uid() = created_by);

-- Chat Participants
DROP POLICY IF EXISTS "Users view conversation participants" ON chat_participants;
CREATE POLICY "Users view conversation participants" ON chat_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp2
      WHERE cp2.conversation_id = chat_participants.conversation_id
      AND cp2.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users manage own participation" ON chat_participants;
CREATE POLICY "Users manage own participation" ON chat_participants
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Chat Messages
DROP POLICY IF EXISTS "Users view messages in their conversations" ON chat_messages;
CREATE POLICY "Users view messages in their conversations" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.conversation_id = chat_messages.conversation_id
      AND chat_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users insert messages in their conversations" ON chat_messages;
CREATE POLICY "Users insert messages in their conversations" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_participants.conversation_id = chat_messages.conversation_id
      AND chat_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users update own messages" ON chat_messages;
CREATE POLICY "Users update own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ── RPC Functions (commentate - aggiungere dopo verifica struttura tabelle) ──

-- Update user presence
-- CREATE OR REPLACE FUNCTION update_user_presence(...)

-- Get online users
-- CREATE OR REPLACE FUNCTION get_online_users(...)

-- Create or get direct conversation
-- CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(...)

-- Send friend request
-- CREATE OR REPLACE FUNCTION send_friend_request(...)

-- Accept friend request
-- CREATE OR REPLACE FUNCTION accept_friend_request(...)

-- Cleanup stale presence
-- CREATE OR REPLACE FUNCTION cleanup_stale_presence(...)

-- ── Done ───────────────────────────────────────────────────────────
