import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ROGUE_PLANET_PAYLOAD } from '@/features/endgame/roguePlanet';
import { RoguePlanetEncounter } from './RoguePlanetEncounter';

describe('RoguePlanetEncounter', () => {
  it('stays absent until opened and exposes a named encounter dialog', () => {
    const { rerender } = render(<RoguePlanetEncounter open={false} onOpenChange={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<RoguePlanetEncounter open onOpenChange={() => {}} />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Rogue Planet Encounter');
    expect(screen.getByRole('heading', { name: /something impossible/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /catch the rogue planet/i })).toBeInTheDocument();
  });

  it('captures the world once and reveals the canonical hidden payload', () => {
    const onCapture = vi.fn();
    render(
      <RoguePlanetEncounter
        open
        onOpenChange={() => {}}
        onCapture={onCapture}
        pass={{
          encounterId: 'rogue-test',
          passIndex: 2,
          approachAngleDeg: 119,
          signalStrengthPercent: 73,
          captureWindowMs: 18_000,
        }}
      />,
    );

    expect(screen.getByText('73%')).toBeInTheDocument();
    expect(screen.getByText('119°')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /catch the rogue planet/i }));

    expect(onCapture).toHaveBeenCalledTimes(1);
    expect(onCapture).toHaveBeenCalledWith(ROGUE_PLANET_PAYLOAD);
    expect(screen.getByRole('heading', { name: ROGUE_PLANET_PAYLOAD.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open recovered case study/i })).toHaveAttribute(
      'href',
      '/projects/mission-portfolio',
    );
  });

  it('offers a direct stable-universe return and resets after closing', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<RoguePlanetEncounter open onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole('button', { name: /catch the rogue planet/i }));
    fireEvent.click(screen.getByRole('button', { name: /release and return/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(<RoguePlanetEncounter open={false} onOpenChange={onOpenChange} />);
    rerender(<RoguePlanetEncounter open onOpenChange={onOpenChange} />);
    expect(screen.getByRole('button', { name: /catch the rogue planet/i })).toBeInTheDocument();
  });
});
