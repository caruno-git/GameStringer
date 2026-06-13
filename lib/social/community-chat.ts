/**
 * 🗨️ Community Chat Service — Supabase Realtime
 * 
 * Chat realtime tra utenti autenticati GameStringer.
 * Supporta:
 * - Stanze generali (Generale, Traduzioni, Feedback, Annunci)
 * - Stanze per gioco specifico
 * - Messaggi testo, condivisione pack, richieste traduzione
 * - Presenza online/away/offline
 * - Reply a messaggi
 * - Realtime subscription via Supabase
 */

import { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { clientLogger } from '@/lib/client-logger';
import { getSupabase as getSharedSupabase } from './community-hub-backend';
import { initPresence, setPresenceStatus, getOnlineUsers as getUnifiedOnline, onPresenceUpdate, type OnlineUser, type PresenceStatus } from './presence';

// ─── TYPES ──────────────────────────────────────────────────────

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'game' | 'translation_request' | 'feedback' | 'announcement';
  gameId?: string;
  gameName?: string;
  createdBy?: string;
  isPinned: boolean;
  isArchived: boolean;
  lastMessageAt: string;
  memberCount: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  type: 'text' | 'system' | 'pack_share' | 'image' | 'translation_request';
  replyTo?: string;
  replyPreview?: string;
  metadata?: Record<string, unknown>;
  edited: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPresence {
  userId: string;
  username?: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

// ─── SUPABASE CLIENT HELPER ─────────────────────────────────────
// Delegates to the shared client from community-hub-backend to avoid
// "Multiple GoTrueClient instances" warnings.

async function getSupabase(): Promise<SupabaseClient> {
  return getSharedSupabase();
}

// ─── CHAT SERVICE ───────────────────────────────────────────────

export function isChatEnabled(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { isBackendEnabled } = require('./community-hub-backend');
    return isBackendEnabled();
  } catch {
    return false;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

// ─── GS ↔ SUPABASE AUTH BRIDGE ──────────────────────────────────

interface GSSessionInfo {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

function getGSSession(): GSSessionInfo | null {
  try {
    // 1. Try gamestringer_current_profile (primary — used by profile system)
    const rawProfile = localStorage.getItem('gamestringer_current_profile');
    if (rawProfile) {
      const p = JSON.parse(rawProfile);
      if (p?.id || p?.name) {
        const id = p.id || p.name;
        const email = p.email || `gs_${id}@gamestringer.local`;
        clientLogger.debug(`[Chat Bridge] Sessione GS trovata da gamestringer_current_profile: ${id} ${p.name}`);
        return { id, email, name: p.name || id, image: p.avatar_url || p.avatar_path || undefined };
      }
    }

    // 2. Try gs_session (has .user object)
    const rawSession = localStorage.getItem('gs_session');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session?.user?.id) {
        const u = session.user;
        const email = u.email || `gs_${u.id}@gamestringer.local`;
        clientLogger.debug(`[Chat Bridge] Sessione GS trovata da gs_session: ${u.id} ${u.name}`);
        return { id: u.id, email, name: u.name || u.id, image: u.image };
      }
    }

    // 3. Fallback: try gs_user directly
    const rawUser = localStorage.getItem('gs_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u?.id) {
        const email = u.email || `gs_${u.id}@gamestringer.local`;
        clientLogger.debug(`[Chat Bridge] Sessione GS trovata da gs_user: ${u.id} ${u.name}`);
        return { id: u.id, email, name: u.name || u.id, image: u.image };
      }
    }

    // 4. Fallback: try gs_accounts (pick first account)
    const rawAccounts = localStorage.getItem('gs_accounts');
    if (rawAccounts) {
      const accounts = JSON.parse(rawAccounts);
      if (Array.isArray(accounts) && accounts.length > 0) {
        const acc = accounts[0];
        const id = acc.userId || acc.id || 'unknown';
        const email = acc.email || `gs_${id}@gamestringer.local`;
        clientLogger.debug(`[Chat Bridge] Sessione GS trovata da gs_accounts: ${id} ${acc.name}`);
        return { id, email, name: acc.name || id, image: acc.image };
      }
    }

    clientLogger.debug('[Chat Bridge] Nessuna sessione GS trovata in localStorage');
    return null;
  } catch (e: unknown) {
    clientLogger.error(`[Chat Bridge] Errore lettura sessione GS: ${String(e)}`);
    return null;
  }
}

function derivePassword(gsId: string): string {
  // Deterministic password from GS user ID — not meant to be "secure" in the
  // traditional sense since this is a community feature, not a bank.
  return `gs_community_${gsId}_!Str1ng3r`;
}

/**
 * Auto-sync: if the user is logged into GS locally, automatically
 * sign them into Supabase (signup on first use, then signin).
 * Returns the Supabase user ID or null.
 */
export async function autoSyncGSToSupabase(): Promise<string | null> {
  const gs = getGSSession();
  if (!gs) return null;

  const supabase = await getSupabase();
  const password = derivePassword(gs.id);

  let authenticatedUserId: string | null = null;

  // Alcuni errori del backend community sono TRANSITORI (cold-start del DB,
  // 5xx tipo "Database error finding user", timeout, rete). In quei casi non ha
  // senso arrendersi e mostrare il login manuale: ritentiamo con backoff breve.
  const isTransient = (msg?: string): boolean =>
    !!msg && /database error|timeout|timed ?out|network|fetch|connection|terminated|unavailable|rate limit|50[0234]|52[0-9]/i.test(msg);

  // Un singolo tentativo completo: già-autenticato → sign-in → sign-up.
  // Ritorna l'uid (solo se c'è una SESSIONE valida) e se l'errore è transitorio.
  const tryAuthOnce = async (): Promise<{ uid: string | null; transient: boolean }> => {
    // a) Sessione Supabase già presente (persistita tra i riavvii)?
    const { data: current } = await supabase.auth.getUser();
    if (current?.user?.id) return { uid: current.user.id, transient: false };

    // b) Sign-in (utente esistente)
    const { data: si, error: siErr } = await supabase.auth.signInWithPassword({ email: gs.email!, password });
    if (si?.user?.id && si.session) {
      clientLogger.debug(`[Chat Bridge] Sign-in riuscito: ${si.user.id}`);
      return { uid: si.user.id, transient: false };
    }
    if (siErr && isTransient(siErr.message)) return { uid: null, transient: true };

    // c) Sign-up (primo accesso)
    const { data: su, error: suErr } = await supabase.auth.signUp({
      email: gs.email!,
      password,
      options: { data: { username: gs.name || gs.id, avatar_url: gs.image || '', gs_id: gs.id }, emailRedirectTo: undefined },
    });
    if (suErr) {
      if (isTransient(suErr.message)) return { uid: null, transient: true };
      // Account già registrato → ritenta il sign-in (password deterministica).
      if (/already registered|already exists|user already/i.test(suErr.message)) {
        const { data: si2, error: si2Err } = await supabase.auth.signInWithPassword({ email: gs.email!, password });
        if (si2?.user?.id && si2.session) return { uid: si2.user.id, transient: false };
        return { uid: null, transient: isTransient(si2Err?.message) };
      }
      clientLogger.error(`[Chat Bridge] Sign-up fallito: ${suErr.message}`);
      return { uid: null, transient: false };
    }
    if (su?.user?.id && su.session) {
      clientLogger.debug(`[Chat Bridge] Sign-up riuscito: ${su.user.id}`);
      return { uid: su.user.id, transient: false };
    }
    // Utente creato ma senza sessione (es. conferma email attiva) → prova sign-in.
    if (su?.user?.id) {
      const { data: si3 } = await supabase.auth.signInWithPassword({ email: gs.email!, password });
      if (si3?.user?.id && si3.session) return { uid: si3.user.id, transient: false };
      return { uid: null, transient: true };
    }
    return { uid: null, transient: false };
  };

  const MAX_ATTEMPTS = 3;
  for (let attempt = 0; attempt < MAX_ATTEMPTS && !authenticatedUserId; attempt++) {
    try {
      const { uid, transient } = await tryAuthOnce();
      if (uid) { authenticatedUserId = uid; break; }
      if (!transient) break; // fallimento permanente: inutile insistere
      clientLogger.debug(`[Chat Bridge] Errore transitorio, ritento (${attempt + 1}/${MAX_ATTEMPTS})...`);
    } catch (e: unknown) {
      clientLogger.warn(`[Chat Bridge] Eccezione auth (tentativo ${attempt + 1}): ${String(e)}`);
      // eccezione di rete → trattala come transitoria e ritenta
    }
    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise(r => setTimeout(r, 600 * Math.pow(2, attempt))); // 600ms, 1200ms
    }
  }

  if (!authenticatedUserId) return null;

  // 4. Ensure user_profiles row exists (prevents FK errors on presence/membership)
  if (authenticatedUserId) {
    try {
      // Lo schema reale di `user_profiles` (vedi docs/supabase-schema.sql) ha
      // `id UUID PRIMARY KEY REFERENCES auth.users(id)`: la chiave è proprio
      // l'ID di Supabase Auth. Usiamo `id` come chiave di lookup e di insert.
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', authenticatedUserId)
        .maybeSingle();

      if (!existingProfile) {
        const username = gs.name || `gs_${gs.id.substring(0, 8)}`;
        clientLogger.debug(`[Chat Bridge] Profilo mancante, creo via RPC per: ${authenticatedUserId} ${username}`);

        // Try RPC first (SECURITY DEFINER, bypasses RLS)
        const { error: rpcErr } = await supabase.rpc('ensure_user_profile', {
          p_user_id: authenticatedUserId,
          p_username: username,
          p_email: gs.email || null,
          p_avatar_url: gs.image || '',
        });

        if (rpcErr) {
          clientLogger.warn(`[Chat Bridge] RPC ensure_user_profile fallita: ${rpcErr.message} - provo INSERT diretto`);
          // Fallback: direct insert. `id` deve combaciare con l'auth user id
          // (è una FK verso auth.users), e lo schema include `email`.
          const { error: insertErr } = await supabase.from('user_profiles').insert({
            id: authenticatedUserId,
            username,
            email: gs.email,
            avatar_url: gs.image || '',
          });
          if (insertErr) {
            clientLogger.error(`[Chat Bridge] INSERT user_profiles fallita: ${insertErr.message} ${insertErr.code}`);
          } else {
            clientLogger.debug('[Chat Bridge] Profilo creato via INSERT diretto');
          }
        } else {
          clientLogger.debug('[Chat Bridge] Profilo creato via RPC');
        }
      } else {
        clientLogger.debug(`[Chat Bridge] Profilo già esistente per: ${authenticatedUserId}`);
      }
    } catch (e: unknown) {
      clientLogger.error(`[Chat Bridge] Errore verifica/creazione profilo: ${String(e)}`);
    }
  }

  return authenticatedUserId;
}

