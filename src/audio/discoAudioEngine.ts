type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

export interface DiscoAudioEngine {
  readonly supported: boolean;
  start: () => boolean;
  stop: () => void;
  suspend: () => void;
  resume: () => void;
}

export const createDiscoAudioEngine = (): DiscoAudioEngine => {
  const AudioContextConstructor = typeof window === 'undefined'
    ? undefined
    : window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  let context: AudioContext | null = null;
  let timer: number | null = null;
  let beat = 0;

  const playBeat = () => {
    if (!context || context.state === 'closed') return;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      const notes = [110, 164.81, 220, 164.81];
      oscillator.type = beat % 4 === 0 ? 'square' : 'triangle';
      oscillator.frequency.setValueAtTime(notes[beat % notes.length], now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.18);
      oscillator.addEventListener('ended', () => {
        oscillator.disconnect();
        gain.disconnect();
      }, { once: true });
      beat += 1;
    } catch {
      // Disco audio is optional; visuals remain complete on audio failure.
    }
  };

  const stop = () => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    const closing = context;
    context = null;
    if (closing) void closing.close().catch(() => undefined);
  };

  return {
    supported: Boolean(AudioContextConstructor),
    start: () => {
      if (!AudioContextConstructor) return false;
      if (context) return true;
      try {
        context = new AudioContextConstructor();
        void context.resume().catch(() => undefined);
        playBeat();
        timer = window.setInterval(playBeat, 420);
        return true;
      } catch {
        stop();
        return false;
      }
    },
    stop,
    suspend: () => { if (context) void context.suspend().catch(() => undefined); },
    resume: () => { if (context) void context.resume().catch(() => undefined); },
  };
};
