'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Pin, 
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Hand
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Benvenuto nella Community!',
    description: 'GameStringer ora ha funzioni social per connetterti con altri giocatori e traduttori. Scopriamo come funziona.',
    icon: <Users className="h-8 w-8 text-violet-400" />,
  },
  {
    id: 'friends',
    title: 'La tua Lista Amici',
    description: 'Qui vedi tutti i tuoi amici connessi. Gli avatar con bordo verde sono online, gialli sono assenti, rossi occupati.',
    icon: <Users className="h-8 w-8 text-emerald-400" />,
    highlight: 'friends-list',
  },
  {
    id: 'quick-access',
    title: 'Accesso Rapido',
    description: 'Trascina i tuoi amici preferiti qui sopra per averli sempre a portata di mano. Clicca per aprire chat immediatamente!',
    icon: <Pin className="h-8 w-8 text-violet-400" />,
    highlight: 'quick-access',
  },
  {
    id: 'drag-drop',
    title: 'Drag & Drop',
    description: 'Prova a trascinare un amico dalla lista all\'area Accesso Rapido. Puoi anche riordinarli trascinandoli!',
    icon: <Hand className="h-8 w-8 text-blue-400" />,
    highlight: 'drag-demo',
  },
  {
    id: 'chat',
    title: 'Chat e Messaggi',
    description: 'Clicca su un amico per aprire la chat. Puoi anche trascinarlo direttamente nel pannello chat!',
    icon: <MessageCircle className="h-8 w-8 text-blue-400" />,
    highlight: 'chat-panel',
  },
  {
    id: 'search',
    title: 'Trova Nuovi Amici',
    description: 'Usa il pulsante "+" in alto per cercare utenti e inviare richieste di amicizia. Inizia a costruire la tua rete!',
    icon: <Search className="h-8 w-8 text-amber-400" />,
  },
];

const STORAGE_KEY = 'gs_social_onboarding_seen';

export function SocialOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setIsOpen(true);
    }
    setIsHydrated(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isHydrated || !isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Spotlight effect for highlighted areas */}
      {step.highlight && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            'absolute rounded-xl ring-4 ring-violet-500/50 ring-offset-4 ring-offset-slate-900/0 animate-pulse',
            step.highlight === 'quick-access' && 'top-32 left-4 right-4 h-32',
            step.highlight === 'friends-list' && 'top-48 left-4 right-4 bottom-32',
            step.highlight === 'chat-panel' && 'right-0 top-0 bottom-0 w-80',
          )} />
        </div>
      )}

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Step counter */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  idx === currentStep ? 'w-8 bg-violet-500' : 
                  idx < currentStep ? 'w-2 bg-violet-500/50' : 'w-2 bg-slate-700'
                )}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full blur-xl" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center">
                {step.icon}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-3">
              {step.title}
            </h3>
            <p className="text-slate-400 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(
                'text-slate-400 hover:text-white',
                currentStep === 0 && 'invisible'
              )}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Indietro
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-slate-500 hover:text-slate-300"
              >
                Salta
              </Button>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
              >
                {currentStep === steps.length - 1 ? 'Inizia!' : 'Avanti'}
                {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="px-6 py-3 bg-slate-800/50 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            💡 Puoi ripetere questo tutorial dalle impostazioni in qualsiasi momento
          </p>
        </div>
      </div>
    </div>
  );
}

export function ResetOnboardingButton() {
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleReset}>
      <Users className="h-4 w-4 mr-2" />
      Riprova Tutorial
    </Button>
  );
}

