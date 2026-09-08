import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MissionSoundControl } from './MissionSoundControl';
import { useMissionAudioState } from '@/audio/MissionAudioController';

describe('MissionSoundControl', () => {
  beforeEach(() => {
    useMissionAudioState.setState({ muted: true, supported: true, toggle: vi.fn(async () => undefined) });
  });

  it('starts muted and exposes an accessible pressed-state toggle', () => {
    render(<MissionSoundControl />);
    const button = screen.getByRole('button', { name: /enable mission sound/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(useMissionAudioState.getState().toggle).toHaveBeenCalledOnce();
  });

  it('disables itself when Web Audio is unavailable', () => {
    useMissionAudioState.setState({ supported: false });
    render(<MissionSoundControl />);
    expect(screen.getByRole('button', { name: /enable mission sound/i })).toBeDisabled();
  });
});
