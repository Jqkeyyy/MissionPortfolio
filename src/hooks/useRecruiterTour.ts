import { useCallback, useEffect, useRef, useState } from 'react';
import {
  recruiterTour,
  type RecruiterTourStop,
} from '@/data/recruiterTour';
import { getPlanetById } from '@/data/planets';

export type RecruiterTourStatus = 'idle' | 'running' | 'paused' | 'complete';
export type RecruiterTourExitReason = 'exit' | 'recovery';

interface UseRecruiterTourOptions {
  currentView: string;
  currentPlanetId: string | null;
  onTravelTo: (planetId: string) => void;
  onAnnounce?: (message: string) => void;
  onStart?: () => void;
  onComplete?: () => void;
  onExit?: (reason: RecruiterTourExitReason) => void;
  isRecovering?: boolean;
  route?: readonly RecruiterTourStop[];
}

export interface RecruiterTourController {
  status: RecruiterTourStatus;
  currentStepIndex: number;
  currentStop: RecruiterTourStop;
  remainingDwellMs: number;
  announcement: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  nextStop: () => void;
  exit: () => void;
}

const stopName = (stop: RecruiterTourStop) => (
  getPlanetById(stop.planetId)?.displayName ?? stop.planetId
);

export const useRecruiterTour = ({
  currentView,
  currentPlanetId,
  onTravelTo,
  onAnnounce,
  onStart,
  onComplete,
  onExit,
  isRecovering = false,
  route = recruiterTour,
}: UseRecruiterTourOptions): RecruiterTourController => {
  if (route.length === 0) {
    throw new Error('The recruiter tour requires at least one stop.');
  }

  const [status, setStatus] = useState<RecruiterTourStatus>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingDwellMs, setRemainingDwellMs] = useState(route[0].dwellMs);
  const [announcement, setAnnouncement] = useState('Guided recruiter tour ready.');

  const statusRef = useRef(status);
  const stepRef = useRef(currentStepIndex);
  const remainingRef = useRef(remainingDwellMs);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellStartedAtRef = useRef(0);
  const navigationPendingRef = useRef(false);
  const callbacksRef = useRef({ onTravelTo, onAnnounce, onStart, onComplete, onExit });
  callbacksRef.current = { onTravelTo, onAnnounce, onStart, onComplete, onExit };

  const publishAnnouncement = useCallback((message: string) => {
    setAnnouncement(message);
    callbacksRef.current.onAnnounce?.(message);
  }, []);

  const clearDwellTimer = useCallback((preserveRemainder: boolean) => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;

    if (preserveRemainder) {
      const elapsed = Math.max(0, Date.now() - dwellStartedAtRef.current);
      const nextRemaining = Math.max(0, remainingRef.current - elapsed);
      remainingRef.current = nextRemaining;
      setRemainingDwellMs(nextRemaining);
    }
  }, []);

  const completeTour = useCallback(() => {
    clearDwellTimer(false);
    navigationPendingRef.current = false;
    statusRef.current = 'complete';
    setStatus('complete');
    remainingRef.current = 0;
    setRemainingDwellMs(0);
    publishAnnouncement('Guided tour complete at Neptune. Choose Quick Portfolio or explore freely.');
    callbacksRef.current.onComplete?.();
  }, [clearDwellTimer, publishAnnouncement]);

  const advanceRef = useRef<() => void>(() => undefined);
  advanceRef.current = () => {
    if (navigationPendingRef.current) return;

    clearDwellTimer(false);
    const index = stepRef.current;
    if (index >= route.length - 1) {
      completeTour();
      return;
    }

    const nextIndex = index + 1;
    const nextStop = route[nextIndex];
    stepRef.current = nextIndex;
    remainingRef.current = nextStop.dwellMs;
    navigationPendingRef.current = true;
    setCurrentStepIndex(nextIndex);
    setRemainingDwellMs(nextStop.dwellMs);
    publishAnnouncement(`Traveling to ${stopName(nextStop)}. Step ${nextIndex + 1} of ${route.length}.`);
    callbacksRef.current.onTravelTo(nextStop.planetId);
  };

  const start = useCallback(() => {
    clearDwellTimer(false);
    const firstStop = route[0];
    statusRef.current = 'running';
    stepRef.current = 0;
    remainingRef.current = firstStop.dwellMs;
    navigationPendingRef.current = true;
    setStatus('running');
    setCurrentStepIndex(0);
    setRemainingDwellMs(firstStop.dwellMs);
    publishAnnouncement(`Guided tour started. Traveling to ${stopName(firstStop)}. Step 1 of ${route.length}.`);
    callbacksRef.current.onStart?.();
    callbacksRef.current.onTravelTo(firstStop.planetId);
  }, [clearDwellTimer, publishAnnouncement, route]);

  const pause = useCallback(() => {
    if (statusRef.current !== 'running') return;
    clearDwellTimer(true);
    statusRef.current = 'paused';
    setStatus('paused');
    publishAnnouncement(`Guided tour paused with ${Math.ceil(remainingRef.current / 1000)} seconds remaining at this stop.`);
  }, [clearDwellTimer, publishAnnouncement]);

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return;
    statusRef.current = 'running';
    setStatus('running');
    publishAnnouncement('Guided tour resumed.');
  }, [publishAnnouncement]);

  const nextStop = useCallback(() => {
    if (statusRef.current !== 'running' && statusRef.current !== 'paused') return;
    advanceRef.current();
  }, []);

  const stopTour = useCallback((reason: RecruiterTourExitReason) => {
    clearDwellTimer(false);
    navigationPendingRef.current = false;
    statusRef.current = 'idle';
    setStatus('idle');
    const message = reason === 'recovery'
      ? 'Guided tour stopped while immersive exploration recovered.'
      : 'Guided tour exited. Manual exploration remains available.';
    publishAnnouncement(message);
    callbacksRef.current.onExit?.(reason);
  }, [clearDwellTimer, publishAnnouncement]);

  const exit = useCallback(() => stopTour('exit'), [stopTour]);

  useEffect(() => {
    if (status !== 'running') return;
    const stop = route[currentStepIndex];
    const hasArrived = currentView === 'planet' && currentPlanetId === stop.planetId;

    if (!hasArrived) {
      clearDwellTimer(true);
      return;
    }

    navigationPendingRef.current = false;
    if (timerRef.current !== null) return;

    publishAnnouncement(`Arrived at ${stopName(stop)}. Step ${currentStepIndex + 1} of ${route.length}.`);
    dwellStartedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      remainingRef.current = 0;
      setRemainingDwellMs(0);
      advanceRef.current();
    }, remainingRef.current);
  }, [clearDwellTimer, currentPlanetId, currentStepIndex, currentView, publishAnnouncement, route, status]);

  useEffect(() => {
    if (isRecovering && statusRef.current !== 'idle') {
      stopTour('recovery');
    }
  }, [isRecovering, stopTour]);

  useEffect(() => () => clearDwellTimer(false), [clearDwellTimer]);

  return {
    status,
    currentStepIndex,
    currentStop: route[currentStepIndex],
    remainingDwellMs,
    announcement,
    start,
    pause,
    resume,
    nextStop,
    exit,
  };
};
