'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  Users,
  UserPlus,
  MessageCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Zap,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Dnd Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  getFriends,
  getOnlineFriends,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  type UserProfile,
  type UserPresence,
  type Friendship,
} from '@/lib/social';
import { useQuickAccess, type QuickAccessItem } from '@/hooks/use-drag-drop';
import { QuickAccessSection, QuickAccessDropZone as QuickAccessEmptyZone } from './quick-access';

// =============================================================================
// TYPES
// =============================================================================

interface FriendsSidebarProps {
  userId: string;
  collapsed?: boolean;
  onToggle?: () => void;
  onOpenProfile?: (friendUserId: string) => void;
  onStartChat?: (friendUserId: string, friendName: string) => void;
}

interface FriendWithPresence extends Friendship {
  profile: UserProfile;
  presence: UserPresence | null;
}

// =============================================================================
// FRIEND CARD
// =============================================================================

function FriendCard({
  friend,
  onStartChat,
  onOpenProfile,
  isQuickAccess,
  onAddToQuickAccess,
}: {
  friend: FriendWithPresence;
  onStartChat: (friend: FriendWithPresence) => void;
  onOpenProfile: (friend: FriendWithPresence) => void;
  isQuickAccess: boolean;
  onAddToQuickAccess: () => void;
}) {
  const status = friend.presence?.status || 'offline';
  const activity = friend.presence?.current_activity;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `friend-${friend.profile.id}`,
    data: {
      type: 'friend',
      friend,
    },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const statusColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    busy: 'bg-rose-500',
    offline: 'bg-slate-500',
  };

  const statusGlow = {
    online: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    away: 'shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    busy: 'shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    offline: '',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
        'hover:bg-slate-800/60 transition-colors',
        isDragging && 'opacity-50'
      )}
      onClick={() => onStartChat(friend)}
    >
      {/* Avatar with Status */}
      <div className="relative shrink-0">
        <Avatar className="h-7 w-7">
          <AvatarImage src={friend.profile.avatar_url || undefined} />
          <AvatarFallback className="bg-slate-700 text-slate-300 text-[10px]">
            {friend.profile.username?.slice(0, 2).toUpperCase() || '??'}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900',
          statusColors[status as keyof typeof statusColors]
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-slate-300 truncate block">
          {friend.profile.username || 'Utente'}
        </span>
        <span className={cn(
          'text-[10px] truncate block',
          status === 'online' && 'text-emerald-400',
          status === 'away' && 'text-amber-400',
          status === 'busy' && 'text-rose-400',
          status === 'offline' && 'text-slate-500'
        )}>
          {activity || (status === 'online' ? 'Online' : status === 'away' ? 'Assente' : status === 'busy' ? 'Occupato' : 'Offline')}
        </span>
      </div>

      {/* Chat button on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStartChat(friend);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-cyan-400 transition-all"
        title="Chat"
      >
        <MessageCircle className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FriendsSidebar({
  userId,
  collapsed = false,
  onToggle,
  onOpenProfile,
  onStartChat,
}: FriendsSidebarProps) {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<FriendWithPresence[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    online: true,
    offline: false,
    requests: true,
  });

  const {
    items: quickAccessItems,
    addItem,
    removeItem,
    reorderItems,
    isInQuickAccess,
  } = useQuickAccess();

  // Fetch friends from database
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const [friendsData, requestsData] = await Promise.all([
          getOnlineFriends(userId),
          getPendingFriendRequests(userId),
        ]);
        
        // Transform UserProfile & { presence: UserPresence } to FriendWithPresence
        const transformedFriends = friendsData.map(f => ({
          id: f.id,
          requester_id: userId,
          addressee_id: f.id,
          status: 'accepted' as const,
          created_at: new Date().toISOString(),
          profile: f,
          presence: f.presence,
        }));
        
        setFriends(transformedFriends);
        setPendingRequests(requestsData);
      } catch (error) {
        console.error('Failed to load friends:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
    const interval = setInterval(loadFriends, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter friends
  const filteredFriends = friends.filter(f =>
    f.profile.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter(f =>
    f.presence?.status === 'online' || f.presence?.status === 'away'
  );
  const offlineFriends = filteredFriends.filter(f =>
    !f.presence?.status || f.presence?.status === 'offline' || f.presence?.status === 'busy'
  );

  // Handlers
  const handleStartChat = useCallback((friend: FriendWithPresence) => {
    onStartChat?.(friend.profile.id, friend.profile.username || 'Utente');
  }, [onStartChat]);

  const handleAddToQuickAccess = useCallback((friend: FriendWithPresence) => {
    addItem({
      id: friend.profile.id,
      type: 'friend',
      name: friend.profile.username || 'Utente',
      avatar: friend.profile.avatar_url || undefined,
      status: friend.presence?.status,
    });
  }, [addItem]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    // Dropping on quick access zone
    if (over.id === 'quick-access-drop-zone') {
      const friendId = (active.id as string).replace('friend-', '');
      const friend = friends.find(f => f.profile.id === friendId);
      if (friend && !isInQuickAccess(friendId)) {
        handleAddToQuickAccess(friend);
      }
      return;
    }

    // Reordering quick access items
    if (active.id !== over.id) {
      const oldIndex = quickAccessItems.findIndex(i => i.id === active.id);
      const newIndex = quickAccessItems.findIndex(i => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderItems(arrayMove(quickAccessItems, oldIndex, newIndex));
      }
    }
  }, [friends, quickAccessItems, isInQuickAccess, handleAddToQuickAccess, reorderItems]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (collapsed) {
    return (
      <div className="w-14 bg-slate-900/95 border-l border-slate-800 flex flex-col items-center py-4 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-slate-400 hover:text-white"
        >
          <Users className="h-4 w-4" />
        </Button>
        <div className="w-8 h-px bg-slate-800" />
        {onlineFriends.slice(0, 5).map(friend => (
          <TooltipProvider key={friend.profile.id} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleStartChat(friend)}
                  className="relative group"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-offset-1 ring-offset-slate-900 ring-emerald-500/50">
                    <AvatarImage src={friend.profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-slate-700 text-[10px]">
                      {friend.profile.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-medium">{friend.profile.username}</p>
                <p className="text-xs text-emerald-400">{friend.presence?.current_activity || 'Online'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-56 bg-slate-900/95 border-l border-slate-800/60 flex flex-col h-full">
        {/* Header */}
        <div className="px-3 py-2 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-300">Amici</span>
              <span className="text-[10px] text-slate-500">{onlineFriends.length}/{friends.length}</span>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-500 hover:text-white"
              >
                <UserPlus className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-6 w-6 text-slate-500 hover:text-white"
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-90" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
            <Input
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 pl-7 text-xs bg-slate-800/40 border-slate-700/50 text-slate-300 placeholder:text-slate-500"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 [&_[data-radix-scroll-area-viewport]]:!overflow-y-auto [&_[data-radix-scroll-area-scrollbar]]:w-1 [&_[data-radix-scroll-area-thumb]]:bg-slate-700">
          <div className="p-2 space-y-3">
            {/* Quick Access Section */}
            {quickAccessItems.length > 0 ? (
              <QuickAccessSection
                items={quickAccessItems}
                onRemove={removeItem}
                onClick={(id, name) => onStartChat?.(id, name)}
                onReorder={reorderItems}
              />
            ) : (
              <QuickAccessEmptyZone isOver={activeDragId?.startsWith('friend-') || false} />
            )}

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => toggleSection('requests')}
                  className="w-full flex items-center justify-between group"
                >
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    Richieste
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">
                      {pendingRequests.length}
                    </Badge>
                    {expandedSections.requests ? (
                      <ChevronUp className="h-3 w-3 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-slate-500" />
                    )}
                  </div>
                </button>
                {expandedSections.requests && (
                  <div className="space-y-1">
                    {pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xs">
                            ?
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-300 truncate">
                            Richiesta in sospeso
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
                            onClick={() => acceptFriendRequest(req.id)}
                          >
                            ✓
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                            onClick={() => rejectFriendRequest(req.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Online Friends */}
            {onlineFriends.length > 0 && (
              <div className="space-y-1">
                <button
                  onClick={() => toggleSection('online')}
                  className="w-full flex items-center justify-between px-1"
                >
                  <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Online
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-600">{onlineFriends.length}</span>
                    {expandedSections.online ? (
                      <ChevronUp className="h-2.5 w-2.5 text-slate-600" />
                    ) : (
                      <ChevronDown className="h-2.5 w-2.5 text-slate-600" />
                    )}
                  </div>
                </button>
                {expandedSections.online && (
                  <div className="space-y-0.5">
                    {onlineFriends.map((friend) => (
                      <FriendCard
                        key={friend.profile.id}
                        friend={friend}
                        onStartChat={handleStartChat}
                        onOpenProfile={(f) => onOpenProfile?.(f.profile.id)}
                        isQuickAccess={isInQuickAccess(friend.profile.id)}
                        onAddToQuickAccess={() => handleAddToQuickAccess(friend)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Offline Friends */}
            {offlineFriends.length > 0 && (
              <div className="space-y-1">
                <button
                  onClick={() => toggleSection('offline')}
                  className="w-full flex items-center justify-between px-1"
                >
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    Offline
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-600">{offlineFriends.length}</span>
                    {expandedSections.offline ? (
                      <ChevronUp className="h-2.5 w-2.5 text-slate-600" />
                    ) : (
                      <ChevronDown className="h-2.5 w-2.5 text-slate-600" />
                    )}
                  </div>
                </button>
                {expandedSections.offline && (
                  <div className="space-y-1 opacity-60">
                    {offlineFriends.map((friend) => (
                      <FriendCard
                        key={friend.profile.id}
                        friend={friend}
                        onStartChat={handleStartChat}
                        onOpenProfile={(f) => onOpenProfile?.(f.profile.id)}
                        isQuickAccess={isInQuickAccess(friend.profile.id)}
                        onAddToQuickAccess={() => handleAddToQuickAccess(friend)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {friends.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-3">
                  <Users className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-sm text-slate-400">Nessun amico ancora</p>
                <p className="text-xs text-slate-500 mt-1">
                  Cerca utenti e invia richieste di amicizia
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </DndContext>
  );
}
