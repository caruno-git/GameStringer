import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { NotificationIndicator } from '@/components/notifications/notification-indicator';
import { useNotifications } from '@/hooks/use-notifications';
import { announceNotificationCount } from '@/lib/notifications/notification-accessibility';

// Mock delle dipendenze
vi.mock('@/hooks/use-notifications', () => ({
  useNotifications: vi.fn()
}));

vi.mock('@/lib/notifications/notification-accessibility', () => ({
  announceNotificationCount: vi.fn(),
  createHelpText: vi.fn(() => 'Help text for notification indicator')
}));

describe('NotificationIndicator', () => {
  const mockUseNotifications = {
    unreadCount: 0,
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotifications).mockReturnValue(mockUseNotifications);
  });

  describe('Rendering', () => {
    it('should render notification indicator', () => {
      render(<NotificationIndicator />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should show bell icon when no notifications', () => {
      render(<NotificationIndicator />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'No unread notifications. Click to open notification center.');
    });

    it('should show bell ring icon when has notifications', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 3
      });

      render(<NotificationIndicator />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', '3 unread notifications. Click to open notification center.');
    });

    it('should show loading state', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        isLoading: true
      });

      render(<NotificationIndicator />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-label', 'Loading notifications...');
    });
  });

  describe('Badge Display', () => {
    // Il badge attuale è un marker di alert ('!', aria-hidden): il conteggio
    // è esposto via aria-label e descrizione sr-only, non come testo visibile.
    it('should show alert badge when has notifications', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 5
      });

      render(<NotificationIndicator showBadge={true} />);

      expect(screen.getByText('!')).toBeInTheDocument();
      expect(screen.getByText('You have 5 unread notifications')).toBeInTheDocument();
    });

    it('should expose the full count via aria-label when count exceeds maxCount', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 150
      });

      render(<NotificationIndicator showBadge={true} maxCount={99} />);

      expect(screen.getByText('!')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        '150 unread notifications. Click to open notification center.'
      );
    });

    it('should not show badge when showBadge is false', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 5
      });

      render(<NotificationIndicator showBadge={false} />);
      
      expect(screen.queryByText('5')).not.toBeInTheDocument();
      // Should show simple indicator dot instead
      const button = screen.getByRole('button');
      const indicator = button.querySelector('.bg-red-500');
      expect(indicator).toBeInTheDocument();
    });

    it('should not show badge when no notifications', () => {
      render(<NotificationIndicator showBadge={true} />);
      
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClick when clicked', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();

      render(<NotificationIndicator onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should not call onClick when disabled', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();

      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        isLoading: true
      });

      render(<NotificationIndicator onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should be keyboard accessible', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();

      render(<NotificationIndicator onClick={mockOnClick} />);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('Animations', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    // L'animazione attuale è 'animate-bounce' sull'icona BellRing
    // (più 'scale-110' sul badge), non 'animate-pulse' sul bottone.
    it('should animate when new notifications arrive', () => {
      const { rerender } = render(<NotificationIndicator animate={true} />);

      // Update with new notifications
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 2
      });

      rerender(<NotificationIndicator animate={true} />);

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('animate-bounce');

      // Animation should stop after timeout
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByRole('button').querySelector('svg')).not.toHaveClass('animate-bounce');
    });

    it('should not animate when animate is false', () => {
      const { rerender } = render(<NotificationIndicator animate={false} />);

      // Update with new notifications
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 2
      });

      rerender(<NotificationIndicator animate={false} />);

      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).not.toHaveClass('animate-bounce');
    });

    it('should show animated indicator for new notifications', () => {
      const { rerender } = render(<NotificationIndicator animate={true} />);

      // Update with new notifications
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 1
      });

      rerender(<NotificationIndicator animate={true} />);

      // Il badge di alert viene ingrandito durante l'animazione
      const badge = screen.getByText('!');
      expect(badge).toHaveClass('scale-110');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<NotificationIndicator />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'notification-help');
    });

    it('should have proper ARIA attributes with notifications', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 3
      });

      render(<NotificationIndicator />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'notification-count-description notification-help');
    });

    it('should have hidden description for screen readers', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 1
      });

      render(<NotificationIndicator />);

      expect(screen.getByText('You have 1 unread notification')).toHaveClass('sr-only');
    });

    it('should have plural description for multiple notifications', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 5
      });

      render(<NotificationIndicator />);

      expect(screen.getByText('You have 5 unread notifications')).toHaveClass('sr-only');
    });

    it('should announce new notifications to screen readers', () => {
      const { rerender } = render(<NotificationIndicator />);

      // Update with new notifications
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 2
      });

      rerender(<NotificationIndicator />);

      expect(vi.mocked(announceNotificationCount)).toHaveBeenCalledWith(2, 0);
    });

    it('should have focus styles', () => {
      render(<NotificationIndicator />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary/50');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      render(<NotificationIndicator className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should maintain base classes with custom className', () => {
      render(<NotificationIndicator className="custom-class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('relative', 'h-8', 'w-8', 'rounded-full');
    });
  });

  describe('Badge Variants', () => {
    it('should show red alert badge by default', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 1
      });

      render(<NotificationIndicator />);

      const badge = screen.getByText('!');
      expect(badge).toHaveClass('bg-red-500');
    });

    it('should handle zero count correctly', () => {
      render(<NotificationIndicator />);
      
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      const TestComponent = () => {
        renderSpy();
        return <NotificationIndicator />;
      };

      const { rerender } = render(<TestComponent />);
      
      // Same props should not cause re-render
      rerender(<TestComponent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(2); // Initial + rerender
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative unread count', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: -1
      });

      render(<NotificationIndicator />);

      // Should treat negative as zero
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'No unread notifications. Click to open notification center.');
    });

    it('should handle very large unread count', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: 999999
      });

      render(<NotificationIndicator maxCount={999} />);

      // Il badge è un marker '!': il conteggio completo resta nell'aria-label
      expect(screen.getByText('!')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        '999999 unread notifications. Click to open notification center.'
      );
    });

    it('should handle undefined unread count', () => {
      vi.mocked(useNotifications).mockReturnValue({
        ...mockUseNotifications,
        unreadCount: undefined
      });

      render(<NotificationIndicator />);

      // Should treat undefined as zero
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'No unread notifications. Click to open notification center.');
    });
  });
});
