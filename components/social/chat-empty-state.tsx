'use client';

import { MessageCircle, Users, Plus, Search, Hash, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatEmptyStateProps {
  onSearchFriends?: () => void;
  onCreateGroup?: () => void;
}

export function ChatEmptyState({ onSearchFriends, onCreateGroup }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      {/* Animated illustration */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 flex items-center justify-center">
          <MessageCircle className="h-10 w-10 text-violet-400" />
          {/* Animated dots */}
          <div className="absolute -top-1 -right-1 flex gap-1">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2">
        Inizia a conversare!
      </h3>
      <p className="text-sm text-slate-400 mb-6 max-w-[280px]">
        Cerca amici o crea un gruppo per iniziare a chattare con la community
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-2 w-full max-w-[240px]">
        <Button
          onClick={onSearchFriends}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0"
        >
          <Search className="h-4 w-4 mr-2" />
          Cerca amici
        </Button>
        <Button
          variant="outline"
          onClick={onCreateGroup}
          className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
        >
          <Hash className="h-4 w-4 mr-2" />
          Crea gruppo
        </Button>
      </div>

      {/* Tips section */}
      <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 w-full max-w-[280px]">
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
          <span className="text-violet-400">💡</span> Suggerimenti:
        </p>
        <ul className="space-y-2 text-left">
          <li className="flex items-start gap-2 text-xs text-slate-400">
            <ArrowRight className="h-3 w-3 text-violet-500 mt-0.5 shrink-0" />
            <span>Trascina un amico qui per aprire chat</span>
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-400">
            <ArrowRight className="h-3 w-3 text-violet-500 mt-0.5 shrink-0" />
            <span>Usa <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-[10px]">Ctrl+K</kbd> per cercare</span>
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-400">
            <ArrowRight className="h-3 w-3 text-violet-500 mt-0.5 shrink-0" />
            <span>Unisciti ai canali community</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Drop zone for drag and drop
interface ChatDropZoneProps {
  isOver: boolean;
  onDrop?: (friendId: string, friendName: string) => void;
}

export function ChatDropZone({ isOver }: ChatDropZoneProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center h-full px-6 py-12 text-center transition-all duration-300',
        'border-2 border-dashed rounded-xl m-4',
        isOver
          ? 'border-violet-400 bg-violet-500/10 scale-[1.02]'
          : 'border-slate-700/50 bg-slate-800/20'
      )}
    >
      <div className={cn(
        'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300',
        isOver ? 'bg-violet-500/30 scale-110' : 'bg-slate-700/30'
      )}>
        <Users className={cn(
          'h-7 w-7 transition-colors',
          isOver ? 'text-violet-300' : 'text-slate-500'
        )} />
      </div>
      <p className={cn(
        'text-sm font-medium transition-colors',
        isOver ? 'text-violet-300' : 'text-slate-400'
      )}>
        {isOver ? 'Rilascia per aprire chat' : 'Trascina un amico qui'}
      </p>
      <p className="text-xs text-slate-500 mt-2">
        Inizia una conversazione diretta
      </p>
    </div>
  );
}

