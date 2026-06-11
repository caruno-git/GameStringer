'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  Send,
  Hash,
  Plus,
  Reply,
  Edit3,
  Trash2,
  Gamepad2,
  Bug,
  Megaphone,
  Globe,
  Loader2,
  LogIn,
  X,
  Minimize2,
  Maximize2,
  ChevronDown,
  Languages,
  RefreshCw,
  AlertCircle,
  Users,
  UserPlus,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import {
  isChatEnabled,
  getCurrentUserId,
  autoSyncGSToSupabase,
  fetchRooms,
  fetchMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  createRoom,
  subscribeToRoom,
  subscribeToPresence,
  updatePresence,
  joinRoom,
  markRoomRead,
  type ChatRoom,
  type ChatMessage,
  type UserPresence,
} from '@/lib/social/community-chat';
import { getSupabase } from '@/lib/social/community-hub-backend';
import { translateChatMessage } from '@/lib/ai/ai-translate-direct';
import { clientLogger } from '@/lib/client-logger';

// ─── Room icon helper ───────────────────────────────────────────

function getRoomIcon(type: ChatRoom['type']) {
  switch (type) {
    case 'game': return <Gamepad2 className="h-3.5 w-3.5 text-emerald-400" />;
    case 'feedback': return <Bug className="h-3.5 w-3.5 text-amber-400" />;
    case 'announcement': return <Megaphone className="h-3.5 w-3.5 text-red-400" />;
    case 'translation_request': return <Globe className="h-3.5 w-3.5 text-cyan-400" />;
    default: return <Hash className="h-3.5 w-3.5 text-slate-400" />;
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'ora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m fa`;
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ─── PERSISTENT CHAT WIDGET ─────────────────────────────────────

export function PersistentChat() {
  const { t } = useTranslation();
  const _pathname = usePathname();
  const [open, setOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gs_chat_open') === 'true';
    }
    return false;
  });
  const [expanded, setExpanded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomType, setNewRoomType] = useState<ChatRoom['type']>('general');
  const [showRooms, setShowRooms] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [autoTranslate, setAutoTranslate] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('gs_chat_auto_translate') === 'true';
    return false;
  });
  const { language } = useTranslation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const unsubMessageRef = useRef<(() => void) | null>(null);
  const unsubPresenceRef = useRef<(() => void) | null>(null);

  // Persist open state
  useEffect(() => {
    localStorage.setItem('gs_chat_open', String(open));
  }, [open]);

  // ─── Init ───────────────────────────────────────────────────
  useEffect(() => {
    const chatEnabled = isChatEnabled();
    setEnabled(chatEnabled);
    if (!chatEnabled) {
      setIsLoading(false);
      return;
    }

    let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;
    let initRetryTimeout: ReturnType<typeof setTimeout> | null = null;
    let maxTimeout: ReturnType<typeof setTimeout> | null = null;
    let mainLayoutAuthTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryCount = 0;
    let authHandled = false;
    const MAX_RETRIES = 3;
    const MAX_LOAD_TIME = 15000; // 15s max loading time
    const MAIN_LAYOUT_WAIT_MS = 3000; // Wait 3s for main-layout auth

    const timeout = <T,>(promise: Promise<T>, ms: number): Promise<T | null> =>
      Promise.race([promise, new Promise<null>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)).catch(() => null)]);

    const doInit = async (uid: string | null) => {
      try {
        setUserId(uid);
        
        if (uid) {
          setLoadError(null); // Clear any previous timeout error
          const chatRooms = await timeout(fetchRooms(), 8000).catch((err) => {
            clientLogger.warn('[PersistentChat] fetchRooms failed:', err);
            setLoadError('Impossibile caricare le stanze. Riprova più tardi.');
            return [] as ChatRoom[];
          }) ?? [] as ChatRoom[];
          setRooms(chatRooms);
          if (chatRooms.length > 0 && !activeRoom) {
            setActiveRoom(chatRooms[0]);
          }
          
          // Clear error on success
          if (chatRooms.length > 0) setLoadError(null);
          
          updatePresence('online').catch(() => {});
          unsubPresenceRef.current = await timeout(subscribeToPresence((users) => {
            setOnlineUsers(users);
          }), 5000).catch(() => null);
        } else if (retryCount < MAX_RETRIES) {
          // Retry after delay if no uid yet
          retryCount++;
          clientLogger.debug(`[PersistentChat] No uid, scheduling retry ${retryCount}/${MAX_RETRIES} in 3s...`);
          initRetryTimeout = setTimeout(() => fallbackInit(), 3000);
        } else {
          clientLogger.warn('[PersistentChat] Max retries reached, no uid available');
          setLoadError('Impossibile connettersi. Verifica la connessione e riprova.');
        }
      } catch (e: unknown) {
        const errObj = e as { message?: string; code?: string; details?: string };
        const errMsg = e instanceof Error 
          ? e.message 
          : errObj?.message || errObj?.code || errObj?.details || JSON.stringify(e) || 'Unknown error';
        clientLogger.error(`[PersistentChat] Init error: ${errMsg}`, { raw: String(e) });
        setLoadError('Errore di connessione. Riprova.');
      } finally {
        setIsLoading(false);
        // Cancel max timeout since init completed (success or fail)
        if (maxTimeout) { clearTimeout(maxTimeout); maxTimeout = null; }
      }
    };

    const fallbackInit = async () => {
      if (authHandled) return;
      authHandled = true;
      
      try {
        clientLogger.debug('[PersistentChat] Starting fallback init, retry:', retryCount);
        setLoadError(null);
        let uid = await timeout(getCurrentUserId(), 8000).catch((err) => {
          clientLogger.debug('[PersistentChat] getCurrentUserId failed:', err);
          return null;
        });
        
        if (!uid) {
          clientLogger.debug('[PersistentChat] No uid from getCurrentUserId, trying autoSync...');
          uid = await timeout(autoSyncGSToSupabase(), 8000).catch((err) => {
            clientLogger.warn('[PersistentChat] autoSyncGSToSupabase failed:', err);
            return null;
          });
          if (uid) {
            clientLogger.debug('[PersistentChat] autoSync succeeded, uid:', uid);
          }
        } else {
          clientLogger.debug('[PersistentChat] Got uid from getCurrentUserId:', uid);
        }
        
        await doInit(uid);
      } catch (e: unknown) {
        clientLogger.error('[PersistentChat] Fallback init error:', e);
        setLoadError('Errore di connessione. Riprova.');
        setIsLoading(false);
      }
    };

    // Listen for auth events from main-layout (which runs autoSync first)
    const handleAuthed = (e: CustomEvent<{ userId: string }>) => {
      if (authHandled) return;
      authHandled = true;
      clientLogger.debug('[PersistentChat] Received gs-chat-authed event, uid:', e.detail.userId);
      if (mainLayoutAuthTimeout) clearTimeout(mainLayoutAuthTimeout);
      doInit(e.detail.userId);
    };

    const handleAuthFailed = () => {
      if (authHandled) return;
      clientLogger.debug('[PersistentChat] Received gs-chat-auth-failed event, trying fallback');
      fallbackInit();
    };

    window.addEventListener('gs-chat-authed', handleAuthed as EventListener);
    window.addEventListener('gs-chat-auth-failed', handleAuthFailed);

    // Set max loading timeout
    maxTimeout = setTimeout(() => {
      if (isLoading) {
        clientLogger.warn('[PersistentChat] Max loading time exceeded');
        setIsLoading(false);
        setLoadError('Tempo di caricamento troppo lungo. Riprova.');
      }
    }, MAX_LOAD_TIME);

    // Wait for main-layout to auth, then fallback if needed
    mainLayoutAuthTimeout = setTimeout(() => {
      if (!authHandled) {
        clientLogger.debug('[PersistentChat] No auth event from main-layout, trying fallback init');
        fallbackInit();
      }
    }, MAIN_LAYOUT_WAIT_MS);

    // ─── Subscribe to Supabase auth state changes ─────────────────
    const setupAuthListener = async () => {
      try {
        const supabase = await getSupabase();
        authSubscription = supabase.auth.onAuthStateChange((event, session) => {
          clientLogger.debug(`[PersistentChat] Auth state changed: ${event}, uid: ${session?.user?.id ?? 'none'}`);
          if (event === 'SIGNED_IN' && session?.user?.id) {
            setUserId(session.user.id);
            // Re-init rooms and presence
            fallbackInit();
          } else if (event === 'SIGNED_OUT') {
            setUserId(null);
          }
        });
      } catch (err) {
        clientLogger.warn('[PersistentChat] Failed to setup auth listener:', err);
      }
    };
    setupAuthListener();

    return () => {
      unsubMessageRef.current?.();
      unsubPresenceRef.current?.();
      if (initRetryTimeout) clearTimeout(initRetryTimeout);
      if (maxTimeout) clearTimeout(maxTimeout);
      if (mainLayoutAuthTimeout) clearTimeout(mainLayoutAuthTimeout);
      window.removeEventListener('gs-chat-authed', handleAuthed as EventListener);
      window.removeEventListener('gs-chat-auth-failed', handleAuthFailed);
      authSubscription?.data?.subscription?.unsubscribe();
      updatePresence('offline').catch(() => {});
    };
  }, []);

  // ─── Room change → load messages + subscribe ────────────────
  useEffect(() => {
    if (!activeRoom || !open) return;

    const loadRoom = async () => {
      try {
        const msgs = await fetchMessages(activeRoom.id, 50);
        setMessages(msgs);
        await joinRoom(activeRoom.id);
        await markRoomRead(activeRoom.id);

        unsubMessageRef.current?.();
        unsubMessageRef.current = await subscribeToRoom(activeRoom.id, (newMsg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Notifica per messaggi di altri utenti
            if (newMsg.authorId !== userId) {
              if (!open) setUnreadCount((c) => c + 1);
              // Notifica OS via tray (se finestra non in focus)
              window.dispatchEvent(new CustomEvent('gs-chat-message', {
                detail: { author: newMsg.authorName || newMsg.authorId, content: newMsg.content }
              }));
              // Suono notifica (breve beep)
              try {
                const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 800;
                osc.type = 'sine';
                gain.gain.value = 0.08;
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.15);
              } catch {}
            }
            return [...prev, newMsg];
          });
        });
      } catch (e: unknown) {
        const errObj = e as { message?: string; code?: string; details?: string; hint?: string; status?: number };
        const errMsg = e instanceof Error 
          ? e.message 
          : errObj?.message || errObj?.code || errObj?.details || JSON.stringify(e) || 'Unknown error';
        clientLogger.error(`[PersistentChat] Load room error: ${errMsg}`, {
          message: errObj?.message,
          code: errObj?.code,
          details: errObj?.details,
          hint: errObj?.hint,
          status: errObj?.status,
          raw: String(e),
        });
      }
    };
    loadRoom();

    return () => {
      unsubMessageRef.current?.();
    };
  }, [activeRoom?.id, open]);

  // ─── Auto-scroll ────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear unread when opening
  useEffect(() => {
    if (open) setUnreadCount(0);
  }, [open]);

  // ─── Send message ───────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!messageInput.trim() || !activeRoom || isSending) return;

    const content = messageInput.trim();
    setIsSending(true);
    setMessageInput('');

    try {
      if (editingMsg) {
        await editMessage(editingMsg.id, content);
        setMessages((prev) =>
          prev.map((m) => (m.id === editingMsg.id ? { ...m, content, edited: true } : m))
        );
        setEditingMsg(null);
      } else {
        await sendMessage(activeRoom.id, content, 'text', replyTo?.id);
        setReplyTo(null);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Errore invio messaggio';
      toast.error(msg);
      setMessageInput(content);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [messageInput, activeRoom, isSending, editingMsg, replyTo]);

  // ─── Delete message ─────────────────────────────────────────
  const handleDelete = async (msg: ChatMessage) => {
    try {
      await deleteMessage(msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, deleted: true, content: '[messaggio eliminato]' } : m))
      );
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Errore eliminazione';
      toast.error(errMsg);
    }
  };

  // ─── Translate message ──────────────────────────────────────
  const handleTranslateMessage = useCallback(async (msg: ChatMessage) => {
    if (translatedMessages[msg.id]) {
      setTranslatedMessages(prev => {
        const next = { ...prev };
        delete next[msg.id];
        return next;
      });
      return;
    }
    setTranslatingIds(prev => new Set(prev).add(msg.id));
    try {
      const LANG_MAP: Record<string, string> = {
        it: 'Italian', en: 'English', es: 'Spanish', de: 'German',
        fr: 'French', pt: 'Portuguese', ja: 'Japanese', zh: 'Chinese',
        ko: 'Korean', ru: 'Russian', pl: 'Polish',
      };
      const targetLang = LANG_MAP[language] || 'Italian';
      const { translated } = await translateChatMessage(
        msg.content, targetLang,
      );
      setTranslatedMessages(prev => ({ ...prev, [msg.id]: translated }));
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Errore traduzione';
      toast.error(errMsg);
    } finally {
      setTranslatingIds(prev => { const next = new Set(prev); next.delete(msg.id); return next; });
    }
  }, [language, translatedMessages]);

  const toggleAutoTranslate = useCallback(() => {
    setAutoTranslate(prev => {
      const next = !prev;
      localStorage.setItem('gs_chat_auto_translate', String(next));
      return next;
    });
  }, []);

  const detectLangTag = useCallback((text: string): string | null => {
    if (/[\u0400-\u04FF]{3,}/.test(text)) return 'RU';
    if (/[\u4E00-\u9FFF]{2,}/.test(text)) return 'ZH';
    if (/[\u3040-\u309F\u30A0-\u30FF]{2,}/.test(text)) return 'JA';
    if (/[\uAC00-\uD7AF]{2,}/.test(text)) return 'KO';
    if (/[\u0600-\u06FF]{3,}/.test(text)) return 'AR';
    if (/[\u0E00-\u0E7F]{3,}/.test(text)) return 'TH';
    const LANG_HINTS: Record<string, RegExp> = {
      EN: /\b(the|and|this|that|with|have|from|they|what|your)\b/i,
      ES: /\b(que|los|las|por|una|con|para|esta|pero|como)\b/i,
      DE: /\b(und|die|der|das|ist|nicht|ein|ich|sich|auf)\b/i,
      FR: /\b(les|des|une|que|est|pas|pour|dans|sur|avec)\b/i,
      PT: /\b(que|não|para|com|uma|dos|está|isso|mais|por)\b/i,
    };
    const appLang = language.toUpperCase();
    for (const [lang, re] of Object.entries(LANG_HINTS)) {
      if (lang !== appLang && re.test(text)) return lang;
    }
    return null;
  }, [language]);

  useEffect(() => {
    if (!autoTranslate || messages.length === 0) return;
    for (const msg of messages) {
      if (msg.deleted || msg.authorId === userId) continue;
      if (translatedMessages[msg.id] || translatingIds.has(msg.id)) continue;
      const lang = detectLangTag(msg.content);
      if (lang) handleTranslateMessage(msg);
    }
  }, [autoTranslate, messages, userId, translatedMessages, translatingIds, detectLangTag, handleTranslateMessage]);

  // ─── Create room ────────────────────────────────────────────
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const room = await createRoom(newRoomName.trim(), newRoomDesc.trim(), newRoomType);
      setRooms((prev) => [room, ...prev]);
      setActiveRoom(room);
      setShowNewRoom(false);
      setNewRoomName('');
      setNewRoomDesc('');
      toast.success(t('common.stanzaCreata'));
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Errore creazione stanza';
      toast.error(errMsg);
    }
  };

  // Don't render if chat backend not configured
  if (!enabled) return null;

  const chatWidth = expanded ? 'w-[520px]' : 'w-[380px]';
  const chatHeight = expanded ? 'h-[650px]' : 'h-[480px]';

  // ─── FLOATING TOGGLE BUTTON ─────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[60] group flex items-center gap-2 px-3 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/50 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
      >
        <MessageSquare className="h-4 w-4 text-cyan-400" />
        <span className="text-xs font-medium text-slate-200">{t('communityChat.chat')}</span>
        
        {/* Online indicator */}
        {onlineUsers.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {onlineUsers.length}
          </span>
        )}
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // ─── CHAT PANEL ─────────────────────────────────────────────

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-50 ${chatWidth} ${chatHeight} flex flex-col rounded-2xl border border-slate-600/40 bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-2xl shadow-2xl shadow-black/60 transition-all duration-300 ring-1 ring-white/5`}>
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">{t('communityChat.communityChatTitle')}</span>
              {onlineUsers.length > 0 && (
                <button 
                  onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                  className="flex items-center gap-1 mt-0.5 hover:bg-emerald-500/10 rounded px-1 -ml-1 transition-colors"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">{t('communityChat.onlineCount').replace('{{count}}', String(onlineUsers.length))}</span>
                  <Users className="h-3 w-3 text-emerald-400/60 ml-0.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg hover:bg-white/10" onClick={() => setExpanded(!expanded)}>
              {expanded ? <Minimize2 className="h-4 w-4 text-slate-300" /> : <Maximize2 className="h-4 w-4 text-slate-300" />}
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg hover:bg-red-500/20 hover:text-red-400" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 text-slate-300" />
            </Button>
          </div>
        </div>

        {/* ── Online Users Panel ── */}
        {showOnlineUsers && onlineUsers.length > 0 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-700/30 bg-emerald-500/5">
              <button onClick={() => setShowOnlineUsers(false)} className="p-1 hover:bg-slate-700/50 rounded">
                <ArrowLeft className="h-4 w-4 text-slate-400" />
              </button>
              <Users className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">{t('communityChat.onlineUsers').replace('{{count}}', String(onlineUsers.length))}</span>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {onlineUsers.map(user => (
                  <div
                    key={user.userId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/40 transition-colors group"
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9 border border-slate-600/50">
                        {user.avatar && !user.avatar.startsWith('gradient-') && !user.avatar.startsWith('avatar_') && <AvatarImage src={user.avatar} />}
                        <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-cyan-600 text-white text-xs">
                          {(user.username || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        user.status === 'online' ? 'bg-emerald-500' : user.status === 'away' ? 'bg-yellow-500' : 'bg-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.username || t('communityChat.userDefault')}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.status}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-7 w-7 p-0 hover:bg-cyan-500/20 hover:text-cyan-400"
                        title={t('communityChat.sendMessage')}
                        onClick={() => {
                          setShowOnlineUsers(false);
                          setMessageInput(`@${user.username || t('communityChat.userDefault').toLowerCase()} `);
                          inputRef.current?.focus();
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-7 w-7 p-0 hover:bg-emerald-500/20 hover:text-emerald-400"
                        title="Aggiungi amico"
                        onClick={() => {
                          toast.info(`Richiesta amicizia inviata a ${user.username}`);
                        }}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading && !loadError && !showOnlineUsers && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && loadError && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-4">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <p className="text-xs text-slate-400">{loadError}</p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                setIsLoading(true);
                setLoadError(null);
                window.location.reload();
              }}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Ricarica
            </Button>
          </div>
        )}

        {/* ── Not authenticated ── */}
        {!isLoading && !userId && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-4">
            <LogIn className="h-8 w-8 text-slate-500" />
            <p className="text-xs text-slate-400">Effettua il login per chattare</p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={async () => {
                setIsLoading(true);
                const uid = await autoSyncGSToSupabase();
                if (uid) {
                  setUserId(uid);
                  const chatRooms = await fetchRooms();
                  setRooms(chatRooms);
                  if (chatRooms.length > 0) setActiveRoom(chatRooms[0]);
                  updatePresence('online');
                }
                setIsLoading(false);
              }}
            >
              <LogIn className="h-3 w-3 mr-1" /> {t('communityChat.connect')}
            </Button>
          </div>
        )}

        {/* ── Chat content ── */}
        {!isLoading && userId && !showOnlineUsers && (
          <>
            {/* Room selector bar */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-700/30 bg-slate-850/30">
              <button
                onClick={() => setShowRooms(!showRooms)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 transition-colors text-xs text-slate-300"
              >
                {activeRoom && getRoomIcon(activeRoom.type)}
                <span className="font-medium truncate max-w-[180px]">{activeRoom?.name || 'Stanze'}</span>
                <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${showRooms ? 'rotate-180' : ''}`} />
              </button>
              <Button
                variant="ghost"
                size="xs"
                className={`w-6 p-0 ml-auto ${autoTranslate ? 'text-cyan-400' : 'text-slate-500'}`}
                onClick={toggleAutoTranslate}
                title={autoTranslate ? 'Disattiva auto-traduzione' : 'Auto-traduci messaggi'}
              >
                <Languages className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="xs" className="w-6 p-0" onClick={() => setShowNewRoom(true)}>
                <Plus className="h-3 w-3 text-slate-500" />
              </Button>
            </div>

            {/* Room dropdown */}
            {showRooms && (
              <div className="border-b border-slate-700/30 bg-slate-800/50 max-h-40 overflow-y-auto">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => { setActiveRoom(room); setShowRooms(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${
                      activeRoom?.id === room.id
                        ? 'bg-slate-700/50 text-slate-100'
                        : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                    }`}
                  >
                    {getRoomIcon(room.type)}
                  <span className="truncate">{t(`communityChat.${room.name.toLowerCase()}Room`) !== `communityChat.${room.name.toLowerCase()}Room` ? t(`communityChat.${room.name.toLowerCase()}Room`) : room.name}</span>
                    {room.isPinned && <span className="text-micro">📌</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-2 py-1.5">
              <div className="space-y-0.5">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                    <MessageSquare className="h-6 w-6 mb-1.5 opacity-30" />
                    <span className="text-xs">{t('common.nessunMessaggio')}</span>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isOwn = msg.authorId === userId;
                  const showAvatar = i === 0 || messages[i - 1]?.authorId !== msg.authorId;
                  return (
                    <div
                      key={msg.id}
                      className={`group flex items-start gap-1.5 px-1 py-0.5 rounded hover:bg-slate-800/30 ${
                        msg.deleted ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="w-6 flex-shrink-0">
                        {showAvatar && (
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={msg.authorAvatar?.startsWith('gradient-') || msg.authorAvatar?.startsWith('avatar_') ? undefined : msg.authorAvatar} />
                            <AvatarFallback className="text-2xs bg-slate-700">
                              {(msg.authorName || '?')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {showAvatar && (
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] font-bold ${isOwn ? 'text-cyan-400' : 'text-orange-400'}`}>
                              {msg.authorName || t('communityChat.userDefault')}
                            </span>
                            <span className="text-micro text-slate-600">{formatTime(msg.createdAt)}{msg.edited ? ` ${t('communityChat.editedMessage')}` : ''}</span>
                            {(() => {
                              const lang = detectLangTag(msg.content);
                              return lang ? (
                                <span className="text-micro px-0.5 rounded bg-slate-700/50 text-slate-400 font-mono">{lang}</span>
                              ) : null;
                            })()}
                          </div>
                        )}
                        {msg.replyTo && (
                          <div className="text-micro text-slate-500 border-l-2 border-slate-600 pl-1.5 mb-0.5 truncate">
                            ↳ risposta
                          </div>
                        )}
                        <p className="text-[12px] text-slate-300 break-words leading-relaxed">{msg.content}</p>
                        {translatedMessages[msg.id] && (
                          <p className="text-[12px] text-cyan-300/80 break-words leading-relaxed mt-0.5 border-l-2 border-cyan-500/30 pl-2">
                            {translatedMessages[msg.id]}
                          </p>
                        )}
                      </div>
                      {!msg.deleted && (
                        <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleTranslateMessage(msg)} title={translatedMessages[msg.id] ? 'Nascondi traduzione' : 'Traduci messaggio'}>
                            {translatingIds.has(msg.id) ? (
                              <Loader2 className="h-2.5 w-2.5 text-cyan-400 animate-spin" />
                            ) : (
                              <Languages className={`h-2.5 w-2.5 ${translatedMessages[msg.id] ? 'text-cyan-400' : 'text-slate-500'}`} />
                            )}
                          </Button>
                          {isOwn && (
                            <>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => { setEditingMsg(msg); setMessageInput(msg.content); inputRef.current?.focus(); }}>
                                <Edit3 className="h-2.5 w-2.5 text-slate-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleDelete(msg)}>
                                <Trash2 className="h-2.5 w-2.5 text-red-500/50" />
                              </Button>
                            </>
                          )}
                          {!isOwn && (
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => { setReplyTo(msg); inputRef.current?.focus(); }}>
                              <Reply className="h-2.5 w-2.5 text-slate-500" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply/Edit indicator */}
            {(replyTo || editingMsg) && (
              <div className="px-2 py-1 bg-slate-800/50 border-t border-slate-700/30 flex items-center justify-between">
                <span className="text-2xs text-slate-400">
                  {editingMsg ? '✏️ Modifica' : <>↳ Rispondi a <strong className="text-orange-400">{replyTo?.authorName}</strong></>}
                </span>
                <Button variant="ghost" size="sm" className="h-4 text-micro px-1" onClick={() => { setReplyTo(null); setEditingMsg(null); setMessageInput(''); }}>
                  {t('communityChat.cancel')}
                </Button>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-slate-700/30 bg-slate-800/30">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={activeRoom ? t('communityChat.writeInRoom').replace('{{room}}', t(`communityChat.${activeRoom.name.toLowerCase()}Room`) !== `communityChat.${activeRoom.name.toLowerCase()}Room` ? t(`communityChat.${activeRoom.name.toLowerCase()}Room`) : activeRoom.name) : t('communityChat.selectRoom')}
                  className="h-10 text-sm bg-slate-800/60 border-slate-600/40 rounded-xl focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 placeholder:text-slate-500"
                  disabled={!activeRoom || isSending}
                />
                <Button
                  size="sm"
                  className="h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                  onClick={handleSend}
                  disabled={!messageInput.trim() || !activeRoom || isSending}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Create Room Dialog ── */}
      <Dialog open={showNewRoom} onOpenChange={setShowNewRoom}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('common.nuovaStanza')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="es. Hollow Knight IT" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{t('common.descrizione')}</Label>
              <Textarea value={newRoomDesc} onChange={(e) => setNewRoomDesc(e.target.value)} placeholder="Di cosa si parla?" className="mt-1" rows={2} />
            </div>
            <div>
              <Label className="text-xs">{t('common.tipo')}</Label>
              <Select value={newRoomType} onValueChange={(v: string) => setNewRoomType(v as ChatRoom['type'])}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">💬 {t('communityChat.generalRoom')}</SelectItem>
                  <SelectItem value="game">🎮 {t('communityChat.gameRoom')}</SelectItem>
                  <SelectItem value="translation_request">🌍 {t('communityChat.translationRoom')}</SelectItem>
                  <SelectItem value="feedback">🐛 {t('communityChat.feedbackRoom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRoom(false)}>{t('common.annulla')}</Button>
            <Button onClick={handleCreateRoom} disabled={!newRoomName.trim()}>{t('common.creaStanza')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

