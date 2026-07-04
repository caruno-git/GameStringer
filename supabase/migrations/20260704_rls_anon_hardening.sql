-- ════════════════════════════════════════════════════════════════════════════
-- RLS hardening — 2026-07-04
-- ════════════════════════════════════════════════════════════════════════════
-- Contesto: la anon key del Community Hub è PUBBLICA (spedita nel binario, by design).
-- La sicurezza dipende quindi SOLO dalle policy RLS. L'audit del 2026-07-04 ha trovato
-- 7 tabelle con una policy `allow_all` (ALL, ruolo public, USING true): chiunque abbia
-- la anon key può leggere/inserire/modificare/CANCELLARE liberamente, bypassando il login.
--
-- Idempotente (DROP POLICY IF EXISTS + CREATE, CREATE OR REPLACE) per il replay sui
-- Supabase Preview branch.
--
-- ⚠️⚠️  PREREQUISITO CRITICO PER LE SEZIONI B e C  ⚠️⚠️
-- Le nuove policy legano le scritture a `auth.uid()`, cioè richiedono che l'app operi
-- con una SESSIONE SUPABASE AUTENTICATA (come già fa il forum via il "bridge" auth.uid()
-- in lib/social/forum.ts). Se chat/presence/notifiche oggi scrivono con l'id del profilo
-- LOCALE come anon (senza sessione Supabase), applicare B/C ROMPE quelle feature.
-- → NON mergiare su produzione prima di aver testato l'app contro un PREVIEW branch.
-- ════════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════════
-- SEZIONE A — Hardening sicuro (nessun cambio di comportamento, applicabile subito)
-- ════════════════════════════════════════════════════════════════════════════

-- A1. search_path esplicito sulle function flaggate (difesa in profondità contro
--     hijack via schema mutabile). Nessun effetto sul comportamento.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'increment_download_count','cleanup_stale_presence','update_user_presence',
        'increment_thread_views','handle_shared_tm_upsert','update_like_counts',
        'total_downloads','total_translated_strings','update_thread_on_reply',
        'forum_reactions_like_count'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', r.sig);
  END LOOP;
END $$;


-- ════════════════════════════════════════════════════════════════════════════
-- SEZIONE B — Chiude le policy `allow_all` sulle 7 tabelle aperte
-- Modello: SELECT pubblico dove il dato è pubblico (presenze); scrittura/lettura
-- privata legata a auth.uid(). Helper SECURITY DEFINER per evitare la ricorsione
-- RLS sulle tabelle chat_*.
-- ⚠️ Richiede il prerequisito sopra. Testare su preview.
-- ════════════════════════════════════════════════════════════════════════════

-- Helper: sei partecipante della conversazione? (SECURITY DEFINER = bypassa RLS
-- interna su chat_participants, così le policy che lo usano non ricorrono).
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_participants p
    WHERE p.conversation_id = conv AND p.user_id = auth.uid()
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(uuid) FROM anon;

-- ── chat_conversations (id uuid) ──────────────────────────────────────────────
DROP POLICY IF EXISTS "allow_all" ON public.chat_conversations;
DROP POLICY IF EXISTS "conv_select_participant" ON public.chat_conversations;
DROP POLICY IF EXISTS "conv_insert_auth" ON public.chat_conversations;
CREATE POLICY "conv_select_participant" ON public.chat_conversations
  FOR SELECT TO authenticated USING (public.is_conversation_participant(id));
CREATE POLICY "conv_insert_auth" ON public.chat_conversations
  FOR INSERT TO authenticated WITH CHECK (true);

-- ── chat_participants (user_id uuid) ──────────────────────────────────────────
DROP POLICY IF EXISTS "allow_all" ON public.chat_participants;
DROP POLICY IF EXISTS "part_select_shared" ON public.chat_participants;
DROP POLICY IF EXISTS "part_insert_self" ON public.chat_participants;
DROP POLICY IF EXISTS "part_delete_self" ON public.chat_participants;
CREATE POLICY "part_select_shared" ON public.chat_participants
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_conversation_participant(conversation_id));
CREATE POLICY "part_insert_self" ON public.chat_participants
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_conversation_participant(conversation_id));
CREATE POLICY "part_delete_self" ON public.chat_participants
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── chat_messages (user_id uuid, conversation_id uuid) ────────────────────────
DROP POLICY IF EXISTS "allow_all" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "msg_select_participant" ON public.chat_messages;
DROP POLICY IF EXISTS "msg_insert_self" ON public.chat_messages;
DROP POLICY IF EXISTS "msg_update_own" ON public.chat_messages;
DROP POLICY IF EXISTS "msg_delete_own" ON public.chat_messages;
CREATE POLICY "msg_select_participant" ON public.chat_messages
  FOR SELECT TO authenticated USING (public.is_conversation_participant(conversation_id));
