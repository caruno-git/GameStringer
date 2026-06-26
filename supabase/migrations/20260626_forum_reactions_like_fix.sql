-- Fix "like" del forum. Mancavano: (1) una policy SELECT su forum_reactions (RLS
-- attiva + nessuna SELECT = reazioni invisibili → toggle e stato "liked" rotti),
-- (2) un DELETE per gli utenti community (anon) per togliere il like, (3) un trigger
-- per mantenere like_count (l'UPDATE diretto su thread/post è bloccato dalla RLS
-- "author only", quindi il conteggio non saliva mai). DROP IF EXISTS = ri-eseguibile.

-- 1) Lettura reazioni
DROP POLICY IF EXISTS "Public read reactions" ON forum_reactions;
CREATE POLICY "Public read reactions" ON forum_reactions FOR SELECT TO public USING (true);

-- 2) Unlike per utenti community (anon)
DROP POLICY IF EXISTS "Community delete reactions" ON forum_reactions;
CREATE POLICY "Community delete reactions" ON forum_reactions FOR DELETE TO public USING (user_id IS NOT NULL);

-- 3) Mantieni like_count su thread/post (SECURITY DEFINER → bypassa la RLS di update)
CREATE OR REPLACE FUNCTION forum_reactions_like_count() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF tg_op = 'INSERT' AND new.reaction_type = 'like' THEN
    IF new.thread_id IS NOT NULL THEN UPDATE forum_threads SET like_count = coalesce(like_count,0) + 1 WHERE id = new.thread_id; END IF;
    IF new.post_id  IS NOT NULL THEN UPDATE forum_posts  SET like_count = coalesce(like_count,0) + 1 WHERE id = new.post_id;  END IF;
  ELSIF tg_op = 'DELETE' AND old.reaction_type = 'like' THEN
    IF old.thread_id IS NOT NULL THEN UPDATE forum_threads SET like_count = greatest(coalesce(like_count,0) - 1, 0) WHERE id = old.thread_id; END IF;
    IF old.post_id  IS NOT NULL THEN UPDATE forum_posts  SET like_count = greatest(coalesce(like_count,0) - 1, 0) WHERE id = old.post_id;  END IF;
  END IF;
  RETURN NULL;
END $fn$;

DROP TRIGGER IF EXISTS trg_forum_reactions_like_count ON forum_reactions;
CREATE TRIGGER trg_forum_reactions_like_count
  AFTER INSERT OR DELETE ON forum_reactions
  FOR EACH ROW EXECUTE FUNCTION forum_reactions_like_count();
