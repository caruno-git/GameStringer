-- ═══════════════════════════════════════════════════════════════
-- GameStringer Social Features — Supabase Schema (SAFE)
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

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_friend ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ── User Presence ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
  activity TEXT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_presence_status ON user_presence(status);
CREATE INDEX idx_presence_last_seen ON user_presence(last_seen);

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

CREATE INDEX idx_conversations_type ON chat_conversations(type);
CREATE INDEX idx_conversations_created ON chat_conversations(created_at DESC);

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

CREATE INDEX idx_participants_conversation ON chat_participants(conversation_id);
CREATE INDEX idx_participants_user ON chat_participants(user_id);

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

CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_messages_created ON chat_messages(created_at DESC);
CREATE INDEX idx_messages_reply ON chat_messages(reply_to_id);

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

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ── Achievements ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  requirement_type TEXT CHECK (requirement_type IN ('friends_count', 'messages_sent', 'packs_published', 'manual')),
  requirement_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── User Achievements ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- ── RLS Policies ─────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- User Profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert own profile" ON user_profiles;
CREATE POLICY "Users insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

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

-- Achievements (public read, no write for users)
DROP POLICY IF EXISTS "Public can view achievements" ON achievements;
CREATE POLICY "Public can view achievements" ON achievements
  FOR SELECT USING (true);

-- User Achievements
DROP POLICY IF EXISTS "Users view own achievements" ON user_achievements;
CREATE POLICY "Users view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- ── RPC Functions ─────────────────────────────────────────────────────

-- Update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
  p_user_id UUID,
  p_status TEXT DEFAULT 'offline',
  p_activity TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, activity, last_seen, updated_at)
  VALUES (p_user_id, p_status, p_activity, now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET
    status = EXCLUDED.status,
    activity = EXCLUDED.activity,
    last_seen = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get online users
CREATE OR REPLACE FUNCTION get_online_users()
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  status TEXT,
  activity TEXT,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.username,
    up.avatar_url,
    upres.status,
    upres.activity,
    upres.last_seen
  FROM user_presence upres
  JOIN user_profiles up ON up.id = upres.user_id
  WHERE upres.status IN ('online', 'away', 'busy')
    AND upres.last_seen > now() - interval '5 minutes'
  ORDER BY upres.last_seen DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or get direct conversation
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(
  p_user_id UUID,
  p_other_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- Try to find existing direct conversation
  SELECT cp.conversation_id INTO conv_id
  FROM chat_participants cp1
  JOIN chat_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  JOIN chat_conversations cc ON cc.id = cp1.conversation_id
  WHERE cp1.user_id = p_user_id
    AND cp2.user_id = p_other_user_id
    AND cc.type = 'direct'
    AND cp1.conversation_id = cp2.conversation_id
  LIMIT 1;
  
  -- If not found, create new
  IF conv_id IS NULL THEN
    INSERT INTO chat_conversations (type, created_by)
    VALUES ('direct', p_user_id)
    RETURNING id INTO conv_id;
    
    -- Add both participants
    INSERT INTO chat_participants (conversation_id, user_id)
    VALUES (conv_id, p_user_id), (conv_id, p_other_user_id);
  END IF;
  
  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Send friend request
CREATE OR REPLACE FUNCTION send_friend_request(
  p_user_id UUID,
  p_friend_id UUID
)
RETURNS UUID AS $$
DECLARE
  friendship_id UUID;
BEGIN
  INSERT INTO friendships (user_id, friend_id, status)
  VALUES (p_user_id, p_friend_id, 'pending')
  ON CONFLICT (user_id, friend_id) 
  DO UPDATE SET status = 'pending', updated_at = now()
  RETURNING id INTO friendship_id;
  
  RETURN friendship_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept friend request
CREATE OR REPLACE FUNCTION accept_friend_request(
  p_user_id UUID,
  p_requester_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE friendships
  SET status = 'accepted', updated_at = now()
  WHERE user_id = p_requester_id
    AND friend_id = p_user_id
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup stale presence (call this periodically)
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS VOID AS $$
BEGIN
  UPDATE user_presence
  SET status = 'offline', updated_at = now()
  WHERE status IN ('online', 'away', 'busy')
    AND last_seen < now() - interval '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger for new user profile ─────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  INSERT INTO public.user_profiles (id, username, email, avatar_url)
  VALUES (
    NEW.id,
    'user_' || LEFT(NEW.id::text, 8) || '_' || floor(random() * 1000)::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Create profiles for existing users ─────────────────────────────────

INSERT INTO user_profiles (id, username, email, avatar_url)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', 'user_' || LEFT(au.id::text, 8)),
  au.email,
  COALESCE(au.raw_user_meta_data->>'avatar_url', '')
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ── Done ───────────────────────────────────────────────────────────
