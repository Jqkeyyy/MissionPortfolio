import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { ALIEN_SIGNAL_STORAGE_KEY, type AlienSignalStorage } from '@/features/endgame/alienSignalHunt';
import { AlienSignalHunt, type AlienSignalHuntProps } from './AlienSignalHunt';

const createMemoryStorage = (): AlienSignalStorage & { value: string | null } => ({
  value: null,
  getItem() {
    return this.value;
  },
  setItem(_key, value) {
    this.value = value;
  },
  removeItem() {
    this.value = null;
  },
});

const createProps = (overrides: Partial<AlienSignalHuntProps> = {}): AlienSignalHuntProps => ({
  open: true,
  onOpenChange: vi.fn(),
  activePlanetId: null,
  onNavigateToPlanet: vi.fn(),
  storage: createMemoryStorage(),
  ...overrides,
});

describe('AlienSignalHunt', () => {
  it('renders only while open and introduces the optional hunt accessibly', () => {
    const props = createProps({ open: false });
    const { rerender } = render(<AlienSignalHunt {...props} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<AlienSignalHunt {...props} open />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Alien Signal Hunt');
    expect(screen.getByRole('heading', { name: /something is transmitting/i })).toBeInTheDocument();
  });

  it('starts, plots an accessible course, and persists progress', () => {
    const storage = createMemoryStorage();
    const onOpenChange = vi.fn();
    const onNavigateToPlanet = vi.fn();
    render(<AlienSignalHunt {...createProps({ storage, onOpenChange, onNavigateToPlanet })} />);

    fireEvent.click(screen.getByRole('button', { name: /start triangulation/i }));
    const progressbar = screen.getByRole('progressbar', { name: /signal fragments recovered/i });
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');

    fireEvent.click(screen.getByRole('button', { name: /plot course to mercury/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onNavigateToPlanet).toHaveBeenCalledWith('mercury');
    expect(storage.value).toContain('"started":true');
    expect(storage.getItem(ALIEN_SIGNAL_STORAGE_KEY)).toBe(storage.value);
  });

  it('captures a packet on arrival and announces it to the host', async () => {
    const storage = createMemoryStorage();
    const onFragmentCollected = vi.fn();
    const props = createProps({ storage, onFragmentCollected });
    const { rerender } = render(<AlienSignalHunt {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /start triangulation/i }));

    rerender(<AlienSignalHunt {...props} activePlanetId="mercury" />);
    await waitFor(() => expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1'));
    expect(screen.getByText('STAY')).toBeInTheDocument();
    expect(screen.getByText(/Mercury · 88.1 MHz/)).toBeInTheDocument();
    expect(onFragmentCollected).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'carrier-01', planetId: 'mercury' }),
      expect.objectContaining({ collectedFragmentIds: ['carrier-01'] }),
    );
  });

  it('does not repeat collection when the host announcement rerenders its callbacks', async () => {
    const storage = createMemoryStorage();
    storage.value = JSON.stringify({ version: 1, started: true, collectedFragmentIds: [] });

    const Host = () => {
      const [announcements, setAnnouncements] = useState(0);
      return (
        <>
          <output aria-label="Collection announcements">{announcements}</output>
          <AlienSignalHunt
            {...createProps({ storage, activePlanetId: 'mercury' })}
            onFragmentCollected={() => setAnnouncements((count) => count + 1)}
          />
        </>
      );
    };

    render(<Host />);
    await waitFor(() => expect(screen.getByLabelText('Collection announcements')).toHaveTextContent('1'));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  it('decodes the complete message and opens the secret destination', async () => {
    const storage = createMemoryStorage();
    storage.value = JSON.stringify({
      version: 1,
      started: true,
      collectedFragmentIds: ['carrier-01', 'carrier-02', 'carrier-03', 'carrier-04'],
    });
    const onDecoded = vi.fn();
    render(<AlienSignalHunt {...createProps({ storage, activePlanetId: 'neptune', onDecoded })} />);

    await waitFor(() => expect(screen.getByText('STAY CURIOUS. BUILD USEFUL THINGS.')).toBeInTheDocument());
    expect(onDecoded).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: /enter the listening post/i }));

    expect(screen.getByRole('dialog')).toHaveAccessibleName('THE LISTENING POST');
    expect(screen.getByRole('heading', { name: 'You looked closer.' })).toBeInTheDocument();
    expect(screen.getByText(/good software starts with paying attention/i)).toBeInTheDocument();
  });
});