// ─── ROOMS ──────────────────────────────────────────────────────

export async function fetchRooms(): Promise<ChatRoom[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('community_rooms')
    .select('*')
    .eq('is_archived', false)
    .order('is_pinned', { ascending: false })
    .order('last_message_at', { ascending: false });

  if (error) {
    // Tabelle non ancora create: ritorna array vuoto invece di throw
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      clientLogger.warn('[CommunityChat] Tabelle community_* non trovate. Applica supabase/community-chat-schema.sql');
      return [];
    }
    throw new Error(`Errore caricamento stanze: ${error.message}`);
  }
  // Deduplicate rooms by name (keep the one with most recent activity)
  const mapped = (data || []).map(mapRoom);
  const seen = new Map<string, ChatRoom>();
  for (const room of mapped) {
    if (!seen.has(room.name)) {
      seen.set(room.name, room);
    }
  }
  return Array.from(seen.values());
}

export async function createRoom(name: string, description: string, type: ChatRoom['type'], gameId?: string, gameName?: string): Promise<ChatRoom> {
  const supabase = await getSupabase();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('community_rooms').insert({
    name,
    description,
    type,
    game_id: gameId || null,
    game_name: gameName || null,
    created_by: userId,
  }).select().single();

  if (error) throw new Error(`Errore creazione stanza: ${error.message}`);
  return mapRoom(data);
}

