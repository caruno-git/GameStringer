'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Circle,
  Gamepad2,
  RefreshCw
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  getOnlineUsers,
  type UserPresence
} from '@/lib/social';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// ─── STATUS COLORS ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-slate-500',
};

// ─── ONLINE USERS WIDGET ─────────────────────────────────────────────────────

interface OnlineUsersWidgetProps {
  onUserClick?: (userId: string) => void;
  maxDisplay?: number;
  showActivity?: boolean;
  className?: string;
}

export function OnlineUsersWidget({ 
  onUserClick, 
  maxDisplay = 10,
  showActivity = true,
  className 
}: OnlineUsersWidgetProps) {
  const { t } = useTranslation();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const users = await getOnlineUsers(50);
      setOnlineUsers(users);
    } catch (error) {
      console.error('[OnlineUsersWidget] Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className={cn("p-4 rounded-xl bg-slate-800/50 border border-slate-700/50", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">{t('social.onlineFriends')}</span>
        </div>
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 text-slate-500 animate-spin" />
        </div>
      </div>
    );
  }

  const displayUsers = onlineUsers.slice(0, maxDisplay);
  const remainingCount = Math.max(0, onlineUsers.length - maxDisplay);

  return (
    <div className={cn("p-4 rounded-xl bg-slate-800/50 border border-slate-700/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Users className="h-4 w-4 text-emerald-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <span className="text-sm font-semibold text-white">{t('social.onlineFriends')}</span>
          <Badge variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-400">
            {onlineUsers.length}
          </Badge>
        </div>
      </div>

      {/* Users List */}
      {onlineUsers.length > 0 ? (
        <div className="space-y-2">
          {displayUsers.map(user => (
            <div
              key={user.user_id}
              onClick={() => onUserClick?.(user.user_id)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-700 text-xs">
                    {user.user_id.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800",
                  STATUS_COLORS[user.status]
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{user.user_id}</p>
                {showActivity && user.current_game ? (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 truncate">
                    <Gamepad2 className="h-3 w-3" />
                    {user.current_game}
                  </p>
                ) : showActivity && user.current_activity ? (
                  <p className="text-xs text-slate-400 truncate">{user.current_activity}</p>
                ) : null}
              </div>
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="flex items-center justify-center pt-2">
              <span className="text-xs text-slate-400">
                +{remainingCount} {t('social.usersOnline')}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-slate-500">{t('social.noOnlineUsers')}</p>
        </div>
      )}
    </div>
  );
}

// ─── COMPACT ONLINE INDICATOR ────────────────────────────────────────────────

interface OnlineIndicatorProps {
  className?: string;
}

export function OnlineIndicator({ className }: OnlineIndicatorProps) {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const users = await getOnlineUsers(100);
      setCount(users.length);
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5 text-xs", className)}>
            <div className="relative">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50" />
            </div>
            <span className="text-emerald-400 font-medium">{count}</span>
            <span className="text-slate-400">{t('social.online').toLowerCase()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {count} {t('social.usersOnline')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default OnlineUsersWidget;
