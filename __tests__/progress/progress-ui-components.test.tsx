import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ProgressBar, CircularProgress, IndeterminateProgress } from '@/components/progress/progress-bar';
import { ProgressModal } from '@/components/progress/progress-modal';
import { ProgressNotificationComponent } from '@/components/progress/progress-notification';
import type { OperationProgress, ProgressNotification } from '@/lib/types/progress';

// Mock delle funzioni di utilità
vi.mock('@/lib/utils/progress-calculations', () => ({
  formatDuration: vi.fn((ms) => `${Math.floor(ms / 1000)}s`),
  formatProgress: vi.fn((progress) => `${progress.toFixed(1)}%`),
  ProgressEasing: {
    easeOut: vi.fn((t) => t)
  }
}));

describe('Progress UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('ProgressBar', () => {
    it('should render progress bar with correct percentage', () => {
      // animated={false}: con animated (default) il valore parte da 0 e
      // converge via requestAnimationFrame, quindi subito dopo il render
      // mostrerebbe "0.0%".
      render(<ProgressBar progress={75} animated={false} />);

      expect(screen.getByText('75.0%')).toBeInTheDocument();
    });

    it('should show time remaining when provided', () => {
      render(
        <ProgressBar 
          progress={50} 
          showTimeRemaining={true}
          estimatedTimeRemaining={30000}
        />
      );
      
      expect(screen.getByText('30s rimanenti')).toBeInTheDocument();
    });

    it('should handle different sizes', () => {
      const { rerender } = render(<ProgressBar progress={50} size="sm" />);
      
      let progressElement = document.querySelector('.h-2');
      expect(progressElement).toBeInTheDocument();
      
      rerender(<ProgressBar progress={50} size="lg" />);
      progressElement = document.querySelector('.h-4');
      expect(progressElement).toBeInTheDocument();
    });

    it('should handle different variants', () => {
      const { rerender } = render(<ProgressBar progress={50} variant="success" />);
      
      let progressElement = document.querySelector('.bg-green-500');
      expect(progressElement).toBeInTheDocument();
      
      rerender(<ProgressBar progress={50} variant="error" />);
      progressElement = document.querySelector('.bg-red-500');
      expect(progressElement).toBeInTheDocument();
    });

    it('should clamp progress values to valid range', () => {
      // animated={false} per avere il valore finale subito (vedi sopra)
      const { rerender } = render(<ProgressBar progress={150} animated={false} />);

      // Progress dovrebbe essere limitato a 100%
      expect(screen.getByText('100.0%')).toBeInTheDocument();

      rerender(<ProgressBar progress={-10} animated={false} />);

      // Progress dovrebbe essere limitato a 0%
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should animate progress changes when enabled', () => {
      vi.useFakeTimers();
      
      const { rerender } = render(<ProgressBar progress={0} animated={true} />);
      
      rerender(<ProgressBar progress={50} animated={true} />);
      
      // L'animazione dovrebbe essere gestita da requestAnimationFrame
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      
      vi.useRealTimers();
    });
  });

  describe('CircularProgress', () => {
    it('should render circular progress with percentage', () => {
      render(<CircularProgress progress={60} />);
      
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should hide percentage when showPercentage is false', () => {
      render(<CircularProgress progress={60} showPercentage={false} />);
      
      expect(screen.queryByText('60%')).not.toBeInTheDocument();
    });

    it('should handle different variants', () => {
      render(<CircularProgress progress={50} variant="success" />);
      
      const circleElement = document.querySelector('.stroke-green-500');
      expect(circleElement).toBeInTheDocument();
    });

    it('should calculate correct circle properties', () => {
      render(<CircularProgress progress={50} size={100} strokeWidth={8} />);
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '100');
      expect(svg).toHaveAttribute('height', '100');
    });
  });

  describe('IndeterminateProgress', () => {
    it('should render indeterminate progress bar', () => {
      render(<IndeterminateProgress />);
      
      const progressElement = document.querySelector('.animate-\\[indeterminate_2s_infinite_linear\\]');
      expect(progressElement).toBeInTheDocument();
    });

    it('should handle different sizes and variants', () => {
      render(<IndeterminateProgress size="lg" variant="warning" />);
      
      const containerElement = document.querySelector('.h-4');
      expect(containerElement).toBeInTheDocument();
      
      const progressElement = document.querySelector('.bg-yellow-500');
      expect(progressElement).toBeInTheDocument();
    });
  });

  describe('ProgressModal', () => {
    const mockOperation: OperationProgress = {
      id: 'test-op',
      title: 'Test Operation',
      description: 'Testing progress modal',
      progress: 50,
      status: 'In progress',
      startTime: new Date(Date.now() - 10000),
      canMinimize: true,
      canCancel: true,
      isBackground: false
    };

    it('should render progress modal with operation details', () => {
      render(<ProgressModal operation={mockOperation} />);
      
      expect(screen.getByText('Test Operation')).toBeInTheDocument();
      expect(screen.getByText('Testing progress modal')).toBeInTheDocument();
      expect(screen.getByText('In progress')).toBeInTheDocument();
    });

    it('should show minimize button when canMinimize is true', () => {
      const onMinimize = vi.fn();
      render(<ProgressModal operation={mockOperation} onMinimize={onMinimize} />);

      // Title attuale del bottone (hard-coded in progress-modal.tsx)
      const minimizeButton = screen.getByTitle('Minimize');
      expect(minimizeButton).toBeInTheDocument();

      fireEvent.click(minimizeButton);
      expect(onMinimize).toHaveBeenCalled();
    });

    it('should show cancel button when canCancel is true and operation is in progress', () => {
      const onCancel = vi.fn();
      render(<ProgressModal operation={mockOperation} onCancel={onCancel} />);
      
      // Testo attuale del bottone (hard-coded in progress-modal.tsx)
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeInTheDocument();

      fireEvent.click(cancelButton);
      expect(onCancel).toHaveBeenCalled();
    });

    it('should render minimized version when isMinimized is true', () => {
      render(<ProgressModal operation={mockOperation} isMinimized={true} />);

      // In versione minimizzata dovrebbe mostrare progresso circolare.
      // Il title usa t('common.expand'): il mock globale di useTranslation
      // (src/test/setup.ts) restituisce la chiave stessa.
      const expandButton = screen.getByTitle('common.expand');
      expect(expandButton).toBeInTheDocument();
    });

    it('should show error state when operation has error', () => {
      const errorOperation: OperationProgress = {
        ...mockOperation,
        error: new Error('Test error'),
        status: 'Errore: Test error'
      };
      
      render(<ProgressModal operation={errorOperation} />);
      
      expect(screen.getByText('Errore: Test error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should show completed state when progress is 100%', () => {
      const completedOperation: OperationProgress = {
        ...mockOperation,
        progress: 100,
        status: 'Completato',
        result: 'Operation completed successfully'
      };
      
      render(<ProgressModal operation={completedOperation} />);

      expect(screen.getByText('Completato')).toBeInTheDocument();
      // Testo attuale del box risultato (hard-coded in progress-modal.tsx)
      expect(screen.getByText('Completed successfully')).toBeInTheDocument();
    });

    it('should auto-close completed operations after timeout', async () => {
      vi.useFakeTimers();
      
      const completedOperation: OperationProgress = {
        ...mockOperation,
        progress: 100,
        status: 'Completato'
      };
      
      const onClose = vi.fn();
      render(<ProgressModal operation={completedOperation} onClose={onClose} />);

      // Avanza il tempo di 3 secondi. NB: niente waitFor con i fake timer
      // attivi (i timer interni di waitFor sarebbero anch'essi fake e non
      // scatterebbero mai): advanceTimersByTime esegue il callback in modo
      // sincrono.
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(onClose).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('ProgressNotificationComponent', () => {
    const mockNotification: ProgressNotification = {
      id: 'test-notification',
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info',
      progress: 75
    };

    it('should render notification with correct content', () => {
      render(<ProgressNotificationComponent notification={mockNotification} />);
      
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
      expect(screen.getByText('This is a test notification')).toBeInTheDocument();
    });

    it('should show progress bar when progress is provided', () => {
      // La ProgressBar interna è sempre animated (hard-coded): il valore
      // parte da 0 e converge a 75 via requestAnimationFrame, quindi la
      // larghezza finale non è assertabile in modo deterministico in jsdom.
      // Si verifica il comportamento condizionale: barra presente (track +
      // fill + etichetta percentuale) con progress, assente senza.
      const { rerender } = render(
        <ProgressNotificationComponent notification={mockNotification} />
      );

      // Etichetta percentuale della barra (formatProgress mockato => "N.N%")
      expect(screen.getByText(/^\d+(\.\d+)?%$/)).toBeInTheDocument();
      // Track (size="sm" => h-2) e fill con larghezza inline
      expect(document.querySelector('.h-2')).toBeInTheDocument();
      expect(document.querySelector('.h-2 [style*="width"]')).toBeInTheDocument();

      // Senza progress la barra non viene renderizzata
      rerender(
        <ProgressNotificationComponent
          notification={{ ...mockNotification, progress: undefined }}
        />
      );
      expect(screen.queryByText(/^\d+(\.\d+)?%$/)).not.toBeInTheDocument();
      expect(document.querySelector('.h-2')).not.toBeInTheDocument();
    });

    it('should handle different notification types', () => {
      const { rerender } = render(
        <ProgressNotificationComponent 
          notification={{ ...mockNotification, type: 'success' }} 
        />
      );
      
      let iconElement = document.querySelector('.text-green-500');
      expect(iconElement).toBeInTheDocument();
      
      rerender(
        <ProgressNotificationComponent 
          notification={{ ...mockNotification, type: 'error' }} 
        />
      );
      
      iconElement = document.querySelector('.text-red-500');
      expect(iconElement).toBeInTheDocument();
    });

    it('should show action buttons when provided', () => {
      const onAction = vi.fn();
      const notificationWithActions: ProgressNotification = {
        ...mockNotification,
        actions: [
          { label: 'Action 1', action: vi.fn() },
          { label: 'Action 2', action: vi.fn() }
        ]
      };
      
      render(
        <ProgressNotificationComponent 
          notification={notificationWithActions} 
          onAction={onAction}
        />
      );
      
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Action 1'));
      expect(onAction).toHaveBeenCalledWith(0);
    });

    it('should auto-hide when autoHide is true', async () => {
      vi.useFakeTimers();
      
      const autoHideNotification: ProgressNotification = {
        ...mockNotification,
        autoHide: true,
        duration: 2000
      };
      
      const onClose = vi.fn();
      render(
        <ProgressNotificationComponent 
          notification={autoHideNotification} 
          onClose={onClose}
        />
      );
      
      // Avanza il tempo: 2000ms (autoHide) + 300ms (animazione di uscita).
      // Niente waitFor con i fake timer attivi (vedi nota nel test del modal).
      act(() => {
        vi.advanceTimersByTime(2300);
      });

      expect(onClose).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should handle close button click', () => {
      vi.useFakeTimers();

      const onClose = vi.fn();
      render(
        <ProgressNotificationComponent
          notification={mockNotification}
          onClose={onClose}
        />
      );

      // Il title usa t('common.closeNotification'): il mock globale di
      // useTranslation restituisce la chiave stessa.
      const closeButton = screen.getByTitle('common.closeNotification');
      fireEvent.click(closeButton);

      // onClose viene chiamato dopo i 300ms dell'animazione di uscita
      // (il vecchio setTimeout non assertava mai prima della fine del test)
      expect(onClose).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(onClose).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
