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

const ACCENT_CLASSES: Record<KpiCardProps['accent'], { icon: string; iconBg: string }> = {
  violet: { icon: 'text-violet-400', iconBg: 'bg-violet-500/10' },
  indigo: { icon: 'text-indigo-400', iconBg: 'bg-indigo-500/10' },
  emerald: { icon: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
  amber: { icon: 'text-amber-400', iconBg: 'bg-amber-500/10' },
  rose: { icon: 'text-rose-400', iconBg: 'bg-rose-500/10' },
};

function KpiCard({ icon: Icon, label, value, accent }: KpiCardProps) {
  const cls = ACCENT_CLASSES[accent];
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800/60 bg-slate-900/40 px-3 py-2.5">
      <div className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center', cls.iconBg)}>
        <Icon className={cn('h-4 w-4', cls.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-semibold text-slate-200 leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 truncate">
          {label}
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
            <div className="px-6 pt-5 pb-4">
              {/* Title row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-200">
                      {t('communityHub.title')}
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">
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



