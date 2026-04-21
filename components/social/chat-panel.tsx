'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  MoreVertical,
  Image
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getConversations,
  getMessages,
  sendMessage,
  getOrCreateDirectConversation,
  markConversationRead,
  getProfile,
  type ChatConversationWithDetails,
  type ChatMessage
} from '@/lib/social';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// ─── CONVERSATION LIST ITEM ──────────────────────────────────────────────────

interface ConversationItemProps {
  conversation: ChatConversationWithDetails;
  currentUserId: string;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({ conversation, currentUserId, isActive, onClick }: ConversationItemProps) {
  const [otherProfile, setOtherProfile] = useState<{ username: string; display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    // Per chat direct, trova il profilo dell'altro utente
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p.user_id !== currentUserId);
      if (otherParticipant) {
        getProfile(otherParticipant.user_id).then(p => setOtherProfile(p));
      }
    }
  }, [conversation, currentUserId]);

  const { t } = useTranslation();
  const displayName = conversation.type === 'direct'
    ? (otherProfile?.display_name || otherProfile?.username || t('chat.userNotFound'))
    : (conversation.name || t('chat.group'));

  const avatarFallback = displayName.slice(0, 2).toUpperCase();

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isActive ? "bg-blue-500/20 border border-blue-500/30" : "hover:bg-slate-800/50"
      )}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherProfile?.avatar_url || undefined} />
          <AvatarFallback className="bg-slate-700 text-xs">{avatarFallback}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white truncate">{displayName}</span>
          {conversation.last_message && (
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: false, locale: it })}
            </span>
          )}
        </div>
        {conversation.last_message && (
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {conversation.last_message.sender_id === currentUserId ? 'Tu: ' : ''}
            {conversation.last_message.content}
          </p>
        )}
      </div>

      {conversation.unread_count && conversation.unread_count > 0 && (
        <Badge className="bg-blue-500 text-white text-xs min-w-[20px] h-5">
          {conversation.unread_count}
        </Badge>
      )}
    </div>
  );
}

// ─── MESSAGE BUBBLE ──────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  senderProfile?: { username: string; display_name: string | null; avatar_url: string | null } | null;
}

function MessageBubble({ message, isOwn, senderProfile }: MessageBubbleProps) {
  const { t } = useTranslation();
  const displayName = senderProfile?.display_name || senderProfile?.username || t('chat.userNotFound');

  return (
    <div className={cn("flex gap-2 mb-3", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={senderProfile?.avatar_url || undefined} />
          <AvatarFallback className="bg-slate-700 text-xs">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-xs text-slate-400 mb-1 block">{displayName}</span>
        )}
        <div className={cn(
          "rounded-xl px-3 py-2 text-sm",
          isOwn
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-slate-700 text-slate-200 rounded-bl-sm"
        )}>
          {message.content}
        </div>
        <span className={cn("text-xs text-slate-500 mt-1 block", isOwn ? "text-right" : "text-left")}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: it })}
        </span>
      </div>
    </div>
  );
}

// ─── CHAT VIEW ───────────────────────────────────────────────────────────────

interface ChatViewProps {
  conversation: ChatConversationWithDetails;
  currentUserId: string;
  onBack: () => void;
}

function ChatView({ conversation, currentUserId, onBack }: ChatViewProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherProfile, setOtherProfile] = useState<{ username: string; display_name: string | null; avatar_url: string | null } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const senderProfilesRef = useRef<Map<string, { username: string; display_name: string | null; avatar_url: string | null } | null>>(new Map());

  // Load other user profile for direct chats
  useEffect(() => {
    if (conversation.type === 'direct') {
      const other = conversation.participants.find(p => p.user_id !== currentUserId);
      if (other) getProfile(other.user_id).then(p => setOtherProfile(p));
    }
  }, [conversation, currentUserId]);

  // Load messages
  const loadMessages = useCallback(async () => {
    const msgs = await getMessages(conversation.id);
    setMessages(msgs);

    // Load sender profiles
    const senderIds = [...new Set(msgs.map(m => m.sender_id))];
    for (const sid of senderIds) {
      if (!senderProfilesRef.current.has(sid)) {
        const p = await getProfile(sid);
        senderProfilesRef.current.set(sid, p);
      }
    }

    // Mark as read
    await markConversationRead(conversation.id, currentUserId);
  }, [conversation.id, currentUserId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendMessage(conversation.id, currentUserId, newMessage.trim());
      if (msg) {
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const chatName = conversation.type === 'direct'
    ? (otherProfile?.display_name || otherProfile?.username || t('chat.userNotFound'))
    : (conversation.name || t('chat.group'));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-slate-700 bg-slate-800/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherProfile?.avatar_url || undefined} />
          <AvatarFallback className="bg-slate-700 text-xs">
            {chatName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{chatName}</p>
          <p className="text-xs text-slate-400">{t('chat.inChat')}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        {messages.length > 0 ? (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
              senderProfile={senderProfilesRef.current.get(msg.sender_id)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-500">{t('chat.noMessages')}</p>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
            <Image className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.writeMessage')}
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-8 w-8 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── CHAT PANEL ──────────────────────────────────────────────────────────────

interface ChatPanelProps {
  userId: string;
  onStartChat?: (userId: string) => void;
}

export function ChatPanel({ userId }: ChatPanelProps) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ChatConversationWithDetails[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    const convs = await getConversations(userId);
    setConversations(convs);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 30000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  // Start a direct chat with a specific user
  const startDirectChat = async (otherUserId: string) => {
    const conv = await getOrCreateDirectConversation(userId, otherUserId);
    if (conv) {
      // Reload conversations and select the new one
      await loadConversations();
      const found = conversations.find(c => c.id === conv.id);
      if (found) setActiveConversation(found);
      else {
        // Reload to get the new conversation with details
        const convs = await getConversations(userId);
        setConversations(convs);
        const newConv = convs.find(c => c.id === conv.id);
        if (newConv) setActiveConversation(newConv);
      }
    }
  };

  // Expose startDirectChat
  (ChatPanel as any).startDirectChat = startDirectChat;

  if (activeConversation) {
    return (
      <div className="h-full flex flex-col bg-slate-900 border-l border-slate-700/50">
        <ChatView
          conversation={activeConversation}
          currentUserId={userId}
          onBack={() => setActiveConversation(null)}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-700/50">
      {/* Header */}
      <div className="p-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">{t('chat.messages')}</span>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-1">
            {conversations.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                currentUserId={userId}
                isActive={false}
                onClick={() => setActiveConversation(conv)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="h-12 w-12 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">{t('chat.noConversations')}</p>
            <p className="text-xs text-slate-500 mt-1">
              {t('chat.clickFriendToChat')}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default ChatPanel;
