import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TutorialProvider } from '@/components/tutorial/tutorial-provider';
import { TutorialOverlay } from '@/components/tutorial/tutorial-overlay';
import { TutorialMenu } from '@/components/tutorial/tutorial-menu';
import { useTutorialTrigger } from '@/hooks/use-tutorial-trigger';
import { dashboardTutorial } from '@/lib/tutorial-configs';

// NOTE sull'implementazione ATTUALE coperta da questi test:
// - TutorialOverlay mostra il contatore "N / TOT" (non "Step N of TOT") e i
//   bottoni usano le chiavi i18n tutorial.overlay.{skip,back,forward,done}.
//   Il mock globale di useTranslation (src/test/setup.ts) restituisce la
//   chiave stessa, quindi i bottoni si trovano con getByText('tutorial.overlay.*').
// - useTutorialTrigger consuma useTutorial(): va chiamato DENTRO il
//   TutorialProvider, altrimenti riceve il fallback no-op.
// - startTutorial() su un tutorial già attivo lo fa ripartire dallo step 0
//   (comportamento voluto, usato per il "restart").

// Mock dependencies
vi.mock('@/lib/utils/database', () => ({
  TutorialDatabase: {
    updateProgress: vi.fn(),
    markTutorialSkipped: vi.fn(),
    getUserProgress: vi.fn().mockResolvedValue(null)
  }
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/lib/utils/ux-enhancements', () => ({
  createSystemEvent: vi.fn(),
  elementExists: vi.fn().mockReturnValue(true),
  getElementPosition: vi.fn().mockReturnValue({
    top: 100,
    left: 100,
    width: 200,
    height: 50
  }),
  scrollToElement: vi.fn(),
  prefersReducedMotion: vi.fn().mockReturnValue(false),
  LocalStorage: {
    get: vi.fn().mockReturnValue(false),
    set: vi.fn(),
    remove: vi.fn()
  }
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/'
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode }) => (
      <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
    )
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

const TOTAL_STEPS = dashboardTutorial.steps.length; // 9
const stepCounter = (n: number) => `${n} / ${TOTAL_STEPS}`;

const FORWARD = 'tutorial.overlay.forward';
const DONE = 'tutorial.overlay.done';
const SKIP = 'tutorial.overlay.skip';

// Deve stare DENTRO il TutorialProvider: useTutorialTrigger usa useTutorial()
function TutorialControls() {
  const { startSpecificTutorial } = useTutorialTrigger({ autoStart: false });

  return (
    <button onClick={() => startSpecificTutorial('dashboard-intro')}>
      Start Dashboard Tutorial
    </button>
  );
}

// Test component that integrates tutorial system.
// withTargets=false simula una pagina dove i target degli step non esistono.
function IntegratedTutorialApp({ withTargets = true }: { withTargets?: boolean }) {
  return (
    <TutorialProvider userId="test-user">
      <div>
        <h1>GameStringer Dashboard</h1>
        <TutorialMenu userId="test-user" />
        <TutorialOverlay />

        {/* Mock elements that tutorials target */}
        {withTargets && (
          <>
            <aside data-testid="sidebar">Sidebar</aside>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- target del tutorial: gli step selezionano 'a[href="/library"]', serve un anchor reale */}
            <a href="/library" data-testid="library-link">Library</a>
            <a href="/injekt-translator" data-testid="translator-link">Neural Translator</a>
            <a href="/editor" data-testid="editor-link">Editor</a>
            <a href="/patches" data-testid="patches-link">Patches</a>
            <a href="/settings" data-testid="settings-link">Settings</a>
            <div data-testid="system-status">System Status</div>
          </>
        )}

        <TutorialControls />
      </div>
    </TutorialProvider>
  );
}

