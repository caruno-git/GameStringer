'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import {
  Users,
  UserPlus,
  MessageCircle,
  MoreHorizontal,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Gamepad2,
  X,
  Check,
  UserMinus,
  ExternalLink,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  getFriends,
  getOnlineFriends,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getUnreadCount,
  type UserProfile,
  type UserPresence,
  type Friendship,
} from '@/lib/social';
import { cn } from '@/lib/utils';

// ─── STATUS COLORS ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-emerald-400 shadow-emerald-400/50',
  away: 'bg-amber-400 shadow-amber-400/50',
  busy: 'bg-rose-500 shadow-rose-500/50',
  offline: 'bg-slate-500',
};

const STATUS_RING: Record<string, string> = {
  online: 'ring-emerald-400/40',
  away: 'ring-amber-400/40',
  busy: 'ring-rose-500/40',
  offline: 'ring-slate-700/40',
};

// ─── FRIEND ITEM ─────────────────────────────────────────────────────────────

interface FriendItemProps {
  friend: UserProfile & { presence?: UserPresence };
  onMessage?: (friend: UserProfile) => void;
  onViewProfile?: (friend: UserProfile) => void;
  onRemove?: (friend: UserProfile) => void;
}

function FriendItem({ friend, onMessage, onViewProfile, onRemove }: FriendItemProps) {
  const { t } = useTranslation();
  const status = friend.presence?.status || 'offline';
  const activity = friend.presence?.current_activity;
  const game = friend.presence?.current_game;
  const isOnline = status !== 'offline';

  return (
    <div className="group flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-violet-500/10 transition-all cursor-pointer">
      {/* Avatar with status + glow ring */}
      <div className="relative flex-shrink-0">
        <Avatar className={cn(
          'h-9 w-9 ring-2 transition-all',
          STATUS_RING[status],
          'group-hover:ring-violet-400/60'
        )}>
          <AvatarImage src={friend.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-xs text-slate-200">
            {(friend.display_name || friend.username).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 shadow-lg',
            STATUS_COLORS[status],
            isOnline && 'animate-pulse'
          )}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0" onClick={() => onViewProfile?.(friend)}>
        <div className="flex items-center gap-1">
          <span className={cn(
            'text-xs font-semibold truncate transition-colors',
            isOnline ? 'text-slate-100' : 'text-slate-400',
            'group-hover:text-violet-200'
          )}>
            {friend.display_name || friend.username}
          </span>
          {friend.is_verified && (
            <Check className="h-3 w-3 text-sky-400 flex-shrink-0" />
          )}
        </div>
        {game ? (
          <div className="flex items-center gap-1 text-2xs text-emerald-400 truncate">
            <Gamepad2 className="h-2.5 w-2.5 flex-shrink-0" />
            <span className="truncate">{game}</span>
          </div>
        ) : activity ? (
          <p className="text-2xs text-slate-400 truncate">{activity}</p>
        ) : (
          <p className="text-2xs text-slate-500">{t(`social.${status}`)}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-violet-300 hover:bg-violet-500/20"
              onClick={(e) => { e.stopPropagation(); onMessage?.(friend); }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">{t('social.message')}</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onViewProfile?.(friend)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('social.viewProfile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMessage?.(friend)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('social.message')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
              onClick={() => onRemove?.(friend)}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              {t('social.removeFriend')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── FRIEND REQUEST ITEM ─────────────────────────────────────────────────────

interface FriendRequestItemProps {
  request: Friendship & { requester?: UserProfile };
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

function FriendRequestItem({ request, onAccept, onReject }: FriendRequestItemProps) {
  const { t } = useTranslation();
  const requester = request.requester;
  if (!requester) return null;

  return (
    <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-transparent border border-violet-500/30 shadow-lg shadow-violet-500/10">
      <Avatar className="h-9 w-9 ring-2 ring-violet-400/40">
        <AvatarImage src={requester.avatar_url || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-violet-700 to-indigo-800 text-xs text-white">
          {requester.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-100 truncate">{requester.username}</p>
        <p className="text-2xs text-violet-300">{t('social.friendRequest')}</p>
      </div>

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
          onClick={() => onAccept(request.id)}
          title={t('social.accept') || 'Accetta'}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
          onClick={() => onReject(request.id)}
          title={t('social.reject') || 'Rifiuta'}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── EMPTY STATES ────────────────────────────────────────────────────────────

function EmptyOnlineState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center py-6 px-3 text-center">
      <div className="relative w-12 h-12 mb-2">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-lg" />
        <div className="relative w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Users className="h-6 w-6 text-emerald-400/60" />
        </div>
      </div>
      <p className="text-2xs text-slate-500">
        {t('social.noOnlineUsers')}
      </p>
    </div>
  );
}

function EmptyFriendsState({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative w-16 h-16 mb-3">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center">
          <UserRound className="h-8 w-8 text-violet-300" />
        </div>
      </div>
      <h4 className="text-xs font-semibold text-slate-300 mb-1">
        {t('social.noFriends')}
      </h4>
      <p className="text-2xs text-slate-500 mb-3 leading-relaxed">
        {t('social.addFriends')}
      </p>
    </div>
  );
}

// ─── FRIENDS SIDEBAR ─────────────────────────────────────────────────────────

interface FriendsSidebarProps {
  userId: string;
  collapsed?: boolean;
  onToggle?: () => void;
  onOpenChat?: (friend: UserProfile) => void;
  onOpenProfile?: (userId: string) => void;
}

export function FriendsSidebar({
  userId,
  collapsed = false,
  onToggle,
  onOpenChat,
  onOpenProfile,
}: FriendsSidebarProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [friends, setFriends] = useState<(UserProfile & { presence?: UserPresence })[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    requests: true,
    online: true,
    offline: false,
  });
  const [_loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [friendsData, onlineFriendsData, requests, unread] = await Promise.all([
        getFriends(userId),
        getOnlineFriends(userId),
        getPendingFriendRequests(userId),
        getUnreadCount(userId),
      ]);

      const onlineMap = new Map(onlineFriendsData.map(f => [f.user_id, f.presence]));
      const mergedFriends = friendsData.map(f => ({
        ...f,
        presence: onlineMap.get(f.user_id) || {
          status: 'offline' as const,
          user_id: f.user_id,
          current_activity: null,
          current_game: null,
          last_heartbeat: '',
        },
      }));

      setFriends(mergedFriends);
      setPendingRequests(requests);
      setUnreadCount(unread);
    } catch (error) {
      console.error('[FriendsSidebar] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleAcceptRequest = async (requestId: string) => {
    const success = await acceptFriendRequest(requestId);
    if (success) loadData();
  };

  const handleRejectRequest = async (requestId: string) => {
    const success = await rejectFriendRequest(requestId);
    if (success) {
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const handleRemoveFriend = async (friend: UserProfile) => {
    const success = await removeFriend(userId, friend.user_id);
    if (success) {
      setFriends(prev => prev.filter(f => f.user_id !== friend.user_id));
    }
  };

  const handleViewProfile = (friend: UserProfile) => {
    if (onOpenProfile) {
      onOpenProfile(friend.user_id);
    } else {
      router.push(`/community-hub/profile/${friend.username}`);
    }
  };

  const filteredFriends = friends.filter(f => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        f.username.toLowerCase().includes(query) ||
        f.display_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const onlineFriends = filteredFriends.filter(f => f.presence?.status !== 'offline');
  const offlineFriends = filteredFriends.filter(f => f.presence?.status === 'offline');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ─── COLLAPSED VIEW ────────────────────────────────────────────────────────

  if (collapsed) {
    return (
      <div className="w-12 h-full bg-slate-950/60 backdrop-blur-sm border-l border-slate-800 flex flex-col items-center py-3 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="relative text-slate-400 hover:text-violet-300 hover:bg-violet-500/10"
            >
              <Users className="h-5 w-5" />
              {onlineFriends.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {t('social.friends')} ({onlineFriends.length} {t('social.online')})
          </TooltipContent>
        </Tooltip>

        {pendingRequests.length > 0 && (
          <Badge className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs px-1.5 border-0 shadow-lg shadow-violet-500/30">
            {pendingRequests.length}
          </Badge>
        )}

        <div className="flex-1" />

        <div className="flex flex-col gap-1.5">
          {onlineFriends.slice(0, 5).map(friend => (
            <Tooltip key={friend.user_id}>
              <TooltipTrigger asChild>
                <div className="relative cursor-pointer" onClick={() => handleViewProfile(friend)}>
                  <Avatar className="h-8 w-8 ring-2 ring-emerald-400/40 hover:ring-violet-400/60 transition-all">
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-xs text-slate-200">
                      {friend.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 shadow-lg',
                      STATUS_COLORS[friend.presence?.status || 'offline']
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                {friend.display_name || friend.username}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }

  // ─── EXPANDED VIEW ─────────────────────────────────────────────────────────

  return (
    <div className="w-64 h-full bg-slate-950/60 backdrop-blur-sm border-l border-slate-800 flex flex-col">
      {/* ═══ HEADER ═══ */}
      <div className="relative p-3 border-b border-slate-800 overflow-hidden">
        {/* Decorative blob */}
        <div className="absolute -top-12 -right-6 w-32 h-32 bg-violet-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none">
                  {t('social.friends')}
                </div>
                <div className="text-2xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-semibold">{onlineFriends.length}</span>
                  <span>/</span>
                  <span>{friends.length}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 relative text-slate-400 hover:text-violet-300 hover:bg-violet-500/10"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full text-[9px] font-bold flex items-center justify-center text-white shadow-lg shadow-rose-500/50">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('social.notifications')}</TooltipContent>
              </Tooltip>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-slate-200"
                onClick={onToggle}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder={t('social.searchUsers')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-slate-900/70 border-slate-800 focus:border-violet-500/50 focus:ring-violet-500/20"
            />
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {friends.length === 0 && pendingRequests.length === 0 ? (
          <EmptyFriendsState t={t} />
        ) : (
          <>
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="p-2">
                <button
                  onClick={() => toggleSection('requests')}
                  className="flex items-center gap-1 w-full px-2 py-1.5 text-2xs font-bold uppercase tracking-wider text-violet-300 hover:text-violet-200 transition-colors"
                >
                  {expandedSections.requests ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <Sparkles className="h-3 w-3 ml-0.5" />
                  {t('social.pendingRequests')}
                  <Badge className="ml-auto bg-violet-500/20 text-violet-300 border-violet-500/30 text-2xs h-4 px-1.5 border">
                    {pendingRequests.length}
                  </Badge>
                </button>
                {expandedSections.requests && (
                  <div className="mt-1 space-y-1">
                    {pendingRequests.map(request => (
                      <FriendRequestItem
                        key={request.id}
                        request={request}
                        onAccept={handleAcceptRequest}
                        onReject={handleRejectRequest}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Online */}
            <div className="p-2">
              <button
                onClick={() => toggleSection('online')}
                className="flex items-center gap-1 w-full px-2 py-1.5 text-2xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {expandedSections.online ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
                {t('social.onlineFriends')}
                <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-2xs h-4 px-1.5 border">
                  {onlineFriends.length}
                </Badge>
              </button>
              {expandedSections.online && (
                <div className="mt-1">
                  {onlineFriends.length > 0 ? (
                    onlineFriends.map(friend => (
                      <FriendItem
                        key={friend.user_id}
                        friend={friend}
                        onMessage={onOpenChat}
                        onViewProfile={handleViewProfile}
                        onRemove={handleRemoveFriend}
                      />
                    ))
                  ) : (
                    <EmptyOnlineState t={t} />
                  )}
                </div>
              )}
            </div>

            {/* Offline */}
            {offlineFriends.length > 0 && (
              <div className="p-2">
                <button
                  onClick={() => toggleSection('offline')}
                  className="flex items-center gap-1 w-full px-2 py-1.5 text-2xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-400 transition-colors"
                >
                  {expandedSections.offline ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-500 ml-0.5" />
                  {t('social.offlineFriends')}
                  <Badge className="ml-auto bg-slate-500/20 text-slate-400 border-slate-700 text-2xs h-4 px-1.5 border">
                    {offlineFriends.length}
                  </Badge>
                </button>
                {expandedSections.offline && (
                  <div className="mt-1">
                    {offlineFriends.map(friend => (
                      <FriendItem
                        key={friend.user_id}
                        friend={friend}
                        onMessage={onOpenChat}
                        onViewProfile={handleViewProfile}
                        onRemove={handleRemoveFriend}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/50">
        <Button
          size="sm"
          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 border-0"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {t('social.addFriend')}
        </Button>
      </div>
    </div>
  );
}

export default FriendsSidebar;