// ─── MESSAGES ───────────────────────────────────────────────────

export async function fetchMessages(roomId: string, limit = 50, before?: string): Promise<ChatMessage[]> {
  const supabase = await getSupabase();
  let query = supabase
    .from('community_messages')
    .select('*')
    .eq('room_id', roomId)
    .eq('deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;
  if (error) {
    // Tabelle non ancora create: ritorna array vuoto invece di throw
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      clientLogger.warn('[CommunityChat] Tabella community_messages non trovata. Applica supabase/community-chat-schema.sql');
      return [];
    }
    throw new Error(`Errore caricamento messaggi: ${error.message || error.code || JSON.stringify(error)}`);
  }
  if (!data || data.length === 0) return [];

  // Fetch profili separatamente per evitare errori FK 400
  const authorIds = [...new Set(data.map(m => m.author_id).filter(Boolean))];
  const profilesMap = await fetchProfilesMap(authorIds);

  return data.map(row => mapMessageWithProfile(row, profilesMap)).reverse();
}

// Cache to avoid repeated failed queries
let _chatProfileQueryFailed = false;
let _chatProfileQueryFailedAt = 0;

async function fetchProfilesMap(userIds: string[]): Promise<Map<string, { username: string; avatar_url: string | null }>> {
  const map = new Map<string, { username: string; avatar_url: string | null }>();
  if (userIds.length === 0) return map;
  
  // Skip if recent query failed (avoid spamming 400 errors)
  if (_chatProfileQueryFailed && Date.now() - _chatProfileQueryFailedAt < 60000) {
    return map;
  }
  
  try {
    const supabase = await getSupabase();
    // Lo schema reale di `user_profiles` (vedi docs/supabase-schema.sql) usa
    // `id UUID PRIMARY KEY REFERENCES auth.users(id)`: la chiave è proprio
    // l'ID di Supabase Auth, non una colonna `user_id` separata. I metodi di
    // filtro di Supabase (.eq, .in) ritornano una nuova query e non mutano
    // in place: dobbiamo riassegnare, altrimenti la query parte senza filtro
    // e Supabase risponde 400.
    let query = supabase
      .from('user_profiles')
      .select('id, username, avatar_url');

    if (userIds.length === 1) {
      query = query.eq('id', userIds[0]);
    } else {
      query = query.in('id', userIds);
    }

    const { data, error } = await query;

    if (error) {
      clientLogger.error(
        `[Chat Bridge] fetchProfilesMap error — code: ${error.code} | message: ${error.message} | details: ${error.details} | hint: ${error.hint}`
      );
      _chatProfileQueryFailed = true;
      _chatProfileQueryFailedAt = Date.now();
      return map;
    }

    _chatProfileQueryFailed = false;

    if (data) {
      data.forEach(p => {
        if (p.id) map.set(p.id as string, { username: p.username as string, avatar_url: p.avatar_url as string | null });
      });
    }
  } catch {
    _chatProfileQueryFailed = true;
    _chatProfileQueryFailedAt = Date.now();
  }
  return map;
}

