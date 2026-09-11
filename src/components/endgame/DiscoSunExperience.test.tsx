import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDiscoSun } from '@/features/endgame/discoSun';
import type { DiscoAudioEngine } from '@/audio/discoAudioEngine';
import { DiscoSunExperience } from './DiscoSunExperience';

const audioEngine: DiscoAudioEngine = {
  supported: true,
  start: vi.fn(() => true),
  stop: vi.fn(),
  suspend: vi.fn(),
  resume: vi.fn(),
};

describe('DiscoSunExperience', () => {
  beforeEach(() => {
    useDiscoSun.setState({ active: false });
    vi.clearAllMocks();
  });

  it('offers an accessible activation and reversible audio', () => {
    const onActivated = vi.fn();
    render(<DiscoSunExperience open onOpenChange={vi.fn()} onActivated={onActivated} audioEngine={audioEngine} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use accessible activation' }));
    expect(useDiscoSun.getState().active).toBe(true);
    expect(audioEngine.start).toHaveBeenCalledOnce();
    expect(onActivated).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Restore quiet Sun' }));
    expect(useDiscoSun.getState().active).toBe(false);
    expect(audioEngine.stop).toHaveBeenCalled();
  });

  it('unlocks from the four-tap rhythm', () => {
    const times = [0, 320, 640, 1320];
    render(<DiscoSunExperience open onOpenChange={vi.fn()} now={() => times.shift() ?? 0} audioEngine={audioEngine} />);
    const sun = screen.getByRole('button', { name: 'Tap the Disco Sun beat' });
    for (let index = 0; index < 4; index += 1) fireEvent.click(sun);
    expect(useDiscoSun.getState().active).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('Solar rhythm locked');
  });
});
