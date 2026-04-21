'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  UserPlus,
  Search,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  searchUsers,
  sendFriendRequest,
  getFriends,
  type UserProfile
} from '@/lib/social';
import { useDebounce } from '@/hooks/use-debounce';

// ─── USER SEARCH RESULT ──────────────────────────────────────────────────────

interface UserSearchResultProps {
  user: UserProfile;
  currentUserId: string;
  friendIds: Set<string>;
  pendingIds: Set<string>;
  onSendRequest: (userId: string) => void;
}

function UserSearchResult({
  user,
  currentUserId,
  friendIds,
  pendingIds,
  onSendRequest
}: UserSearchResultProps) {
  const { t } = useTranslation();
  const isCurrentUser = user.user_id === currentUserId;
  const isFriend = friendIds.has(user.user_id);
  const isPending = pendingIds.has(user.user_id);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback className="bg-slate-700">
          {user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">
            {user.display_name || user.username}
          </span>
          {user.is_verified && (
            <Badge className="bg-blue-500 text-xs px-1">✓</Badge>
          )}
        </div>
        <p className="text-xs text-slate-400">@{user.username}</p>
      </div>

      {isCurrentUser ? (
        <Badge variant="secondary" className="text-xs">{t('chat.you')}</Badge>
      ) : isFriend ? (
        <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
          <Users className="h-3 w-3 mr-1" />
          {t('social.friends')}
        </Badge>
      ) : isPending ? (
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {t('social.pendingRequests')}
        </Badge>
      ) : (
        <Button
          size="sm"
          onClick={() => onSendRequest(user.user_id)}
          className="gap-1"
        >
          <UserPlus className="h-4 w-4" />
          {t('social.addFriend')}
        </Button>
      )}
    </div>
  );
}

// ─── ADD FRIEND DIALOG ───────────────────────────────────────────────────────

interface AddFriendDialogProps {
  currentUserId: string;
  trigger?: React.ReactNode;
  onFriendAdded?: () => void;
}

export function AddFriendDialog({ currentUserId, trigger, onFriendAdded }: AddFriendDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Load friends list on open
  const loadFriends = useCallback(async () => {
    const friends = await getFriends(currentUserId);
    setFriendIds(new Set(friends.map(f => f.user_id)));
  }, [currentUserId]);

  // Search users
  const handleSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const users = await searchUsers(debouncedQuery);
      setResults(users);
    } catch (error) {
      console.error('[AddFriendDialog] Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  // Effect: search on query change
  useState(() => {
    if (open) {
      loadFriends();
    }
  });

  useState(() => {
    handleSearch();
  });

  // Send friend request
  const handleSendRequest = async (userId: string) => {
    const success = await sendFriendRequest(currentUserId, userId);
    if (success) {
      setPendingIds(prev => new Set([...prev, userId]));
      onFriendAdded?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) {
        loadFriends();
      } else {
        setSearchQuery('');
        setResults([]);
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            {t('social.addFriend')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-400" />
            {t('social.addFriend')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('social.searchUsers')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch();
              }}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              </div>
            ) : results.length > 0 ? (
              results.map(user => (
                <UserSearchResult
                  key={user.user_id}
                  user={user}
                  currentUserId={currentUserId}
                  friendIds={friendIds}
                  pendingIds={pendingIds}
                  onSendRequest={handleSendRequest}
                />
              ))
            ) : searchQuery.trim() ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">{t('social.noOnlineUsers')}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {t('social.searchUsers')}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">{t('social.searchUsers')}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {t('social.addFriends')}
                </p>
              </div>
            )}
          </div>

          {/* Invite by link */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              Oppure condividi il tuo profilo per farti trovare
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddFriendDialog;
