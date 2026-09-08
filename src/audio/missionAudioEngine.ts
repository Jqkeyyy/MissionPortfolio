import { isPlanetThemeId, type PlanetThemeId } from '@/data/planetThemes';
import {
  MISSION_CUE_PROFILES,
  PLANET_SOUND_PROFILES,
  type MissionCue,
} from './soundProfiles';

type AudioContextFactory = () => AudioContext;

export interface MissionAudioEngine {
  readonly supported: boolean;
  readonly enabled: boolean;
  enable: () => Promise<boolean>;
  disable: () => void;
  setPlanet: (planetId: string | null) => void;
  playCue: (cue: MissionCue) => void;
  suspend: () => void;
  resume: () => void;
  destroy: () => void;
}

interface MissionAudioEngineOptions {
  contextFactory?: AudioContextFactory;
}

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

const browserContextFactory = (): AudioContextFactory | undefined => {
  if (typeof window === 'undefined') return undefined;
  const AudioContextConstructor = window.AudioContext
    ?? (window as AudioWindow).webkitAudioContext;
  return AudioContextConstructor ? () => new AudioContextConstructor() : undefined;
};

const safely = (operation: () => void) => {
  try {
    operation();
  } catch {
    // Audio is optional and must never interrupt exploration.
  }
};

export const createMissionAudioEngine = (
  options: MissionAudioEngineOptions = {},
): MissionAudioEngine => {
  const contextFactory = options.contextFactory ?? browserContextFactory();
  let context: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let humOscillator: OscillatorNode | null = null;
  let humGain: GainNode | null = null;
  let ambienceOscillator: OscillatorNode | null = null;
  let ambienceGain: GainNode | null = null;
  let active = false;
  const transientOscillators = new Set<OscillatorNode>();

  const disconnectNode = (node: AudioNode | null) => {
    if (node) safely(() => node.disconnect());
  };

  const stopOscillator = (oscillator: OscillatorNode | null) => {
    if (!oscillator) return;
    safely(() => oscillator.stop());
    disconnectNode(oscillator);
  };

  const teardown = () => {
    transientOscillators.forEach((oscillator) => stopOscillator(oscillator));
    transientOscillators.clear();
    stopOscillator(humOscillator);
    stopOscillator(ambienceOscillator);
    disconnectNode(humGain);
    disconnectNode(ambienceGain);
    disconnectNode(masterGain);
    humOscillator = null;
    ambienceOscillator = null;
    humGain = null;
    ambienceGain = null;
    masterGain = null;
    active = false;

    const closingContext = context;
    context = null;
    if (closingContext) {
      safely(() => { void closingContext.close().catch(() => undefined); });
    }
  };

  const enable = async () => {
    if (active && context) {
      safely(() => { void context?.resume().catch(() => undefined); });
      return true;
    }
    if (!contextFactory) return false;

    try {
      context = contextFactory();
      masterGain = context.createGain();
      masterGain.gain.setValueAtTime(0.035, context.currentTime);
      masterGain.connect(context.destination);

      humGain = context.createGain();
      humGain.gain.setValueAtTime(0.34, context.currentTime);
      humGain.connect(masterGain);
      humOscillator = context.createOscillator();
      humOscillator.type = 'sine';
      humOscillator.frequency.setValueAtTime(48, context.currentTime);
      humOscillator.connect(humGain);
      humOscillator.start();

      const earthProfile = PLANET_SOUND_PROFILES.earth;
      ambienceGain = context.createGain();
      ambienceGain.gain.setValueAtTime(earthProfile.gain, context.currentTime);
      ambienceGain.connect(masterGain);
      ambienceOscillator = context.createOscillator();
      ambienceOscillator.type = earthProfile.wave;
      ambienceOscillator.frequency.setValueAtTime(earthProfile.carrierHz, context.currentTime);
      ambienceOscillator.connect(ambienceGain);
      ambienceOscillator.start();

      active = true;
      await context.resume().catch(() => undefined);
      return true;
    } catch {
      teardown();
      return false;
    }
  };

  const setPlanet = (planetId: string | null) => {
    if (!active || !context || !ambienceOscillator || !ambienceGain || !planetId) return;
    if (!isPlanetThemeId(planetId)) return;
    const profile = PLANET_SOUND_PROFILES[planetId as PlanetThemeId];
    safely(() => {
      ambienceOscillator!.type = profile.wave;
      ambienceOscillator!.frequency.setTargetAtTime(profile.carrierHz, context!.currentTime, 0.4);
      ambienceGain!.gain.setTargetAtTime(profile.gain, context!.currentTime, 0.5);
    });
  };

  const playCue = (cue: MissionCue) => {
    if (!active || !context || !masterGain || context.state === 'suspended') return;
    const profile = MISSION_CUE_PROFILES[cue];
    safely(() => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      const start = context!.currentTime;
      const end = start + profile.durationSeconds;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(profile.startHz, start);
      oscillator.frequency.exponentialRampToValueAtTime(profile.endHz, end);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(profile.gain, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(gain);
      gain.connect(masterGain!);
      transientOscillators.add(oscillator);
      oscillator.onended = () => {
        transientOscillators.delete(oscillator);
        disconnectNode(oscillator);
        disconnectNode(gain);
      };
      oscillator.start(start);
      oscillator.stop(end);
    });
  };

  return {
    get supported() {
      return Boolean(contextFactory);
    },
    get enabled() {
      return active;
    },
    enable,
    disable: teardown,
    setPlanet,
    playCue,
    suspend: () => {
      if (!active || !context) return;
      safely(() => { void context?.suspend().catch(() => undefined); });
    },
    resume: () => {
      if (!active || !context) return;
      safely(() => { void context?.resume().catch(() => undefined); });
    },
    destroy: teardown,
  };
};
