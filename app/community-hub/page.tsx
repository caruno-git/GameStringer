'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Users,
  MessageCircle,
  Package,
  Download,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { ForumHome, ThreadView, NewThread } from '@/components/forum';
import { FriendsSidebar, NotificationsPanel, OnlineIndicator, ChatPanel } from '@/components/social';
import { SocialOnboarding } from '@/components/social/social-onboarding';
import { useProfiles } from '@/hooks/use-profiles';
import { updatePresence } from '@/lib/social';
import { getForumStats, type ForumStats } from '@/lib/forum';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ForumThread } from '@/lib/forum';

type View = 'home' | 'thread' | 'new';

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: typeof MessageSquare;
  label: string;
  value: number | string;
  accent: 'violet' | 'indigo' | 'emerald' | 'amber' | 'rose';
}

const ACCENT_CLASSES: Record<KpiCardProps['accent'], { bg: string; border: string; icon: string; value: string }> = {
  violet: {
    bg: 'bg-gradient-to-br from-violet-600/15 via-violet-600/5 to-transparent',
    border: 'border-violet-500/30',
    icon: 'text-violet-300 bg-violet-500/20',
    value: 'text-violet-100',
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-600/15 via-indigo-600/5 to-transparent',
    border: 'border-indigo-500/30',
    icon: 'text-indigo-300 bg-indigo-500/20',
    value: 'text-indigo-100',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-600/15 via-emerald-600/5 to-transparent',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-300 bg-emerald-500/20',
    value: 'text-emerald-100',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-600/15 via-amber-600/5 to-transparent',
    border: 'border-amber-500/30',
    icon: 'text-amber-300 bg-amber-500/20',
    value: 'text-amber-100',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-600/15 via-rose-600/5 to-transparent',
    border: 'border-rose-500/30',
    icon: 'text-rose-300 bg-rose-500/20',
    value: 'text-rose-100',
  },
};

function KpiCard({ icon: Icon, label, value, accent }: KpiCardProps) {
  const cls = ACCENT_CLASSES[accent];
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border backdrop-blur-sm px-4 py-3 transition-all hover:scale-[1.02]',
        cls.bg,
        cls.border
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', cls.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn('text-2xl font-bold leading-none', cls.value)}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-1 truncate">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function CommunityHubPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { currentProfile } = useProfiles();

  const initialCategory = searchParams.get('category') || undefined;
  const initialSearch = searchParams.get('query') || undefined;

  const [view, setView] = useState<View>('home');
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [newThreadCategory, setNewThreadCategory] = useState<string | undefined>(initialCategory);
  const [showFriendsSidebar, setShowFriendsSidebar] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [_chatUserId, setChatUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<ForumStats | null>(null);

  const userId = currentProfile?.id || '';
  const userName = currentProfile?.name || '';
  const userAvatar = currentProfile?.avatar_path || undefined;

  // Update presence
  useEffect(() => {
    if (userId) {
      updatePresence(userId, 'online', t('social.inCommunityHub'));
      const interval = setInterval(() => {
        updatePresence(userId, 'online', t('social.inCommunityHub'));
      }, 120000);
      return () => clearInterval(interval);
    }
  }, [userId, t]);

  // Load forum stats per hero
  useEffect(() => {
    getForumStats().then(setStats).catch(() => { /* silenzioso */ });
    const interval = setInterval(() => {
      getForumStats().then(setStats).catch(() => { /* silenzioso */ });
    }, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleOpenThread = (thread: ForumThread) => {
    setSelectedThread(thread);
    setView('thread');
  };

  const handleNewThread = (categorySlug?: string) => {
    setNewThreadCategory(categorySlug);
    setView('new');
  };

  const handleBack = () => {
    setView('home');
    setSelectedThread(null);
  };

  const handleThreadCreated = (thread: ForumThread) => {
    setSelectedThread(thread);
    setView('thread');
  };

  return (
    <TooltipProvider>
      <div className="h-full flex relative overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HERO — visible only in home view                                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {view === 'home' && (
            <div className="relative px-6 pt-6 pb-4">
              {/* Decorative blobs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
                <div className="absolute top-10 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute -top-10 right-0 w-64 h-64 bg-fuchsia-600/5 rounded-full blur-3xl" />
              </div>

              <div className="relative">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-violet-100 to-indigo-200 bg-clip-text text-transparent">
                        {t('communityHub.title')}
                      </h1>
                      <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                        {t('communityHub.subtitle')}
                      </p>
                    </div>
                  </div>

                  {/* Actions toolbar */}
                  <div className="flex items-center gap-2">
                    <OnlineIndicator />
                    {userId && <NotificationsPanel userId={userId} />}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowChat(!showChat)}
                      className={cn(
                        'transition-all',
                        showChat ? 'text-violet-400 bg-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      )}
                      title="Chat"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFriendsSidebar(!showFriendsSidebar)}
                      className={cn(
                        'transition-all',
                        showFriendsSidebar ? 'text-violet-400 bg-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      )}
                      title="Amici"
                    >
                      <Users className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard
                    icon={MessageSquare}
                    label={t('forum.threadsLabel') || 'Discussioni'}
                    value={stats?.total_threads ?? 0}
                    accent="violet"
                  />
                  <KpiCard
                    icon={Package}
                    label={t('communityHub.translationPacks') || 'Translation Pack'}
                    value={stats?.total_packs ?? 0}
                    accent="indigo"
                  />
                  <KpiCard
                    icon={Download}
                    label={t('forum.downloads') || 'Download'}
                    value={stats?.total_downloads ?? 0}
                    accent="emerald"
                  />
                  <KpiCard
                    icon={Flame}
                    label={t('communityHub.activeUsers') || 'Utenti Attivi'}
                    value={stats?.active_users ?? 0}
                    accent="rose"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CONTENT                                                          */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="px-6 pb-6">
            {view === 'home' && (
              <ForumHome
                initialCategory={initialCategory}
                initialSearch={initialSearch}
                onOpenThread={handleOpenThread}
                onNewThread={handleNewThread}
              />
            )}

            {view === 'thread' && selectedThread && (
              <ThreadView
                threadId={selectedThread.id}
                userId={userId}
                userName={userName}
                userAvatar={userAvatar}
                onBack={handleBack}
              />
            )}

            {view === 'new' && (
              <NewThread
                initialCategory={newThreadCategory}
                userId={userId}
                userName={userName}
                userAvatar={userAvatar}
                onBack={handleBack}
                onSuccess={handleThreadCreated}
              />
            )}
          </div>
        </div>

        {/* Chat Panel (slide-in) */}
        {userId && showChat && (
          <div className="w-80 border-l border-slate-800 bg-slate-950/50 backdrop-blur-sm">
            <ChatPanel userId={userId} initialUserId={_chatUserId || undefined} />
          </div>
        )}

        {/* Friends Sidebar */}
        {userId && (
          <FriendsSidebar
            userId={userId}
            collapsed={!showFriendsSidebar}
            onToggle={() => setShowFriendsSidebar(!showFriendsSidebar)}
            onOpenProfile={(friendUserId) => {
              setChatUserId(friendUserId);
              setShowChat(true);
            }}
            onStartChat={(friendUserId) => {
              setChatUserId(friendUserId);
              setShowChat(true);
            }}
          />
        )}
      </div>
      
      {/* Onboarding Tutorial */}
      <SocialOnboarding />
    </TooltipProvider>
  );
}



