-- ═══════════════════════════════════════════════════════════════════════════
-- 🔒 HARDENING RLS — GameStringer (anti-abuso / anti-riempimento DB free tier)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- PERCHÉ:
--   L'anon key è pubblica (committata in lib/social/community-hub-backend.ts).
--   Le policy attuali di chat e forum sono APERTE:
--     INSERT  WITH CHECK (true)   → chiunque con l'anon key può inserire righe
--                                    a volontà → riempie i 500 MB del piano Free
--                                    → ti forza all'upgrade a pagamento.
--     UPDATE  USING (true)        → chiunque può modificare/cancellare messaggi
--                                    di altri (vandalismo).
--
-- COSA FA QUESTO SCRIPT:
--   • Letture: restano PUBBLICHE (community pubblica → ok).
--   • Scritture: richiedono un utente AUTENTICATO (auth.uid() non nullo).
--     Così la sola anon key non basta più: serve una sessione di login reale
--     (JWT), e gli account auth sono rate-limited da Supabase.
--   • Dove esiste una colonna proprietario, UPDATE/DELETE sono limitati al
--     proprietario (anti-vandalismo).
--   • Aggiunge un tetto di lunghezza ai messaggi (difesa extra contro il DB-fill).
--
-- L'app usa già Supabase Auth (signInWithPassword/signUp in community-chat.ts),
-- quindi questo NON rompe il flusso legittimo.
--
-- COME APPLICARE:
--   Supabase Dashboard → SQL Editor → incolla tutto → Run.
--   Idempotente: si può rieseguire senza problemi.
--
-- SE DOPO QUESTO GLI UTENTI LEGITTIMI NON RIESCONO A POSTARE:
--   significa che author_id/user_id non coincide con auth.uid().
--   In quel caso sostituisci le policy "= auth.uid()::text" con la versione
--   solo-autenticato indicata nei commenti "FALLBACK".
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 1) COMMUNITY CHAT  (supabase/community-chat-schema.sql)
-- ─────────────────────────────────────────────────────────────────────────────

-- community_rooms: lettura pubblica, creazione solo se loggato, update solo owner
DROP POLICY IF EXISTS "Read rooms"   ON community_rooms;
DROP POLICY IF EXISTS "Create rooms" ON community_rooms;
DROP POLICY IF EXISTS "Update rooms" ON community_rooms;
CREATE POLICY "Read rooms"   ON community_rooms FOR SELECT USING (true);
CREATE POLICY "Create rooms" ON community_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update rooms" ON community_rooms FOR UPDATE
  USING (auth.uid()::text = created_by);
-- FALLBACK (se created_by non è auth.uid): USING (auth.uid() IS NOT NULL)

-- community_messages: lettura pubblica, invio solo come se stessi, edit solo i propri
DROP POLICY IF EXISTS "Read messages"     ON community_messages;
DROP POLICY IF EXISTS "Send messages"     ON community_messages;
DROP POLICY IF EXISTS "Edit own messages" ON community_messages;
CREATE POLICY "Read messages"     ON community_messages FOR SELECT USING (true);
CREATE POLICY "Send messages"     ON community_messages FOR INSERT
  WITH CHECK (auth.uid()::text = author_id);
-- FALLBACK: WITH CHECK (auth.uid() IS NOT NULL)
CREATE POLICY "Edit own messages" ON community_messages FOR UPDATE
  USING (auth.uid()::text = author_id);
-- FALLBACK: USING (auth.uid() IS NOT NULL)

-- community_room_members: lettura pubblica, gestione solo della propria membership
DROP POLICY IF EXISTS "Read members"      ON community_room_members;
DROP POLICY IF EXISTS "Join room"         ON community_room_members;
DROP POLICY IF EXISTS "Update membership" ON community_room_members;
CREATE POLICY "Read members"      ON community_room_members FOR SELECT USING (true);
CREATE POLICY "Join room"         ON community_room_members FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Update membership" ON community_room_members FOR UPDATE
  USING (auth.uid()::text = user_id);

-- community_presence: lettura pubblica, upsert solo della propria presenza
DROP POLICY IF EXISTS "Read presence"   ON community_presence;
DROP POLICY IF EXISTS "Upsert presence" ON community_presence;
CREATE POLICY "Read presence"   ON community_presence FOR SELECT USING (true);
CREATE POLICY "Upsert presence" ON community_presence FOR ALL
  USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Tetto lunghezza messaggi (difesa anti DB-fill). NOT VALID = non valida le
