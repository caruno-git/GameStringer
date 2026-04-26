'use client';

import { useState } from 'react';
import { Zap, PinOff, GripVertical, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { QuickAccessItem } from '@/hooks/use-drag-drop';

interface QuickAccessCardProps {
  item: QuickAccessItem;
  onRemove: () => void;
  onClick: () => void;
}

function QuickAccessCard({ item, onRemove, onClick }: QuickAccessCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusColors = {
    online: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    away: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    busy: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    offline: 'bg-slate-500',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex flex-col items-center gap-1.5 p-2 rounded-xl cursor-pointer',
        'bg-slate-800/50 hover:bg-slate-700/60 transition-all duration-200',
        'border border-transparent hover:border-violet-500/30',
        isDragging && 'opacity-50 scale-95 z-50'
      )}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-slate-600/50 rounded"
      >
        <GripVertical className="h-3 w-3 text-slate-500" />
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-600/50 rounded"
      >
        <PinOff className="h-3 w-3 text-slate-500 hover:text-rose-400" />
      </button>

      {/* Avatar with status */}
      <div className="relative">
        <Avatar className="h-12 w-12 ring-2 ring-offset-1 ring-offset-slate-900 transition-all group-hover:ring-violet-500/50">
          <AvatarImage src={item.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs">
            {item.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Status indicator with glow */}
        {item.status && (
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900',
            statusColors[item.status as keyof typeof statusColors] || 'bg-slate-500'
          )} />
        )}
      </div>

      {/* Name */}
      <span className="text-[10px] font-medium text-slate-300 truncate max-w-[60px] text-center leading-tight">
        {item.name}
      </span>

      {/* Message indicator on hover */}
      <div className="absolute -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-violet-500/20 text-violet-300 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
          <MessageCircle className="h-2.5 w-2.5" />
          Chat
        </div>
      </div>
    </div>
  );
}

interface QuickAccessSectionProps {
  items: QuickAccessItem[];
  onRemove: (id: string) => void;
  onClick: (id: string, name: string) => void;
  onReorder: (newOrder: QuickAccessItem[]) => void;
}

export function QuickAccessSection({ items, onRemove, onClick, onReorder }: QuickAccessSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="h-3 w-3" />
          Accesso Rapido
        </span>
        <span className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <QuickAccessCard
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id)}
              onClick={() => onClick(item.id, item.name)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// Empty quick access drop zone
interface QuickAccessDropZoneProps {
  isOver: boolean;
}

export function QuickAccessDropZone({ isOver }: QuickAccessDropZoneProps) {
  return (
    <div
      className={cn(
        'relative p-4 rounded-xl border-2 border-dashed transition-all duration-300',
        'bg-gradient-to-br from-violet-500/5 to-indigo-500/5',
        isOver
          ? 'border-violet-400 bg-violet-500/20 scale-[1.02]'
          : 'border-violet-500/20 hover:border-violet-500/40'
      )}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300',
          isOver
            ? 'bg-violet-500/30 scale-110'
            : 'bg-violet-500/10'
        )}>
          <Zap className={cn(
            'h-5 w-5 transition-colors',
            isOver ? 'text-violet-300' : 'text-violet-400/60'
          )} />
        </div>
        <p className={cn(
          'text-xs font-medium transition-colors',
          isOver ? 'text-violet-300' : 'text-slate-500'
        )}>
          {isOver ? 'Rilascia per aggiungere' : 'Trascina amici qui'}
        </p>
        <p className="text-[10px] text-slate-600 mt-1">
          Accesso rapido ai preferiti
        </p>
      </div>
    </div>
  );
}
