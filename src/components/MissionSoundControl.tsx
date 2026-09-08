import { Volume2, VolumeX } from 'lucide-react';
import { useMissionAudioState } from '@/audio/MissionAudioController';
import { cn } from '@/lib/utils';

export const MissionSoundControl = ({ className }: { className?: string }) => {
  const muted = useMissionAudioState((state) => state.muted);
  const supported = useMissionAudioState((state) => state.supported);
  const toggle = useMissionAudioState((state) => state.toggle);

  return (
    <button
      type="button"
      aria-label={muted ? 'Enable mission sound' : 'Mute mission sound'}
      aria-pressed={!muted}
      disabled={!supported}
      onClick={() => { void toggle(); }}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded border border-primary/35 bg-background/70 px-3 font-heading text-xs tracking-wide text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
    >
      {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
      {supported ? (muted ? 'Sound off' : 'Sound on') : 'Sound unavailable'}
    </button>
  );
};