-- righe già esistenti, si applica solo ai nuovi insert/update.
ALTER TABLE community_messages DROP CONSTRAINT IF EXISTS chk_msg_len;
ALTER TABLE community_messages
  ADD CONSTRAINT chk_msg_len CHECK (char_length(content) <= 8000) NOT VALID;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2) FORUM  (supabase/forum-schema.sql)
-- ─────────────────────────────────────────────────────────────────────────────

-- Thread / post: creazione solo come se stessi, modifica solo i propri
DROP POLICY IF EXISTS "Authenticated insert threads" ON forum_threads;
DROP POLICY IF EXISTS "Author update threads"        ON forum_threads;
CREATE POLICY "Authenticated insert threads" ON forum_threads FOR INSERT
  WITH CHECK (auth.uid()::text = author_id);
CREATE POLICY "Author update threads"        ON forum_threads FOR UPDATE
  USING (auth.uid()::text = author_id);

DROP POLICY IF EXISTS "Authenticated insert posts" ON forum_posts;
DROP POLICY IF EXISTS "Author update posts"        ON forum_posts;
CREATE POLICY "Authenticated insert posts" ON forum_posts FOR INSERT
  WITH CHECK (auth.uid()::text = author_id);
CREATE POLICY "Author update posts"        ON forum_posts FOR UPDATE
  USING (auth.uid()::text = author_id);

-- Reazioni / download: legati al proprio user_id
DROP POLICY IF EXISTS "Authenticated insert reactions" ON forum_reactions;
DROP POLICY IF EXISTS "Author delete reactions"        ON forum_reactions;
CREATE POLICY "Authenticated insert reactions" ON forum_reactions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Author delete reactions"        ON forum_reactions FOR DELETE
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Authenticated insert downloads" ON forum_downloads;
CREATE POLICY "Authenticated insert downloads" ON forum_downloads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Profili: modifica/inserimento solo del proprio
DROP POLICY IF EXISTS "Owner update profile" ON user_profiles;
DROP POLICY IF EXISTS "Insert own profile"   ON user_profiles;
CREATE POLICY "Owner update profile" ON user_profiles FOR UPDATE
  USING (auth.uid()::text = user_id);
CREATE POLICY "Insert own profile"   ON user_profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Amicizie / presenza / attività / notifiche / achievement: richiedono auth
DROP POLICY IF EXISTS "Insert friendships"     ON friendships;
DROP POLICY IF EXISTS "Update own friendships" ON friendships;
DROP POLICY IF EXISTS "Delete own friendships" ON friendships;
CREATE POLICY "Insert friendships"     ON friendships FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update own friendships" ON friendships FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Delete own friendships" ON friendships FOR DELETE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Update own presence" ON user_presence;
CREATE POLICY "Update own presence" ON user_presence FOR ALL
  USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Insert own activity" ON activity_feed;
CREATE POLICY "Insert own activity" ON activity_feed FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Insert notifications"     ON notifications;
DROP POLICY IF EXISTS "Update own notifications" ON notifications;
CREATE POLICY "Insert notifications"     ON notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Insert achievements" ON user_achievements;
CREATE POLICY "Insert achievements" ON user_achievements FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- DM (forum): conversazioni / partecipanti / messaggi
DROP POLICY IF EXISTS "Create conversations"     ON chat_conversations;
DROP POLICY IF EXISTS "Update own conversations" ON chat_conversations;
CREATE POLICY "Create conversations"     ON chat_conversations FOR INSERT WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "Update own conversations" ON chat_conversations FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Insert participants"     ON chat_participants;
DROP POLICY IF EXISTS "Update own participant"  ON chat_participants;
CREATE POLICY "Insert participants"     ON chat_participants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Update own participant"  ON chat_participants FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Send messages"     ON chat_messages;
DROP POLICY IF EXISTS "Edit own messages" ON chat_messages;
CREATE POLICY "Send messages"     ON chat_messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id);
CREATE POLICY "Edit own messages" ON chat_messages FOR UPDATE USING (auth.uid()::text = sender_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3) COMMUNITY HUB  (docs/supabase-schema.sql) — già quasi a posto
--    Restano da chiudere solo questi due punti aperti:
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users upload pack files" ON pack_files;
CREATE POLICY "Users upload pack files" ON pack_files FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated insert shared TM" ON shared_tm;
DROP POLICY IF EXISTS "Authenticated update shared TM" ON shared_tm;
CREATE POLICY "Authenticated insert shared TM" ON shared_tm FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update shared TM" ON shared_tm FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════════════════
-- FINE. Verifica rapida dopo il Run:
--   Da loggato → invia un messaggio: deve funzionare.
--   Senza login (solo anon key) → INSERT su community_messages: deve fallire.
-- ═══════════════════════════════════════════════════════════════════════════
