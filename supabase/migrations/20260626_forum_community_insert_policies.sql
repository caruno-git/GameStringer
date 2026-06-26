-- Community può creare thread/post/reazioni anche senza una sessione Supabase
-- "authenticated" (gli utenti usano profili locali → ruolo anon). Le policy storiche
-- erano solo per il ruolo `authenticated` con author_id = auth.uid(), quindi gli anon
-- venivano respinti ("non permette di creare tema"). Aggiungiamo policy `public` con
-- guardie minime (author_id presente + lunghezze sane). Moderazione via is_hidden.
--
-- DROP IF EXISTS prima di CREATE per restare ri-eseguibile (vedi Supabase Preview /
-- branch DB clonato; Postgres non ha CREATE POLICY IF NOT EXISTS).

DROP POLICY IF EXISTS "Community insert threads" ON forum_threads;
CREATE POLICY "Community insert threads" ON forum_threads FOR INSERT TO public
  WITH CHECK (
    author_id IS NOT NULL
    AND length(coalesce(title, '')) BETWEEN 1 AND 300
    AND length(coalesce(content, '')) BETWEEN 1 AND 20000
  );

DROP POLICY IF EXISTS "Community insert posts" ON forum_posts;
CREATE POLICY "Community insert posts" ON forum_posts FOR INSERT TO public
  WITH CHECK (
    author_id IS NOT NULL
    AND length(coalesce(content, '')) BETWEEN 1 AND 20000
  );

DROP POLICY IF EXISTS "Community insert reactions" ON forum_reactions;
CREATE POLICY "Community insert reactions" ON forum_reactions FOR INSERT TO public
  WITH CHECK (user_id IS NOT NULL);
