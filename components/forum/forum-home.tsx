'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import {
  MessageSquare,
  Download,
  Search,
  TrendingUp,
  Clock,
  Pin,
  Lock,
  CheckCircle2,
  ChevronRight,
  Plus,
  RefreshCw,
  Package,
  Gamepad2,
  HelpCircle,
  Trophy,
  Megaphone,
  BookOpen,
  MessageSquarePlus,
  Coffee,
  Sparkles,
  Flame,
  Eye,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getCategories,
  getThreads,
  type ForumCategory,
  type ForumThread,
  type ThreadsFilter,
} from '@/lib/social/forum';
import { formatDistanceToNow } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ─── CATEGORY ICONS & GRADIENTS ─────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'announcements': Megaphone,
  'translation-packs': Package,
  'help': HelpCircle,
  'tutorials': BookOpen,
  'requests': MessageSquarePlus,
  'showcase': Trophy,
  'off-topic': Coffee,
};

const CATEGORY_THEMES: Record<string, { accent: string; icon: string; iconBg: string }> = {
  'announcements': {
    accent: 'text-rose-400',
    icon: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
  },
  'translation-packs': {
    accent: 'text-amber-400',
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
  },
  'help': {
    accent: 'text-cyan-400',
    icon: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
  },
  'tutorials': {
    accent: 'text-violet-400',
    icon: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
  },
  'requests': {
    accent: 'text-emerald-400',
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
  },
  'showcase': {
    accent: 'text-yellow-400',
    icon: 'text-yellow-400',
    iconBg: 'bg-yellow-500/10',
  },
  'off-topic': {
    accent: 'text-slate-400',
    icon: 'text-slate-400',
    iconBg: 'bg-slate-500/10',
  },
};

const DEFAULT_THEME = {
  accent: 'text-indigo-400',
  icon: 'text-indigo-400',
  iconBg: 'bg-indigo-500/10',
};

// ─── FORUM HOME ─────────────────────────────────────────────────────────────

interface ForumHomeProps {
  initialCategory?: string;
  initialSearch?: string;
  onOpenThread?: (thread: ForumThread) => void;
  onNewThread?: (categorySlug?: string) => void;
}

