'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  MoreVertical,
  Image,
  Users
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { ChatEmptyState, ChatDropZone } from './chat-empty-state';
import {
  DndContext,
  useDroppable,
  DragEndEvent,
} from '@dnd-kit/core';
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
} from '@/lib/social/social';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// Drop zone wrapper for chat
function ChatDropZoneWrapper({ 
  children, 
  onDrop 
}: { 
  children: React.ReactNode;
  onDrop: (friendId: string, friendName: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'chat-drop-zone',
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over?.id === 'chat-drop-zone') {
      const friendData = active.data.current as { friend?: { profile: { id: string; username: string } } };
      if (friendData?.friend) {
        onDrop(friendData.friend.profile.id, friendData.friend.profile.username || 'Utente');
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div ref={setNodeRef} className="h-full relative">
        {children}
        {isOver && (
          <div className="absolute inset-0 bg-violet-500/10 border-2 border-violet-400 border-dashed m-4 rounded-xl z-50 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-8 w-8 text-violet-400 mx-auto mb-2" />
              <p className="text-sm text-violet-300">Rilascia per aprire chat</p>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}

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
  const hasUnread = conversation.unread_count && conversation.unread_count > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group",
        isActive 
          ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30" 
          : "hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50",
        hasUnread && "bg-slate-800/30"
      )}
    >
      <div className="relative">
        <Avatar className={cn(
          "h-10 w-10 transition-all",
          isActive && "ring-2 ring-violet-500/50"
        )}>
          <AvatarImage src={otherProfile?.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-600 text-xs text-white">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        {/* Online indicator */}
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900",
          isActive ? "bg-emerald-500" : "bg-slate-600 group-hover:bg-emerald-500/50"
        )} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-sm font-medium truncate transition-colors",
            hasUnread ? "text-white" : "text-slate-300",
            isActive && "text-violet-300"
          )}>
            {displayName}
          </span>
          {conversation.last_message && (
            <span className="text-[10px] text-slate-500 shrink-0">
              {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: false, locale: it })}
            </span>
          )}
        </div>
        {conversation.last_message ? (
          <p className={cn(
            "text-xs truncate mt-0.5 transition-colors",
            hasUnread ? "text-slate-300" : "text-slate-500"
          )}>
            {conversation.last_message.sender_id === currentUserId ? (
              <span className="text-slate-600">Tu: </span>
            ) : null}
            {conversation.last_message.content}
          </p>
        ) : (
          <p className="text-xs text-slate-600 mt-0.5 italic">Nessun messaggio</p>
        )}
      </div>

      {hasUnread && (
        <Badge className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[10px] min-w-[18px] h-5 shrink-0 animate-pulse">
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
  ownProfile?: { username: string; display_name: string | null; avatar_url: string | null } | null;
}

function MessageBubble({ message, isOwn, senderProfile, ownProfile }: MessageBubbleProps) {
  const { t } = useTranslation();
  const displayName = senderProfile?.display_name || senderProfile?.username || t('chat.userNotFound');
  const ownDisplayName = ownProfile?.display_name || ownProfile?.username || 'Tu';

  return (
    <div className={cn(
      "flex gap-3 mb-4 group",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {!isOwn && (
        <Avatar className="h-8 w-8 mt-1 ring-2 ring-slate-800">
          <AvatarImage src={senderProfile?.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-600 text-xs text-white">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      {isOwn && (
        <Avatar className="h-8 w-8 mt-1 ring-2 ring-violet-500/50">
          <AvatarImage src={ownProfile?.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-xs text-white">
            {ownDisplayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[75%] flex flex-col", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-xs text-slate-500 mb-1 ml-1">{displayName}</span>
        )}
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm shadow-sm backdrop-blur",
          isOwn
            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-md border border-violet-500/30"
            : "bg-slate-800/80 text-slate-200 rounded-bl-md border border-slate-700/50"
        )}>
          {message.content}
        </div>
        <span className={cn(
          "text-[10px] text-slate-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isOwn ? "text-right" : "text-left"
        )}>
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
  const [ownProfile, setOwnProfile] = useState<{ username: string; display_name: string | null; avatar_url: string | null } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const senderProfilesRef = useRef<Map<string, { username: string; display_name: string | null; avatar_url: string | null } | null>>(new Map());

  // Load other user profile for direct chats
  useEffect(() => {
    if (conversation.type === 'direct') {
      const other = conversation.participants.find(p => p.user_id !== currentUserId);
      if (other) getProfile(other.user_id).then(p => setOtherProfile(p));
    }
  }, [conversation, currentUserId]);

  // Load own profile
  useEffect(() => {
    getProfile(currentUserId).then(p => setOwnProfile(p));
  }, [currentUserId]);

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
    <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur">
      {/* Header with glass effect */}
      <div className="flex items-center gap-3 p-3 border-b border-slate-800/60 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 text-slate-400" />
        </Button>
        <div className="relative">
          <Avatar className="h-9 w-9 ring-2 ring-violet-500/30">
            <AvatarImage src={otherProfile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs">
              {chatName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{chatName}</p>
          <p className="text-xs text-emerald-400">Online</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-700/50">
          <MoreVertical className="h-4 w-4 text-slate-400" />
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
              ownProfile={msg.sender_id === currentUserId ? ownProfile : undefined}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-violet-400/60" />
            </div>
            <p className="text-sm font-medium text-slate-300 mb-1">Inizia la conversazione</p>
            <p className="text-xs text-slate-500 max-w-[200px]">
              Scrivi il primo messaggio per iniziare a chattare con {chatName}
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Input with modern design */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-800/30 backdrop-blur">
        <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl p-1.5 border border-slate-700/50 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10">
            <Image className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.writeMessage')}
            className="flex-1 bg-transparent border-0 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-8 w-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg"
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
  initialUserId?: string;
  onStartChat?: (userId: string) => void;
}

export function ChatPanel({ userId, initialUserId }: ChatPanelProps) {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<ChatConversationWithDetails[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatAttempted, setChatAttempted] = useState<string | null>(null);

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

  // Auto-open chat with initialUserId when provided
  useEffect(() => {
    if (initialUserId && !loading && chatAttempted !== initialUserId) {
      const existingConv = conversations.find(c => 
        c.participants.some(p => p.user_id === initialUserId)
      );
      if (existingConv) {
        setActiveConversation(existingConv);
        setChatAttempted(initialUserId);
      } else {
        // Create new conversation (only once)
        setChatAttempted(initialUserId);
        startDirectChat(initialUserId);
      }
    }
  }, [initialUserId, loading, conversations]);

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

  // Handle back - return to conversation list
  const handleBack = () => {
    setActiveConversation(null);
  };

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
    <ChatDropZoneWrapper onDrop={startDirectChat}>
      <div className="h-full flex flex-col bg-slate-900/95 backdrop-blur border-l border-slate-800/60">
        {/* Header with glass effect */}
        <div className="p-3 border-b border-slate-800/60 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-violet-400" />
              </div>
              <span className="text-sm font-semibold text-white">{t('chat.messages')}</span>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500" />
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
            <ChatEmptyState
              onSearchFriends={() => { /* TODO: apri ricerca */ }}
              onCreateGroup={() => { /* TODO: crea gruppo */ }}
            />
          )}
        </ScrollArea>
      </div>
    </ChatDropZoneWrapper>
  );
}

export default ChatPanel;