CREATE POLICY "msg_insert_self" ON public.chat_messages
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_conversation_participant(conversation_id));
CREATE POLICY "msg_update_own" ON public.chat_messages
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "msg_delete_own" ON public.chat_messages
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── community_presence (user_id TEXT) ─────────────────────────────────────────
DROP POLICY IF EXISTS "Upsert presence" ON public.community_presence;
DROP POLICY IF EXISTS "cpres_select_all" ON public.community_presence;
DROP POLICY IF EXISTS "cpres_write_own" ON public.community_presence;
CREATE POLICY "cpres_select_all" ON public.community_presence
  FOR SELECT USING (true);                        -- la presenza è info pubblica
CREATE POLICY "cpres_write_own" ON public.community_presence
  FOR ALL TO authenticated
  USING (user_id = (auth.uid())::text)
  WITH CHECK (user_id = (auth.uid())::text);

-- ── user_presence (user_id uuid) ──────────────────────────────────────────────
DROP POLICY IF EXISTS "allow_all" ON public.user_presence;
DROP POLICY IF EXISTS "upres_select_all" ON public.user_presence;
DROP POLICY IF EXISTS "upres_write_own" ON public.user_presence;
CREATE POLICY "upres_select_all" ON public.user_presence
  FOR SELECT USING (true);
CREATE POLICY "upres_write_own" ON public.user_presence
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── friendships (requester_id / addressee_id uuid) ────────────────────────────
DROP POLICY IF EXISTS "allow_all" ON public.friendships;
DROP POLICY IF EXISTS "Users can manage their friendship requests" ON public.friendships;
DROP POLICY IF EXISTS "fr_select_involved" ON public.friendships;
DROP POLICY IF EXISTS "fr_insert_requester" ON public.friendships;
DROP POLICY IF EXISTS "fr_update_involved" ON public.friendships;
DROP POLICY IF EXISTS "fr_delete_involved" ON public.friendships;
CREATE POLICY "fr_select_involved" ON public.friendships
  FOR SELECT TO authenticated USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE POLICY "fr_insert_requester" ON public.friendships
  FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());
CREATE POLICY "fr_update_involved" ON public.friendships
  FOR UPDATE TO authenticated USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE POLICY "fr_delete_involved" ON public.friendships
  FOR DELETE TO authenticated USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- ── notifications (user_id owner, sender_id uuid) ─────────────────────────────
-- NB: se le notifiche sono create da trigger/funzioni SECURITY DEFINER, bypassano
-- la RLS e non serve la policy INSERT lato client. La lascio legata al mittente
-- per il caso di insert client-side; rimuovila se non usata.
DROP POLICY IF EXISTS "allow_all" ON public.notifications;
DROP POLICY IF EXISTS "notif_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_delete_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_insert_sender" ON public.notifications;
CREATE POLICY "notif_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_update_own" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_delete_own" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_insert_sender" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());


-- ════════════════════════════════════════════════════════════════════════════
-- SEZIONE C — Igiene forum + RPC (⚠️ verificare che il bridge auth.uid() funzioni)
-- ════════════════════════════════════════════════════════════════════════════
-- Le policy "Community insert*" sono ruolo public e controllano solo
-- author_id IS NOT NULL → un anon può postare con autore FALSIFICATO. Erano un
-- fallback (migration 20260626) per quando il bridge auth.uid() non risolveva.
-- Rimuoverle SOLO se ora l'app posta sempre come utente Supabase autenticato,
-- altrimenti il forum smette di accettare post. Restano le "Authenticated insert*"
-- (author_id = auth.uid()). Testare su preview.
DROP POLICY IF EXISTS "Community insert threads" ON public.forum_threads;
DROP POLICY IF EXISTS "Auth insert threads"      ON public.forum_threads;
DROP POLICY IF EXISTS "Community insert posts"   ON public.forum_posts;
DROP POLICY IF EXISTS "Auth insert posts"        ON public.forum_posts;
DROP POLICY IF EXISTS "Auth insert reactions"    ON public.forum_reactions;
DROP POLICY IF EXISTS "Community insert reactions" ON public.forum_reactions;

-- RPC SECURITY DEFINER: togli l'esecuzione ad anon (restano per authenticated).
-- update_user_presence accetta un p_user_id arbitrario → spoof presenza da anon.
REVOKE EXECUTE ON FUNCTION public.update_user_presence(uuid, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.forum_reactions_like_count() FROM anon;

-- ── Fine migration ──
