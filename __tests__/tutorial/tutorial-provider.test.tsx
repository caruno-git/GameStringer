import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TutorialProvider, useTutorial } from '@/components/tutorial/tutorial-provider';
import { TutorialConfig } from '@/lib/types/tutorial';

// NOTA: il provider attuale non usa più TutorialDatabase né i toast:
// la persistenza è su localStorage ('gamestringer_completed_tutorials',
// 'tutorialSkipped'). I vecchi test su updateProgress/markTutorialSkipped/
// getUserProgress sono stati sostituiti dagli equivalenti localStorage.
// localStorage è mockato globalmente in src/test/setup.ts con vi.fn() che
// NON memorizzano: le assertion verificano le chiamate a setItem.

const COMPLETED_KEY = 'gamestringer_completed_tutorials';

// Test tutorial configuration
const mockTutorial: TutorialConfig = {
  id: 'test-tutorial',
  name: 'Test Tutorial',
  description: 'A test tutorial',
  canSkip: true,
  showProgress: true,
  steps: [
    {
      id: 'step-1',
      title: 'Step 1',
      description: 'First step',
      target: '#test-element',
      position: 'bottom'
    },
    {
      id: 'step-2',
      title: 'Step 2',
      description: 'Second step',
      target: '#test-element-2',
      position: 'top',
      optional: true
    },
    {
      id: 'step-3',
      title: 'Step 3',
      description: 'Final step',
      target: '#test-element-3',
      position: 'right',
      validation: () => true
    }
  ]
};

// Test component that uses the tutorial context (API attuale del provider:
// campi flat + alias `state`, niente steps/completed/canSkip nel context).
function TestComponent() {
  const {
    isActive,
    currentStep,
    totalSteps,
    currentTutorial,
    currentStepData,
    startTutorial,
    nextStep,
    prevStep,
    endTutorial,
    skipTutorial,
    goToStep,
    state
  } = useTutorial();

  return (
    <div>
      {/* Target degli step: nextStep() salta gli step opzionali il cui
          target non esiste nel DOM, quindi li rendiamo presenti. */}
      <div id="test-element" />
      <div id="test-element-2" />
      <div id="test-element-3" />

      <div data-testid="tutorial-active">{isActive.toString()}</div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="total-steps">{totalSteps}</div>
      <div data-testid="state-active">{state.isActive.toString()}</div>
      <div data-testid="tutorial-id">{currentTutorial?.id ?? 'none'}</div>
      <div data-testid="step-id">{currentStepData?.id ?? 'none'}</div>

      <button onClick={() => startTutorial(mockTutorial)}>Start Tutorial</button>
      <button onClick={() => startTutorial()}>Start Without Config</button>
      <button onClick={nextStep}>Next Step</button>
      <button onClick={prevStep}>Previous Step</button>
      <button onClick={skipTutorial}>Skip Tutorial</button>
      <button onClick={endTutorial}>End Tutorial</button>
      <button onClick={() => goToStep(1)}>Set Step 1</button>
      <button onClick={() => goToStep(99)}>Set Invalid Step</button>
    </div>
  );
}

