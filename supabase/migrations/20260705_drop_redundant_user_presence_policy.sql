-- Igiene RLS: rimuove una policy RIDONDANTE su user_presence.
--
-- "Users can manage their own presence" (cmd ALL, ruolo public,
--  qual/with_check: user_id = auth.uid()) è un doppione di "upres_write_own"
-- (cmd ALL, ruolo authenticated, stessa regola) introdotta insieme a 20260704.
-- NON è un buco anon: per un anon `user_id = auth.uid()` è NULL → la policy non
-- concede nulla. La togliamo solo per non lasciare una policy ruolo `public` che
-- fa sembrare la tabella scrivibile da anon. Le scritture restano coperte da
-- "upres_write_own" (authenticated); la lettura resta pubblica (upres_select_all).
--
-- Idempotente: DROP ... IF EXISTS.

DROP POLICY IF EXISTS "Users can manage their own presence" ON public.user_presence;

-- ── Fine migration ──