export function ForumHome({ initialCategory, initialSearch, onOpenThread, onNewThread }: ForumHomeProps) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const locale = language === 'it' ? it : enUS;

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [trending, setTrending] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalThreads, setTotalThreads] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most_replies' | 'most_downloads'>('newest');
  const [showPacksOnly, setShowPacksOnly] = useState(false);
  const [page, setPage] = useState(1);

  // ─── LOAD DATA ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const cats = await getCategories();
      setCategories(cats);

      const filter: ThreadsFilter = {
        category_slug: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort: sortBy,
        is_translation_pack: showPacksOnly ? true : undefined,
        page,
        limit: 20,
      };

      const { threads: threadData, total } = await getThreads(filter);
      setThreads(threadData);
      setTotalThreads(total);
    } catch (error) {
      console.error('[Forum] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, showPacksOnly, page]);

  // Trending (top 4 by views/replies) — caricato solo una volta
  const loadTrending = useCallback(async () => {
    try {
      const { threads: t } = await getThreads({ sort: 'popular', limit: 4, page: 1 });
      setTrending(t);
    } catch { /* silenzioso */ }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const handleThreadClick = (thread: ForumThread) => {
    if (onOpenThread) {
      onOpenThread(thread);
    } else {
      router.push(`/community-hub/thread/${thread.id}`);
    }
  };

  const handleNewThread = (categorySlug?: string) => {
    if (onNewThread) {
      onNewThread(categorySlug);
    } else {
      router.push(`/community-hub/new${categorySlug ? `?category=${categorySlug}` : ''}`);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  const showCategories = selectedCategory === 'all' && !searchQuery;
  const hasAnyThreads = totalThreads > 0 || trending.length > 0;

  return (
    <div className="space-y-6 pt-4">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TRENDING STRIP                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCategories && trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {t('forum.trendingNow') || 'Trending Now'}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {trending.map((thread) => (
              <TrendingCard
                key={thread.id}
                thread={thread}
                locale={locale}
                onClick={() => handleThreadClick(thread)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CATEGORIES GRID                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCategories && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">
                {t('forum.categories') || 'Categorie'}
              </h2>
            </div>
            <Button
              onClick={() => handleNewThread()}
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('forum.newThread')}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onClick={() => setSelectedCategory(cat.slug)}
                onNewThread={() => handleNewThread(cat.slug)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CATEGORY TABS (when filtered)                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!showCategories && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-slate-400 hover:text-white"
          >
            ← {t('forum.allCategories')}
          </Button>
          <div className="w-px h-4 bg-slate-700" />
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || MessageSquare;
            const theme = CATEGORY_THEMES[cat.slug] || DEFAULT_THEME;
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                  active
                    ? 'bg-violet-500/20 border-violet-400/50 text-violet-200 shadow-lg shadow-violet-500/20'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', active ? theme.accent : '')} />
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FILTERS BAR                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3 flex-wrap p-3 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder={t('forum.searchThreads')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-slate-800/50 border-slate-700 focus:border-violet-500/50 focus:ring-violet-500/20"
          />
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[170px] h-9 bg-slate-800/50 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {t('forum.mostRecent')}</span>
            </SelectItem>
            <SelectItem value="popular">
              <span className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> {t('forum.mostViewed')}</span>
            </SelectItem>
            <SelectItem value="most_replies">
              <span className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5" /> {t('forum.mostReplies')}</span>
            </SelectItem>
            <SelectItem value="most_downloads">
              <span className="flex items-center gap-2"><Download className="h-3.5 w-3.5" /> {t('forum.mostDownloads')}</span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showPacksOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowPacksOnly(!showPacksOnly)}
          className={cn(
            'h-9',
            showPacksOnly && 'bg-amber-600 hover:bg-amber-500 border-amber-500'
          )}
        >
          <Package className="h-4 w-4 mr-1" />
          {t('forum.packsOnly')}
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={loadData} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* THREAD LIST                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!showCategories && (
        <section>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-violet-400" />
            {selectedCategory === 'all'
              ? (t('forum.allThreads') || 'Tutti i thread')
              : categories.find(c => c.slug === selectedCategory)?.name || ''}
            {totalThreads > 0 && (
              <Badge variant="outline" className="text-2xs border-slate-700 text-slate-400">
                {totalThreads}
              </Badge>
            )}
          </h3>

          <div className="space-y-2">
            {loading ? (
              <ThreadListSkeleton />
            ) : threads.length === 0 ? (
              <EmptyState
                hasAnyThreads={hasAnyThreads}
                onNewThread={() => handleNewThread(selectedCategory !== 'all' ? selectedCategory : undefined)}
              />
            ) : (
              threads.map((thread) => (
                <ThreadRow
                  key={thread.id}
                  thread={thread}
                  locale={locale}
                  onClick={() => handleThreadClick(thread)}
                />
              ))
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PAGINATION                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {!showCategories && totalThreads > 20 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            {t('forum.previous')}
          </Button>
          <span className="text-sm text-slate-400">
            {t('forum.page')} {page} {t('forum.of')} {Math.ceil(totalThreads / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(totalThreads / 20)}
            onClick={() => setPage(p => p + 1)}
          >
            {t('forum.next')}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── CATEGORY CARD ──────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: ForumCategory;
  onClick: () => void;
  onNewThread: () => void;
}

function CategoryCard({ category, onClick, onNewThread }: CategoryCardProps) {
  const { t } = useTranslation();
  const Icon = CATEGORY_ICONS[category.slug] || MessageSquare;
  const theme = CATEGORY_THEMES[category.slug] || DEFAULT_THEME;
  const threadCount = category.thread_count || 0;

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/10"
    >
      {/* Background gradient */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        'bg-gradient-to-br',
        category.slug === 'announcements' && 'from-rose-500/20 to-orange-500/10',
        category.slug === 'translation-packs' && 'from-amber-500/20 to-yellow-500/10',
        category.slug === 'help' && 'from-cyan-500/20 to-blue-500/10',
        category.slug === 'tutorials' && 'from-violet-500/20 to-purple-500/10',
        category.slug === 'requests' && 'from-emerald-500/20 to-green-500/10',
        category.slug === 'showcase' && 'from-yellow-500/20 to-amber-500/10',
        category.slug === 'off-topic' && 'from-slate-500/20 to-slate-600/10',
        !['announcements', 'translation-packs', 'help', 'tutorials', 'requests', 'showcase', 'off-topic'].includes(category.slug) && 'from-indigo-500/20 to-violet-500/10'
      )} />
      
      <div className="relative p-4 bg-slate-900/60 border border-slate-800/60 rounded-xl backdrop-blur-sm group-hover:border-slate-700/80 transition-colors">
        <div className="flex items-start gap-4">
          {/* Icon with glow */}
          <div className="relative">
            <div className={cn(
              'absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-60 transition-opacity',
              theme.iconBg
            )} />
            <div className={cn(
              'relative w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
              theme.iconBg
            )}>
              <Icon className={cn('h-5 w-5', theme.icon)} />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-base leading-tight truncate group-hover:text-violet-100 transition-colors">
                {t(`forum.categoryNames.${category.slug}`) || category.name}
              </h3>
              {category.is_locked && <Lock className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />}
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {t(`forum.categoryDescriptions.${category.slug}`) || category.description || ''}
            </p>
          </div>
          
          <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-2 text-xs">
            <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md', theme.iconBg)}>
              <MessageSquare className={cn('h-3 w-3', theme.icon)} />
              <span className={theme.accent}>{threadCount}</span>
            </div>
            <span className="text-slate-500">{threadCount === 1 ? t('forum.discussion') : (t('forum.discussions') || 'discussioni')}</span>
          </div>
          {!category.is_locked && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onNewThread();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-violet-500/10 text-violet-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-500/20 text-xs font-medium"
              title={t('forum.newThread')}
            >
              <Plus className="h-3 w-3" />
              Nuovo
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── TRENDING CARD ──────────────────────────────────────────────────────────

interface TrendingCardProps {
  thread: ForumThread;
  locale: Locale;
  onClick: () => void;
}

function TrendingCard({ thread, locale, onClick }: TrendingCardProps) {
  const { t } = useTranslation();
  const category = thread.category as ForumCategory | undefined;
  const theme = category ? (CATEGORY_THEMES[category.slug] || DEFAULT_THEME) : DEFAULT_THEME;

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-4 bg-slate-900/60 border border-slate-800/60 rounded-xl backdrop-blur-sm group-hover:border-rose-500/30 transition-colors h-full flex flex-col">
        {/* Header badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {thread.is_pinned && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-2xs font-medium">
              <Pin className="h-2.5 w-2.5" />
              Pinned
            </div>
          )}
          {thread.is_translation_pack && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 text-2xs font-bold">
              <Package className="h-2.5 w-2.5" />
              PACK
            </div>
          )}
          {category && (
            <div className={cn('px-2 py-0.5 rounded-full text-2xs font-medium', theme.iconBg, theme.accent)}>
              {t(`forum.categoryNames.${category.slug}`) || category.name}
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-white group-hover:text-rose-100 transition-colors line-clamp-2 mb-3 flex-1">
          {thread.title}
        </h4>

        {/* Author & Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-5 w-5 flex-shrink-0 ring-1 ring-slate-700">
              <AvatarImage src={thread.author_avatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-orange-500 text-[9px] text-white font-bold">
                {thread.author_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-2xs text-slate-400 truncate">{thread.author_name}</span>
          </div>
          <div className="flex items-center gap-3 text-2xs flex-shrink-0">
            <span className="flex items-center gap-1 text-slate-500">
              <Eye className="h-3 w-3" />
              {thread.view_count}
            </span>
            {thread.is_translation_pack ? (
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Download className="h-3 w-3" />
                {thread.download_count}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-500">
                <MessageSquare className="h-3 w-3" />
                {thread.reply_count}
              </span>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="text-2xs text-slate-600 mt-2">
          {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale })}
        </div>
      </div>
    </button>
  );
}

// ─── THREAD ROW ─────────────────────────────────────────────────────────────

interface ThreadRowProps {
  thread: ForumThread;
  locale: Locale;
  onClick: () => void;
}

function ThreadRow({ thread, locale, onClick }: ThreadRowProps) {
  const { t } = useTranslation();
  const category = thread.category as ForumCategory | undefined;
  const theme = category ? (CATEGORY_THEMES[category.slug] || DEFAULT_THEME) : DEFAULT_THEME;
  const Icon = category ? (CATEGORY_ICONS[category.slug] || MessageSquare) : MessageSquare;

  return (
    <button
      onClick={onClick}
      className="w-full group relative rounded-xl overflow-hidden text-left transition-all duration-200 hover:scale-[1.01]"
    >
      {/* Hover gradient */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r',
        thread.is_translation_pack ? 'from-amber-500/10 to-orange-500/5' : 'from-violet-500/10 to-indigo-500/5'
      )} />
      
      <div className="relative flex items-center gap-4 p-4 bg-slate-900/60 border border-slate-800/60 rounded-xl backdrop-blur-sm group-hover:border-slate-700/80 transition-colors">
        {/* Avatar with category indicator */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12 ring-2 ring-slate-800 group-hover:ring-violet-500/40 transition-all">
            <AvatarImage src={thread.author_avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-sm text-white font-bold">
              {thread.author_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Category icon badge */}
          <div className={cn(
            'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-slate-900',
            theme.iconBg
          )}>
            <Icon className={cn('h-2.5 w-2.5', theme.icon)} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row with badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {thread.is_pinned && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-2xs font-medium">
                <Pin className="h-2.5 w-2.5" />
              </span>
            )}
            {thread.is_locked && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-2xs">
                <Lock className="h-2.5 w-2.5" />
              </span>
            )}
            {thread.is_solved && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-2xs font-medium">
                <CheckCircle2 className="h-2.5 w-2.5" /> Risolto
              </span>
            )}
            {thread.is_translation_pack && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 text-2xs font-bold">
                <Package className="h-2.5 w-2.5" /> PACK
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold text-white group-hover:text-violet-100 transition-colors line-clamp-1 mb-1">
            {thread.title}
          </h3>

          {/* Pack info */}
          {thread.is_translation_pack && thread.pack_data && (
            <div className="flex items-center gap-2 mb-1.5 text-xs">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-amber-300">
                <Gamepad2 className="h-3 w-3" />
                {thread.pack_data.game_name}
              </span>
              <span className="font-mono text-2xs text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                {thread.pack_data.source_lang} → {thread.pack_data.target_lang}
              </span>
              {thread.pack_data.string_count > 0 && (
                <span className="text-slate-500 text-2xs">
                  {thread.pack_data.string_count.toLocaleString()} stringhe
                </span>
              )}
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-400 font-medium">{thread.author_name}</span>
            <span className="text-slate-700">•</span>
            {category && (
              <>
                <span className={cn('font-medium', theme.accent)}>
                  {t(`forum.categoryNames.${category.slug}`) || category.name}
                </span>
                <span className="text-slate-700">•</span>
              </>
            )}
            <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true, locale })}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-1 text-slate-300 font-bold text-sm">
              <MessageSquare className="h-3.5 w-3.5" />
              {thread.reply_count}
            </div>
            <span className="text-2xs text-slate-500 uppercase">{t('forum.replies')}</span>
          </div>
          <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-slate-800/50">
            <div className="flex items-center gap-1 text-slate-300 font-bold text-sm">
              <Eye className="h-3.5 w-3.5" />
              {thread.view_count}
            </div>
            <span className="text-2xs text-slate-500 uppercase">{t('forum.visits')}</span>
          </div>
          {thread.is_translation_pack ? (
            <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-amber-500/10">
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Download className="h-3.5 w-3.5" />
                {thread.download_count}
              </div>
              <span className="text-2xs text-amber-500/70 uppercase">{t('forum.downloads')}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-rose-500/10">
              <div className="flex items-center gap-1 text-rose-400 font-bold text-sm">
                <Heart className="h-3.5 w-3.5" />
                {thread.like_count}
              </div>
              <span className="text-2xs text-rose-500/70 uppercase">{t('forum.likes')}</span>
            </div>
          )}
        </div>

        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </button>
  );
}

// ─── EMPTY STATE ────────────────────────────────────────────────────────────

function EmptyState({ hasAnyThreads, onNewThread }: { hasAnyThreads: boolean; onNewThread: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-transparent border border-slate-800 border-dashed">
      <div className="relative w-20 h-20 mb-4">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 blur-xl" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center">
          {hasAnyThreads ? (
            <Search className="h-9 w-9 text-violet-300" />
          ) : (
            <MessageSquarePlus className="h-9 w-9 text-violet-300" />
          )}
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-200 mb-2">
        {hasAnyThreads ? (t('forum.noThreads') || 'Nessun thread trovato') : (t('forum.beTheFirst') || 'Sii il primo!')}
      </h3>
      <p className="text-sm text-slate-400 max-w-sm mb-5">
        {hasAnyThreads
          ? (t('forum.tryFilters') || 'Prova a modificare i filtri o la ricerca')
          : (t('forum.emptyDescription') || 'Nessuna discussione qui. Apri il primo thread e avvia la conversazione con la community!')}
      </p>
      <Button
        onClick={onNewThread}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30"
      >
        <Plus className="h-4 w-4 mr-1" />
        {t('forum.newThread')}
      </Button>
    </div>
  );
}

// ─── THREAD LIST SKELETON ───────────────────────────────────────────────────

function ThreadListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 animate-pulse"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-800 rounded w-3/4" />
            <div className="h-2 bg-slate-800 rounded w-1/2" />
          </div>
          <div className="hidden sm:flex gap-4">
            <div className="w-8 h-6 bg-slate-800 rounded" />
            <div className="w-8 h-6 bg-slate-800 rounded" />
            <div className="w-8 h-6 bg-slate-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

type Locale = typeof it;