describe('Tutorial System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should render tutorial system components without errors', () => {
    render(<IntegratedTutorialApp />);

    expect(screen.getByText('GameStringer Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Start Dashboard Tutorial')).toBeInTheDocument();
  });

  it('should start tutorial and show overlay', async () => {
    render(<IntegratedTutorialApp />);

    // Start tutorial
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    // Should show tutorial overlay elements
    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });
    expect(screen.getByText(dashboardTutorial.steps[0].title)).toBeInTheDocument();
  });

  it('should navigate through tutorial steps', async () => {
    render(<IntegratedTutorialApp />);

    // Start tutorial
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    // Find and click next button
    fireEvent.click(screen.getByText(FORWARD));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(2))).toBeInTheDocument();
    });

    // Back button
    fireEvent.click(screen.getByText('tutorial.overlay.back'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });
  });

  it('should show tutorial menu with accessible trigger button', () => {
    render(<IntegratedTutorialApp />);

    // Il trigger del TutorialMenu è icon-only con aria-label i18n
    // (il mock di useTranslation restituisce la chiave 'nav.tutorialAndGuide')
    const tutorialButton = screen.getByRole('button', { name: 'nav.tutorialAndGuide' });
    expect(tutorialButton).toBeInTheDocument();
  });

  it('should handle tutorial completion', async () => {
    render(<IntegratedTutorialApp />);

    // Start tutorial
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    // Naviga fino all'ultimo step (tutti i target esistono, nessuno step
    // opzionale viene saltato)
    for (let i = 0; i < TOTAL_STEPS - 1; i++) {
      fireEvent.click(screen.getByText(FORWARD));
      await waitFor(() => {
        expect(screen.getByText(stepCounter(i + 2))).toBeInTheDocument();
      });
    }

    // Sull'ultimo step il bottone forward diventa "done"
    fireEvent.click(screen.getByText(DONE));

    // Tutorial should be completed and overlay hidden
    await waitFor(() => {
      expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
    });
  });

  it('should handle tutorial skip functionality', async () => {
    render(<IntegratedTutorialApp />);

    // Start tutorial
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    // Skip tutorial
    fireEvent.click(screen.getByText(SKIP));

    // Tutorial should be hidden
    await waitFor(() => {
      expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation', async () => {
    render(<IntegratedTutorialApp />);

    // Start tutorial
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    // Test right arrow key navigation
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.getByText(stepCounter(2))).toBeInTheDocument();
    });

    // Test left arrow key navigation
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    // Test escape key to skip
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
    });
  });

  it('should show progress indicator correctly', async () => {
    render(<IntegratedTutorialApp />);

    // Start tutorial
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    // Progress indicator should be visible and show correct progress
    const progressElements = screen.getAllByText(/\d+ \/ \d+/);
    expect(progressElements.length).toBeGreaterThan(0);
  });

  it('should handle tutorial restart after skip', async () => {
    render(<IntegratedTutorialApp />);

    // Start tutorial and advance
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    // Advance to step 2
    fireEvent.click(screen.getByText(FORWARD));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(2))).toBeInTheDocument();
    });

    // Skip tutorial to end it
    fireEvent.click(screen.getByText(SKIP));

    await waitFor(() => {
      expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
    });

    // Restart tutorial
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });
  });

  it('should handle missing tutorial targets gracefully', async () => {
    // Nessun target degli step esiste nel DOM: l'overlay deve degradare a
    // card centrata senza highlight, senza crashare
    render(<IntegratedTutorialApp withTargets={false} />);

    // Start tutorial - should not crash even with missing targets
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    // Should be able to navigate even with missing targets (lo step 2,
    // target 'aside', non è opzionale: viene mostrato comunque)
    fireEvent.click(screen.getByText(FORWARD));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(2))).toBeInTheDocument();
    });
  });

  it('should restart from first step when startTutorial is called while active', async () => {
    render(<IntegratedTutorialApp />);

    // Start tutorial and advance to step 2
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(FORWARD));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(2))).toBeInTheDocument();
    });

    // Comportamento attuale: ri-avviare il tutorial mentre è attivo lo fa
    // ripartire dallo step 0 (non viene ignorato)
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });
  });

  it('should handle window resize during tutorial', async () => {
    render(<IntegratedTutorialApp />);

    // Start tutorial
    fireEvent.click(screen.getByText('Start Dashboard Tutorial'));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(1))).toBeInTheDocument();
    });

    // Simulate window resize
    fireEvent(window, new Event('resize'));

    // Tutorial should still be visible and functional
    expect(screen.getByText(stepCounter(1))).toBeInTheDocument();

    // Should still be able to navigate
    fireEvent.click(screen.getByText(FORWARD));

    await waitFor(() => {
      expect(screen.getByText(stepCounter(2))).toBeInTheDocument();
    });
  });
});
