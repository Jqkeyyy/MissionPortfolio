import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnomalyConsole, type AnomalyConsoleProps } from './AnomalyConsole';
import { useAnomalyProgress } from '@/features/endgame/anomalyProgress';

const createProps = (overrides: Partial<AnomalyConsoleProps> = {}): AnomalyConsoleProps => ({
  isComplete: true,
  chaosModeEnabled: false,
  onOpenDeveloperMoon: vi.fn(),
  onChaosModeChange: vi.fn(),
  onRevealEventHorizon: vi.fn(),
  onOpenCosmicArchitect: vi.fn(),
  onOpenAlienSignal: vi.fn(),
  onOpenRoguePlanet: vi.fn(),
  onOpenOrbitReplay: vi.fn(),
  onOpenHabTerminal: vi.fn(),
  onOpenSupernova: vi.fn(),
  onOpenPlanetFusion: vi.fn(),
  onOpenGravityGun: vi.fn(),
  spacePetEnabled: false,
  onSpacePetChange: vi.fn(),
  discoSunActive: false,
  onOpenDiscoSun: vi.fn(),
  onOpenImpossibleAchievement: vi.fn(),
  newGamePlusActive: false,
  onRestoreNewGamePlus: vi.fn(),
  ...overrides,
});

describe('AnomalyConsole', () => {
  beforeEach(() => {
    useAnomalyProgress.setState({ events: [], freeExplore: true });
  });

  it('does not expose the console before all destinations are complete', () => {
    render(<AnomalyConsole {...createProps({ isComplete: false })} />);
    expect(screen.queryByRole('button', { name: 'ANOMALY CONSOLE' })).not.toBeInTheDocument();
  });

  it('presents the original and post-completion experiments in priority order', () => {
    render(<AnomalyConsole {...createProps()} />);
    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));

    const features = screen.getByRole('list', { name: 'Anomaly experiments' });
    expect(features).toHaveTextContent(
      /Developer Moon.*Chaos Mode.*The Event Horizon.*Cosmic Architect.*Alien Signal Hunt.*Rogue Planet.*Orbit Replay.*Secret HAB Terminal.*Supernova Button.*Planet Fusion.*Gravity Gun.*Space Pet M-0.*Disco Sun.*Impossible Achievement/,
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Anomaly Console');
  });

  it('exposes Chaos Mode as a reversible pressed-state control', () => {
    const onChaosModeChange = vi.fn();
    const props = createProps({ onChaosModeChange });
    const { rerender } = render(<AnomalyConsole {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));

    const enableButton = screen.getByRole('button', { name: 'Enable Chaos Mode' });
    expect(enableButton).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(enableButton);
    expect(onChaosModeChange).toHaveBeenCalledWith(true);

    rerender(<AnomalyConsole {...props} chaosModeEnabled />);
    const restoreButton = screen.getByRole('button', { name: 'Restore Stable Universe' });
    expect(restoreButton).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(restoreButton);
    expect(onChaosModeChange).toHaveBeenLastCalledWith(false);
  });

  it('dispatches the Developer Moon, Event Horizon, and Cosmic Architect actions', () => {
    const onOpenDeveloperMoon = vi.fn();
    const onRevealEventHorizon = vi.fn();
    const onOpenCosmicArchitect = vi.fn();
    render(<AnomalyConsole {...createProps({ onOpenDeveloperMoon, onRevealEventHorizon, onOpenCosmicArchitect })} />);
    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));

    fireEvent.click(screen.getByRole('button', { name: 'Land on Developer Moon' }));
    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reveal the Event Horizon' }));
    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open Cosmic Architect' }));
    expect(onOpenDeveloperMoon).toHaveBeenCalledOnce();
    expect(onRevealEventHorizon).toHaveBeenCalledOnce();
    expect(onOpenCosmicArchitect).toHaveBeenCalledOnce();
  });

  it('shows challenge clues, conceals secrets, and allows a visitor bypass', () => {
    useAnomalyProgress.setState({ events: [], freeExplore: false });
    render(<AnomalyConsole {...createProps()} />);
    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
    expect(screen.getByText('Try Chaos Mode.')).toBeInTheDocument();
    expect(screen.getByText(/5 unknown signals/)).toBeInTheDocument();
    expect(screen.queryByText('Secret HAB Terminal')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Challenge locked' })[0]).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Reveal all experiments' }));
    expect(screen.getByText('Secret HAB Terminal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Access HAB Terminal' })).toBeEnabled();
  });

  it('dispatches all five new endgame actions', () => {
    const actions = {
      onOpenAlienSignal: vi.fn(),
      onOpenRoguePlanet: vi.fn(),
      onOpenOrbitReplay: vi.fn(),
      onOpenHabTerminal: vi.fn(),
      onOpenSupernova: vi.fn(),
    };
    render(<AnomalyConsole {...createProps(actions)} />);

    for (const [name, callback] of [
      ['Open Signal Receiver', actions.onOpenAlienSignal],
      ['Track Rogue Planet', actions.onOpenRoguePlanet],
      ['Start Orbit Replay', actions.onOpenOrbitReplay],
      ['Access HAB Terminal', actions.onOpenHabTerminal],
      ['Arm Supernova', actions.onOpenSupernova],
    ] as const) {
      fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
      fireEvent.click(screen.getByRole('button', { name }));
      expect(callback).toHaveBeenCalledOnce();
    }
  });

  it('restores the original timeline without reopening the cinematic', () => {
    const onRestoreNewGamePlus = vi.fn();
    const onOpenSupernova = vi.fn();
    render(<AnomalyConsole {...createProps({ newGamePlusActive: true, onRestoreNewGamePlus, onOpenSupernova })} />);
    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
    const restore = screen.getByRole('button', { name: 'Restore Original Timeline' });
    expect(restore).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(restore);
    expect(onRestoreNewGamePlus).toHaveBeenCalledOnce();
    expect(onOpenSupernova).not.toHaveBeenCalled();
  });

  it('dispatches the five latest experiments and exposes reversible pet and disco state', () => {
    const actions = {
      onOpenPlanetFusion: vi.fn(),
      onOpenGravityGun: vi.fn(),
      onSpacePetChange: vi.fn(),
      onOpenDiscoSun: vi.fn(),
      onOpenImpossibleAchievement: vi.fn(),
    };
    render(<AnomalyConsole {...createProps(actions)} />);

    for (const [name, callback] of [
      ['Open Fusion Chamber', actions.onOpenPlanetFusion],
      ['Equip Gravity Gun', actions.onOpenGravityGun],
    ] as const) {
      fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
      fireEvent.click(screen.getByRole('button', { name }));
      expect(callback).toHaveBeenCalledOnce();
    }

    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
    const deploy = screen.getByRole('button', { name: 'Deploy M-0' });
    expect(deploy).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(deploy);
    expect(actions.onSpacePetChange).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('button', { name: 'Enter Rhythm Lock' }));
    expect(actions.onOpenDiscoSun).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));
    fireEvent.click(screen.getByRole('button', { name: 'Inspect Classified Challenge' }));
    expect(actions.onOpenImpossibleAchievement).toHaveBeenCalledOnce();
  });
});
