import { useEffect, useRef, useState } from 'react';
import { Disc3, Music, RotateCcw, Sparkles, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createDiscoAudioEngine, type DiscoAudioEngine } from '@/audio/discoAudioEngine';
import { matchesDiscoRhythm, useDiscoSun } from '@/features/endgame/discoSun';

const defaultAudioEngine = createDiscoAudioEngine();

interface DiscoSunExperienceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivated?: () => void;
  now?: () => number;
  audioEngine?: DiscoAudioEngine;
}

export const DiscoSunExperience = ({
  open,
  onOpenChange,
  onActivated,
  now = () => performance.now(),
  audioEngine = defaultAudioEngine,
}: DiscoSunExperienceProps) => {
  const active = useDiscoSun((state) => state.active);
  const activate = useDiscoSun((state) => state.activate);
  const deactivate = useDiscoSun((state) => state.deactivate);
  const [taps, setTaps] = useState<number[]>([]);
  const [message, setMessage] = useState('Tap four beats: short, short, long.');
  const activationReported = useRef(false);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) audioEngine.suspend();
      else if (useDiscoSun.getState().active) audioEngine.resume();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      audioEngine.stop();
    };
  }, [audioEngine]);

  const activateProtocol = () => {
    activate();
    audioEngine.start();
    setTaps([]);
    setMessage('Solar rhythm locked. Every orbit is now on the dance floor.');
    if (!activationReported.current) {
      activationReported.current = true;
      onActivated?.();
    }
  };

  const tapBeat = () => {
    const next = [...taps, now()].slice(-4);
    setTaps(next);
    if (next.length < 4) {
      setMessage(`Beat ${next.length} of 4 recorded.`);
      return;
    }
    if (matchesDiscoRhythm(next)) activateProtocol();
    else {
      setTaps([]);
      setMessage('Rhythm missed. Try short, short, then a longer pause.');
    }
  };

  const restore = () => {
    deactivate();
    audioEngine.stop();
    activationReported.current = false;
    setMessage('Disco protocol stopped. The Sun is pretending this never happened.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[2160] w-[calc(100vw-2rem)] max-w-2xl overflow-hidden border-pink-300/40 bg-[#080213]/98 p-0 text-white shadow-[0_0_100px_rgba(236,72,153,0.2)]">
        <div aria-hidden="true" className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_35%,rgba(34,211,238,0.16),rgba(217,70,239,0.2),rgba(250,204,21,0.18),rgba(34,211,238,0.16))] motion-safe:animate-[spin_12s_linear_infinite]" />
        <div className="relative z-10 bg-black/55 p-5 backdrop-blur-xl sm:p-8">
          <DialogHeader className="pr-8 text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-pink-200/70">Solar protocol 54 // Rhythm lock</p>
            <DialogTitle className="font-heading text-2xl sm:text-4xl">Disco Sun</DialogTitle>
            <DialogDescription className="text-white/60">
              Match the hidden rhythm to synchronize procedural music, colored light, and orbital trails.
            </DialogDescription>
          </DialogHeader>

          <div className="my-7 flex justify-center">
            <button
              type="button"
              onClick={tapBeat}
              disabled={active}
              className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-yellow-100/70 bg-[radial-gradient(circle_at_35%_30%,#fff,#fde047_12%,#f97316_42%,#db2777_72%,#581c87)] shadow-[0_0_80px_rgba(250,204,21,0.45)] transition-transform active:scale-95 disabled:cursor-default sm:h-52 sm:w-52 motion-safe:animate-pulse"
              aria-label="Tap the Disco Sun beat"
            >
              {active ? <Disc3 aria-hidden="true" className="h-16 w-16 motion-safe:animate-spin" /> : <Sun aria-hidden="true" className="h-16 w-16" />}
            </button>
          </div>

          <p role="status" aria-live="polite" className="text-center font-mono text-xs leading-6 text-pink-100">{message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {!active ? (
              <Button type="button" onClick={activateProtocol} className="min-h-12 gap-2 bg-pink-300 text-slate-950 hover:bg-pink-200">
                <Sparkles aria-hidden="true" className="h-4 w-4" /> Use accessible activation
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={restore} className="min-h-12 gap-2 border-white/25 bg-black/25 text-white hover:bg-white/10 hover:text-white">
                <RotateCcw aria-hidden="true" className="h-4 w-4" /> Restore quiet Sun
              </Button>
            )}
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-white/35">
            <Music aria-hidden="true" className="h-3.5 w-3.5" /> Audio begins only after activation. Visual rhythm remains available without audio support.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
