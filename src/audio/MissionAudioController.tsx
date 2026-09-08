/* eslint-disable react-refresh/only-export-components -- the audio store and its route observer intentionally share one engine singleton. */
import { useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useGameState } from '@/hooks/useGameState';
import { createMissionAudioEngine, type MissionAudioEngine } from './missionAudioEngine';

export const MISSION_AUDIO_STORAGE_KEY = 'mission-portfolio:audio-muted:v1';

const engine = createMissionAudioEngine();

interface MissionAudioState {
  muted: boolean;
  supported: boolean;
  setMuted: (muted: boolean) => Promise<void>;
  toggle: () => Promise<void>;
}

const persistMuted = (muted: boolean) => {
  try {
    window.localStorage.setItem(MISSION_AUDIO_STORAGE_KEY, JSON.stringify(muted));
  } catch {
    // Audio preference remains usable in memory when storage is unavailable.
  }
};

export const useMissionAudioState = create<MissionAudioState>((set, get) => ({
  muted: true,
  supported: engine.supported,
  setMuted: async (muted) => {
    if (!engine.supported) return;
    if (muted) {
      engine.disable();
      set({ muted: true });
      persistMuted(true);
      return;
    }
    const enabled = await engine.enable();
    set({ muted: !enabled });
    if (enabled) persistMuted(false);
  },
  toggle: async () => get().setMuted(!get().muted),
}));

export interface MissionAudioControllerProps {
  audioEngine?: MissionAudioEngine;
}

export const MissionAudioController = ({ audioEngine = engine }: MissionAudioControllerProps) => {
  const currentView = useGameState((state) => state.currentView);
  const selectedPlanet = useGameState((state) => state.selectedPlanet);
  const muted = useMissionAudioState((state) => state.muted);
  const previousView = useRef(currentView);
  const previousPlanet = useRef(selectedPlanet);

  useEffect(() => {
    if (muted) return;
    audioEngine.setPlanet(selectedPlanet);

    if (previousPlanet.current !== selectedPlanet && selectedPlanet) {
      audioEngine.playCue('lock-on');
    }
    if (previousView.current !== currentView) {
      if (currentView === 'intercepting' || currentView === 'traveling') audioEngine.playCue('travel');
      if (currentView === 'planet') audioEngine.playCue('arrival');
    }
    previousView.current = currentView;
    previousPlanet.current = selectedPlanet;
  }, [audioEngine, currentView, muted, selectedPlanet]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) audioEngine.suspend();
      else if (!useMissionAudioState.getState().muted) audioEngine.resume();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [audioEngine]);

  useEffect(() => () => audioEngine.destroy(), [audioEngine]);

  return null;
};