describe('TutorialProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide initial tutorial state', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('false');
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(screen.getByTestId('total-steps')).toHaveTextContent('0');
    expect(screen.getByTestId('tutorial-id')).toHaveTextContent('none');
    expect(screen.getByTestId('step-id')).toHaveTextContent('none');
  });

  it('should start tutorial correctly', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    fireEvent.click(screen.getByText('Start Tutorial'));

    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('true');
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(screen.getByTestId('total-steps')).toHaveTextContent('3');
    expect(screen.getByTestId('tutorial-id')).toHaveTextContent('test-tutorial');
    expect(screen.getByTestId('step-id')).toHaveTextContent('step-1');
  });

  it('should not start tutorial when no config is provided', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    fireEvent.click(screen.getByText('Start Without Config'));

    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('false');
    expect(screen.getByTestId('tutorial-id')).toHaveTextContent('none');
  });

  it('should navigate through tutorial steps', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    // Start tutorial
    fireEvent.click(screen.getByText('Start Tutorial'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');

    // Next step (lo step 2 è opzionale ma il suo target esiste, non viene saltato)
    fireEvent.click(screen.getByText('Next Step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('1');

    // Previous step
    fireEvent.click(screen.getByText('Previous Step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');

    // Set specific step
    fireEvent.click(screen.getByText('Set Step 1'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('1');
  });

  it('should ignore goToStep with out-of-range index', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    fireEvent.click(screen.getByText('Start Tutorial'));
    fireEvent.click(screen.getByText('Set Invalid Step'));

    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
  });

  it('should complete tutorial on last step', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    // Start tutorial and go to last step
    fireEvent.click(screen.getByText('Start Tutorial'));
    fireEvent.click(screen.getByText('Set Step 1'));
    fireEvent.click(screen.getByText('Next Step')); // Go to step 2 (last step)

    expect(screen.getByTestId('current-step')).toHaveTextContent('2');
    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('true');

    // Complete tutorial by going to next step from last step
    fireEvent.click(screen.getByText('Next Step'));

    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('false');
    expect(screen.getByTestId('tutorial-id')).toHaveTextContent('none');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      COMPLETED_KEY,
      JSON.stringify(['test-tutorial'])
    );
  });

  it('should end tutorial and mark it completed', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    fireEvent.click(screen.getByText('Start Tutorial'));
    fireEvent.click(screen.getByText('End Tutorial'));

    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('false');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      COMPLETED_KEY,
      JSON.stringify(['test-tutorial'])
    );
  });

  it('should skip tutorial', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    // Start tutorial
    fireEvent.click(screen.getByText('Start Tutorial'));
    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('true');

    // Skip tutorial
    fireEvent.click(screen.getByText('Skip Tutorial'));
    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('false');
    expect(screen.getByTestId('tutorial-id')).toHaveTextContent('none');
  });

  it('should skip optional steps when their target is missing', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    fireEvent.click(screen.getByText('Start Tutorial'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');

    // Rimuovi il target dello step opzionale: nextStep() deve saltarlo
    document.getElementById('test-element-2')?.remove();

    fireEvent.click(screen.getByText('Next Step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('2');
    expect(screen.getByTestId('step-id')).toHaveTextContent('step-3');
  });

  it('should restart tutorial when started again', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    // Start tutorial and advance
    fireEvent.click(screen.getByText('Start Tutorial'));
    fireEvent.click(screen.getByText('Next Step'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('1');

    // Restart: startTutorial() riparte dallo step 0
    fireEvent.click(screen.getByText('Start Tutorial'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('true');
  });

  it('should persist completed tutorial to localStorage', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    fireEvent.click(screen.getByText('Start Tutorial'));
    fireEvent.click(screen.getByText('End Tutorial'));

    expect(localStorage.setItem).toHaveBeenCalledWith(
      COMPLETED_KEY,
      JSON.stringify(['test-tutorial'])
    );
  });

  it('should mark tutorial as skipped in localStorage', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    // Start and skip tutorial
    fireEvent.click(screen.getByText('Start Tutorial'));
    fireEvent.click(screen.getByText('Skip Tutorial'));

    expect(localStorage.setItem).toHaveBeenCalledWith('tutorialSkipped', 'true');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      COMPLETED_KEY,
      JSON.stringify(['test-tutorial'])
    );
  });

  it('should handle keyboard navigation', () => {
    render(
      <TutorialProvider>
        <TestComponent />
      </TutorialProvider>
    );

    // Start tutorial
    fireEvent.click(screen.getByText('Start Tutorial'));
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');

    // Test right arrow key
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByTestId('current-step')).toHaveTextContent('1');

    // Test left arrow key
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');

    // Test Enter key
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByTestId('current-step')).toHaveTextContent('1');

    // Test Escape key (skip tutorial)
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('false');
  });

  it('should return an inert fallback when used outside provider', () => {
    // Comportamento ATTUALE e intenzionale dell'hook: fuori dal provider
    // useTutorial() NON lancia, ma restituisce un fallback no-op completo
    // (vedi components/tutorial/tutorial-provider.tsx). Serve ai componenti
    // renderizzati fuori dal MainLayout per non esplodere.
    render(<TestComponent />);

    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('false');
    expect(screen.getByTestId('total-steps')).toHaveTextContent('0');
    expect(screen.getByTestId('state-active')).toHaveTextContent('false');

    // Le azioni sono no-op: startTutorial non attiva nulla
    fireEvent.click(screen.getByText('Start Tutorial'));
    expect(screen.getByTestId('tutorial-active')).toHaveTextContent('false');
  });
});
