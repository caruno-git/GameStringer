import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { Notification, NotificationType, NotificationPriority } from '@/types/notifications';
import { useNotifications } from '@/hooks/use-notifications';

// Mock delle dipendenze
vi.mock('@/hooks/use-notifications', () => ({
  useNotifications: vi.fn()
}));

// Il focusManager DEVE avere identità stabile tra i render: l'hook vero la
// garantisce con useRef(singleton), e l'effect del componente lo tiene nelle
// dependency facendo setState. Un oggetto nuovo a ogni render qui causava un
// loop di render infinito dentro act() → OOM del worker vitest (8GB).
const { stableFocusManager } = vi.hoisted(() => ({
  stableFocusManager: {
    focusNotificationCenter: vi.fn(),
    restoreFocus: vi.fn(),
    focusSearch: vi.fn()
  }
}));

vi.mock('@/hooks/use-keyboard-navigation', () => ({
  useKeyboardNavigation: vi.fn(() => ({
    focusManager: stableFocusManager
  })),
  useNotificationListNavigation: vi.fn()
}));

vi.mock('@/lib/notifications/notification-accessibility', () => ({
  announceFilterChange: vi.fn(),
  announceSearchResults: vi.fn(),
  announceBatchOperation: vi.fn()
}));

vi.mock('@/components/notifications/keyboard-shortcuts-help', () => ({
  KeyboardShortcutsHelp: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="keyboard-help" onClick={onClose}>Keyboard Help</div> : null
}));

// Mock notification di test
const createMockNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: `notif-${Math.random().toString(36).substring(2, 11)}`,
  profileId: 'test-profile',
  type: NotificationType.SYSTEM,
  title: 'Test Notification',
  message: 'This is a test notification message',
  priority: NotificationPriority.NORMAL,
  createdAt: new Date().toISOString(),
  metadata: {
    source: 'test',
    category: 'test',
    tags: []
  },
  ...overrides
});

const mockNotifications: Notification[] = [
  createMockNotification({
    id: 'notif-1',
    title: 'System Update',
    type: NotificationType.SYSTEM,
    priority: NotificationPriority.HIGH
  }),
  createMockNotification({
    id: 'notif-2',
    title: 'Profile Created',
    type: NotificationType.PROFILE,
    priority: NotificationPriority.NORMAL,
    readAt: new Date().toISOString()
  }),
  createMockNotification({
    id: 'notif-3',
    title: 'Security Alert',
    type: NotificationType.SECURITY,
    priority: NotificationPriority.URGENT
  })
];

describe('NotificationCenter', () => {
  const mockUseNotifications = {
    notifications: mockNotifications,
    unreadCount: 2,
    isLoading: false,
    markAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    clearAllNotifications: vi.fn(),
    refreshNotifications: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotifications).mockReturnValue(mockUseNotifications);
  });

  describe('Rendering', () => {
    it('should render notification center when open', () => {
      render(<NotificationCenter isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Il mock globale di i18n (src/test/setup.ts) restituisce la key stessa
      expect(screen.getByText('common.notifications')).toBeInTheDocument();
      expect(screen.getByText(/2\s+notificationCenter\.newLabel/)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<NotificationCenter isOpen={false} onClose={vi.fn()} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render all notifications', () => {
      render(<NotificationCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByText('System Update')).toBeInTheDocument();
      expect(screen.getByText('Profile Created')).toBeInTheDocument();
      expect(screen.getByText('Security Alert')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        isLoading: true,
        notifications: []
      });

      render(<NotificationCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('should show empty state when no notifications', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        notifications: [],
        unreadCount: 0
      });

      render(<NotificationCenter isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText('No notifications')).toBeInTheDocument();
      expect(screen.getByText('Your notifications will appear here')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should close when clicking outside', async () => {
      const mockOnClose = vi.fn();
      const user = userEvent.setup();

      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);

      // L'elemento con role="dialog" è l'overlay/backdrop stesso:
      // il click fuori dal pannello interno chiude il centro notifiche.
      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close when clicking close button', async () => {
      const mockOnClose = vi.fn();
      const user = userEvent.setup();

      render(<NotificationCenter isOpen={true} onClose={mockOnClose} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<NotificationCenter isOpen={true} onClose={vi.fn()} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      // Il mock globale di i18n (src/test/setup.ts) restituisce la key stessa
      expect(dialog).toHaveAttribute('aria-label', 'common.notificationCenter');
    });

    it('should have proper heading structure', () => {
      render(<NotificationCenter isOpen={true} onClose={vi.fn()} />);
      
      expect(screen.getByRole('heading', { name: 'common.notifications' })).toBeInTheDocument();
    });

    it('should have accessible search input', () => {
      render(<NotificationCenter isOpen={true} onClose={vi.fn()} />);
      
      const searchInput = screen.getByRole('textbox', { name: 'notificationCenter.searchAria' });
      expect(searchInput).toHaveAttribute('aria-describedby', 'search-help');
    });
  });
});