function mapMessageWithProfile(row: Record<string, unknown>, profiles: Map<string, { username: string; avatar_url: string | null }>): ChatMessage {
  const profile = profiles.get(row.author_id as string);
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    authorId: row.author_id as string,
    authorName: profile?.username || 'Utente',
    authorAvatar: profile?.avatar_url || undefined,
    content: row.content as string,
    type: (row.type as ChatMessage['type']) || 'text',
    replyTo: row.reply_to as string | undefined,
    metadata: (row.metadata as Record<string, unknown>) || {},
    edited: (row.edited as boolean) || false,
    deleted: (row.deleted as boolean) || false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function sendMessage(
  roomId: string,
  content: string,
  type: ChatMessage['type'] = 'text',
  replyTo?: string,
  metadata?: Record<string, unknown>
): Promise<ChatMessage> {
  const supabase = await getSupabase();
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Devi essere autenticato per inviare messaggi');

  const { data, error } = await supabase.from('community_messages').insert({
    room_id: roomId,
    author_id: userId,
    content,
    type,
    reply_to: replyTo || null,
    metadata: metadata || {},
  }).select('*').single();

  if (error) throw new Error(`Errore invio messaggio: ${error.message || error.code || JSON.stringify(error)}`);
  
  // Fetch profilo autore separatamente
  const profilesMap = await fetchProfilesMap([userId]);
  return mapMessageWithProfile(data, profilesMap);
}

export async function editMessage(messageId: string, newContent: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from('community_messages').update({
    content: newContent,
    edited: true,
    updated_at: new Date().toISOString(),
  }).eq('id', messageId);
  if (error) throw new Error(`Errore modifica: ${error.message}`);
}

export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from('community_messages').update({
    deleted: true,
    content: '[messaggio eliminato]',
  }).eq('id', messageId);
  if (error) throw new Error(`Errore eliminazione: ${error.message}`);
}

