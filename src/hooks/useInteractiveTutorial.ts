import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewMode } from '@/hooks/useGameState';

export type InteractiveTutorialStatus = 'idle' | 'running' | 'complete';

export interface InteractiveTutorialStep {
  id: string;
  title: string;
  instruction: string;
  target?: string;
  action?: string;
}

export const interactiveTutorialSteps = [
  {
    id: 'select-sun',
    title: 'Start with the Sun',
    instruction: 'Click the Sun in the center of the solar system to begin your mission.',
    target: 'sun',
  },
  {
    id: 'travel-to-sun',
    title: 'Travel to the Sun',
    instruction: 'Your shuttle is on autopilot. You can watch the approach or use Skip travel.',
  },
  {
    id: 'enter-base-camp',
    title: 'Enter the base camp',
    instruction: 'Click the highlighted base camp to step inside the habitat.',
    target: 'base-camp',
    action: 'enter-base-camp',
  },
  {
    id: 'sit-computer',
    title: 'Sit at the computer',
    instruction: 'Click the highlighted stool to sit down and start HAB OS.',
    target: 'sit-computer',
    action: 'sit-computer',
  },
  {
    id: 'open-archive',
    title: 'Open Mission Archive',
    instruction: 'When HAB OS finishes starting, click the highlighted Mission Archive folder.',
    target: 'mission-archive',
    action: 'open-archive',
  },
  {
    id: 'open-welcome',
    title: 'Open Welcome, Pilot',
    instruction: 'The archive contains the story for this destination. Open Welcome, Pilot first.',
    target: 'file-intro-1',
    action: 'open-file-intro-1',
  },
  {
    id: 'close-welcome',
    title: 'Return to the archive',
    instruction: 'Close this file so you can open the next highlighted mission brief.',
    target: 'close-mission-file',
    action: 'close-mission-file',
  },
  {
    id: 'open-brief',
    title: 'Open Mission Brief',
    instruction: 'Now open Mission Brief to see how the rest of the portfolio is organized.',
    target: 'file-intro-2',
    action: 'open-file-intro-2',
  },
] as const satisfies readonly InteractiveTutorialStep[];

interface UseInteractiveTutorialOptions {
  currentView: ViewMode;
  currentPlanetId: string | null;
  onStart?: () => void;
  onComplete?: () => void;
  onExit?: () => void;
  onAnnounce?: (message: string) => void;
}

export interface InteractiveTutorialController {
  status: InteractiveTutorialStatus;
  currentStepIndex: number;
  currentStep: InteractiveTutorialStep;
  announcement: string;
  start: () => void;
  exit: () => void;
}

export const useInteractiveTutorial = ({
  currentView,
  currentPlanetId,
  onStart,
  onComplete,
  onExit,
  onAnnounce,
}: UseInteractiveTutorialOptions): InteractiveTutorialController => {
  const [status, setStatus] = useState<InteractiveTutorialStatus>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('Interactive tutorial ready.');
  const statusRef = useRef(status);
  const stepRef = useRef(currentStepIndex);
  const callbacksRef = useRef({ onStart, onComplete, onExit, onAnnounce });
  callbacksRef.current = { onStart, onComplete, onExit, onAnnounce };

  const publish = useCallback((message: string) => {
    setAnnouncement(message);
    callbacksRef.current.onAnnounce?.(message);
  }, []);

  const setStep = useCallback((nextIndex: number) => {
    stepRef.current = nextIndex;
    setCurrentStepIndex(nextIndex);
    const nextStep = interactiveTutorialSteps[nextIndex];
    publish(`Tutorial step ${nextIndex + 1} of ${interactiveTutorialSteps.length}. ${nextStep.title}. ${nextStep.instruction}`);
  }, [publish]);

  const complete = useCallback(() => {
    statusRef.current = 'complete';
    setStatus('complete');
    publish('Tutorial complete. You opened the Sun mission brief and can now explore any destination.');
    callbacksRef.current.onComplete?.();
  }, [publish]);

  const advance = useCallback(() => {
    if (statusRef.current !== 'running') return;
    const nextIndex = stepRef.current + 1;
    if (nextIndex >= interactiveTutorialSteps.length) {
      complete();
      return;
    }
    setStep(nextIndex);
  }, [complete, setStep]);

  const start = useCallback(() => {
    statusRef.current = 'running';
    setStatus('running');
    callbacksRef.current.onStart?.();
    setStep(0);
  }, [setStep]);

  const exit = useCallback(() => {
    if (statusRef.current === 'idle') return;
    const wasRunning = statusRef.current === 'running';
    statusRef.current = 'idle';
    setStatus('idle');
    stepRef.current = 0;
    setCurrentStepIndex(0);
    publish('Tutorial closed. Manual exploration remains available.');
    if (wasRunning) callbacksRef.current.onExit?.();
  }, [publish]);

  useEffect(() => {
    if (status !== 'running') return;
    const step = interactiveTutorialSteps[currentStepIndex];

    if (
      step.id === 'select-sun'
      && currentPlanetId === 'sun'
      && (currentView === 'intercepting' || currentView === 'traveling' || currentView === 'planet')
    ) {
      setStep(currentView === 'planet' ? 2 : 1);
      return;
    }

    if (step.id === 'travel-to-sun' && currentPlanetId === 'sun' && currentView === 'planet') {
      setStep(2);
    }
  }, [currentPlanetId, currentStepIndex, currentView, setStep, status]);

  useEffect(() => {
    if (status !== 'running') return;

    const handleTutorialAction = (event: MouseEvent) => {
      const actionElement = (event.target as Element | null)?.closest<HTMLElement>('[data-tutorial-action]');
      const activeStep = interactiveTutorialSteps[stepRef.current];
      const expectedAction = 'action' in activeStep ? activeStep.action : undefined;
      if (!expectedAction || actionElement?.dataset.tutorialAction !== expectedAction) return;
      advance();
    };

    document.addEventListener('click', handleTutorialAction, true);
    return () => document.removeEventListener('click', handleTutorialAction, true);
  }, [advance, status]);

  useEffect(() => {
    if (status === 'idle') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      exit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exit, status]);

  return {
    status,
    currentStepIndex,
    currentStep: interactiveTutorialSteps[currentStepIndex],
    announcement,
    start,
    exit,
  };
};
