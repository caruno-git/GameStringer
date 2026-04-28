'use client';

import { useState, useCallback, useEffect } from 'react';

export interface QuickAccessItem {
  id: string;
  type: 'friend' | 'chat';
  name: string;
  avatar?: string;
  status?: string;
}

const STORAGE_KEY = 'gs_quick_access';

export function useQuickAccess() {
  const [items, setItems] = useState<QuickAccessItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load quick access:', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save quick access:', e);
      }
    }
  }, [items, isHydrated]);

  const addItem = useCallback((item: QuickAccessItem) => {
    setItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const reorderItems = useCallback((newOrder: QuickAccessItem[]) => {
    setItems(newOrder);
  }, []);

  const isInQuickAccess = useCallback((id: string) => {
    return items.some(i => i.id === id);
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    reorderItems,
    isInQuickAccess,
    isHydrated,
  };
}