// ─── REALTIME SUBSCRIPTIONS ─────────────────────────────────────

export type MessageCallback = (message: ChatMessage) => void;
export type PresenceCallback = (presence: UserPresence[]) => void;

let _messageSubscription: RealtimeChannel | null = null;
const _presenceSubscription: RealtimeChannel | null = null;

export async function subscribeToRoom(roomId: string, onMessage: MessageCallback): Promise<() => void> {
  const supabase = await getSupabase();

  // Unsubscribe previous if exists
  if (_messageSubscription) {
    supabase.removeChannel(_messageSubscription);
    _messageSubscription = null;
  }

  const channel = supabase
    .channel(`community-room-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `room_id=eq.${roomId}`,
      },
      async (payload: { new: Record<string, unknown> }) => {
        // Fetch profilo separatamente per evitare errori FK 400
        try {
          const authorId = payload.new.author_id as string;
          const profilesMap = await fetchProfilesMap(authorId ? [authorId] : []);
          onMessage(mapMessageWithProfile(payload.new, profilesMap));
        } catch {
          // Fallback: usa payload senza profilo
          onMessage(mapMessageWithProfile(payload.new, new Map()));
        }
      }
    )
    .subscribe();

  _messageSubscription = channel;

  return () => {
    supabase.removeChannel(channel);
    _messageSubscription = null;
  };
}

export async function subscribeToPresence(onPresence: PresenceCallback): Promise<() => void> {
  // Delegate to unified presence system
  // The unified system handles Realtime + DB fallback + heartbeat
  const unsub = onPresenceUpdate((users: OnlineUser[]) => {
    // Convert OnlineUser to UserPresence for backward compatibility
    onPresence(users.map(u => ({
      userId: u.userId,
      username: u.username,
      avatar: u.avatar || undefined,
      status: u.status === 'busy' ? 'online' : u.status,
      lastSeen: u.lastHeartbeat,
    })));
  });

  // Also init presence for current user if not already done
  const userId = await getCurrentUserId();
  if (userId) {
    await initPresence(userId);
  }

  return unsub;
}

// ─── PRESENCE ───────────────────────────────────────────────────

export async function updatePresence(status: 'online' | 'away' | 'offline'): Promise<void> {
  try {
    // Delegate to unified presence system
    await setPresenceStatus(status as PresenceStatus);
  } catch {
    // Silent fail — presence is best-effort
  }
}

export async function getOnlineUsers(): Promise<UserPresence[]> {
  // Delegate to unified presence system
  const users = getUnifiedOnline();
  return users.map(u => ({
    userId: u.userId,
    username: u.username,
    avatar: u.avatar || undefined,
    status: (u.status === 'busy' ? 'online' : u.status) as UserPresence['status'],
    lastSeen: u.lastHeartbeat,
  }));
}

// ─── ROOM MEMBERSHIP ────────────────────────────────────────────

export async function joinRoom(roomId: string): Promise<void> {
  const supabase = await getSupabase();
  const userId = await getCurrentUserId();
  if (!userId) return;
  try {
    await supabase.from('community_room_members').upsert(
      { room_id: roomId, user_id: userId, last_read_at: new Date().toISOString() },
      { onConflict: 'room_id,user_id' }
    );
  } catch {
    // Silent fail — membership is best-effort
  }
}

export async function markRoomRead(roomId: string): Promise<void> {
  const supabase = await getSupabase();
  const userId = await getCurrentUserId();
  if (!userId) return;
  try {
    await supabase.from('community_room_members').upsert(
      { room_id: roomId, user_id: userId, last_read_at: new Date().toISOString() },
      { onConflict: 'room_id,user_id' }
    );
  } catch {
    // Silent fail
  }
}

// ─── MAPPERS ────────────────────────────────────────────────────

function mapRoom(row: Record<string, unknown>): ChatRoom {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    type: row.type as ChatRoom['type'],
    gameId: row.game_id as string | undefined,
    gameName: row.game_name as string | undefined,
    createdBy: row.created_by as string | undefined,
    isPinned: (row.is_pinned as boolean) || false,
    isArchived: (row.is_archived as boolean) || false,
    lastMessageAt: row.last_message_at as string,
    memberCount: (row.member_count as number) || 0,
    createdAt: row.created_at as string,
  };
}


