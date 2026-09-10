import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AnomalyConsole, type AnomalyConsoleProps } from './AnomalyConsole';

const createProps = (overrides: Partial<AnomalyConsoleProps> = {}): AnomalyConsoleProps => ({
  isComplete: true,
  chaosModeEnabled: false,
  onOpenDeveloperMoon: vi.fn(),
  onChaosModeChange: vi.fn(),
  onRevealEventHorizon: vi.fn(),
  onOpenCosmicArchitect: vi.fn(),
  ...overrides,
});

describe('AnomalyConsole', () => {
  it('does not expose the console before all destinations are complete', () => {
    render(<AnomalyConsole {...createProps({ isComplete: false })} />);
    expect(screen.queryByRole('button', { name: 'ANOMALY CONSOLE' })).not.toBeInTheDocument();
  });

  it('presents the four experiments in priority order after completion', () => {
    render(<AnomalyConsole {...createProps()} />);
    fireEvent.click(screen.getByRole('button', { name: 'ANOMALY CONSOLE' }));

    const features = screen.getByRole('list', { name: 'Unlocked anomaly experiments' });
    expect(features).toHaveTextContent(/Developer Moon.*Chaos Mode.*The Event Horizon.*Cosmic Architect/);
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
});
