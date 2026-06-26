-- ══════════════════════════════════════════════════════════════════════════════
-- GAMESTRINGER FORUM SCHEMA
-- Trasforma Community Hub in un vero forum con thread di discussione
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── CATEGORIE FORUM ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '💬',
  color TEXT DEFAULT '#3b82f6',
  sort_order INT DEFAULT 0,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorie di default
INSERT INTO forum_categories (slug, name, description, icon, color, sort_order) VALUES
  ('traduzioni', 'Traduzioni', 'Condividi e scarica pack di traduzione per i tuoi giochi', '🌍', '#10b981', 1),
  ('richieste', 'Richieste', 'Richiedi traduzioni per giochi specifici', '🙏', '#f59e0b', 2),
  ('supporto', 'Supporto Tecnico', 'Problemi con GameStringer? Chiedi aiuto qui', '🔧', '#ef4444', 3),
  ('generale', 'Discussioni Generali', 'Chiacchiere sul mondo della localizzazione e gaming', '💬', '#3b82f6', 4),
  ('showcase', 'Showcase', 'Mostra i tuoi progetti di traduzione completati', '🏆', '#8b5cf6', 5),
  ('feedback', 'Feedback & Suggerimenti', 'Idee per migliorare GameStringer', '💡', '#06b6d4', 6)
ON CONFLICT (slug) DO NOTHING;

-- ─── THREAD ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  
  -- Contenuto primo post
  content TEXT NOT NULL,
  content_html TEXT,
  
  -- Metadata per pack di traduzione (se è un thread di tipo pack)
  is_translation_pack BOOLEAN DEFAULT FALSE,
  pack_data JSONB, -- {game_name, game_id, source_lang, target_lang, string_count, download_url, version, etc}
  
  -- Stats
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  download_count INT DEFAULT 0,
  
  -- Stato
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_reply_at TIMESTAMPTZ,
  last_reply_by TEXT,
  
  UNIQUE(category_id, slug)
);

-- ─── POST/RISPOSTE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  
  content TEXT NOT NULL,
  content_html TEXT,
  
  -- Quote/Reply
  reply_to_id UUID REFERENCES forum_posts(id) ON DELETE SET NULL,
  quote_text TEXT,
  
  -- Stats
  like_count INT DEFAULT 0,
  
  -- Stato
  is_solution BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REAZIONI ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like', -- like, love, helpful, funny, etc
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un utente può mettere una sola reazione per tipo per thread/post
  UNIQUE(user_id, thread_id, reaction_type),
  UNIQUE(user_id, post_id, reaction_type)
);

-- ─── DOWNLOAD TRACKING ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDICI ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_threads_created ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_pinned ON forum_threads(is_pinned DESC, last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_pack ON forum_threads(is_translation_pack) WHERE is_translation_pack = TRUE;

CREATE INDEX IF NOT EXISTS idx_posts_thread ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON forum_posts(created_at);

CREATE INDEX IF NOT EXISTS idx_reactions_thread ON forum_reactions(thread_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON forum_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON forum_reactions(user_id);

-- ─── RLS POLICIES ────────────────────────────────────────────────────────────
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_downloads ENABLE ROW LEVEL SECURITY;

-- Tutti possono leggere (DROP IF EXISTS per rendere la migration ri-eseguibile,
-- es. sui branch di preview Supabase che ripartono da un DB clonato)
DROP POLICY IF EXISTS "Public read categories" ON forum_categories;
CREATE POLICY "Public read categories" ON forum_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read threads" ON forum_threads;
CREATE POLICY "Public read threads" ON forum_threads FOR SELECT USING (NOT is_hidden);
DROP POLICY IF EXISTS "Public read posts" ON forum_posts;
CREATE POLICY "Public read posts" ON forum_posts FOR SELECT USING (NOT is_hidden);

-- Solo autenticati possono scrivere
DROP POLICY IF EXISTS "Auth insert threads" ON forum_threads;
CREATE POLICY "Auth insert threads" ON forum_threads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Auth insert posts" ON forum_posts;
CREATE POLICY "Auth insert posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Auth insert reactions" ON forum_reactions;
CREATE POLICY "Auth insert reactions" ON forum_reactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Solo autore può modificare
DROP POLICY IF EXISTS "Author update threads" ON forum_threads;
CREATE POLICY "Author update threads" ON forum_threads FOR UPDATE USING (author_id = auth.uid());
DROP POLICY IF EXISTS "Author update posts" ON forum_posts;
CREATE POLICY "Author update posts" ON forum_posts FOR UPDATE USING (author_id = auth.uid());
DROP POLICY IF EXISTS "Author delete reactions" ON forum_reactions;
CREATE POLICY "Author delete reactions" ON forum_reactions FOR DELETE USING (user_id = auth.uid());

-- ─── FUNZIONI ────────────────────────────────────────────────────────────────

-- Incrementa view count
CREATE OR REPLACE FUNCTION increment_thread_views(thread_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_threads SET view_count = view_count + 1 WHERE id = thread_uuid;
END;
$$ LANGUAGE plpgsql;

-- Aggiorna reply count e last_reply
CREATE OR REPLACE FUNCTION update_thread_on_reply()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_threads SET 
    reply_count = reply_count + 1,
    last_reply_at = NEW.created_at,
    last_reply_by = NEW.author_name,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_insert
  AFTER INSERT ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_on_reply();

-- Aggiorna like count
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.thread_id IS NOT NULL THEN
      UPDATE forum_threads SET like_count = like_count + 1 WHERE 