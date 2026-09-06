import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ComputerScreen } from './ComputerScreen';
import { planets } from '@/data/planets';

describe('ComputerScreen', () => {
  const planet = planets.find((p) => p.id === 'earth')!;

  it('renders a menu item for each piece of content', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} onSelectItem={() => {}} />);
    for (const item of planet.content) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('calls onSelectItem with the clicked item', () => {
    const onSelectItem = vi.fn();
    render(<ComputerScreen planet={planet} onClose={() => {}} onSelectItem={onSelectItem} />);
    fireEvent.click(screen.getByText(planet.content[0].title));
    expect(onSelectItem).toHaveBeenCalledWith(planet.content[0]);
    const detailDialog = screen.getByRole('dialog', { name: planet.content[0].title });
    expect(detailDialog).toBeInTheDocument();
    expect(detailDialog).toHaveTextContent(planet.content[0].content.replace(/\s+/g, ' '));
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<ComputerScreen planet={planet} onClose={onClose} onSelectItem={() => {}} />);
    fireEvent.click(screen.getByTestId('computer-screen-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('opens the planet archive as a desktop window', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('desktop-archive'));
    expect(screen.getByRole('dialog', { name: `${planet.displayName} Mission Archive` })).toBeInTheDocument();
  });

  it('renders shared project case studies for the Saturn archive', () => {
    const saturn = planets.find((candidate) => candidate.id === 'saturn')!;
    render(<ComputerScreen planet={saturn} onClose={() => {}} />);

    fireEvent.click(screen.getByText('Fantasy Football Platform'));

    expect(screen.getByRole('heading', { name: 'Fantasy Football Decision-Support Platform' })).toBeInTheDocument();
    expect(screen.getByText('740K+')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view repository for fantasy football/i })).toBeInTheDocument();
  });

  it('renders direct contact actions in the Neptune archive', () => {
    const neptune = planets.find((candidate) => candidate.id === 'neptune')!;
    render(<ComputerScreen planet={neptune} onClose={() => {}} />);

    fireEvent.click(screen.getByTestId('desktop-archive'));

    expect(screen.getByRole('link', { name: 'Email Jake Sass' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download Jacob Sass resume as a PDF' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open the live Campus Marketplace project' })).toBeInTheDocument();
  });

  it('runs commands in the interactive terminal', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('desktop-terminal'));

    const input = screen.getByRole('textbox', { name: 'Terminal command' });
    fireEvent.change(input, { target: { value: 'status' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText(/LIFE SUPPORT: NOMINAL/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`ARCHIVE: ${planet.content.length} FILES`))).toBeInTheDocument();
  });

  it('searches the mission web with Giggle', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('desktop-giggle'));

    const search = screen.getByRole('textbox', { name: 'Search Giggle' });
    fireEvent.change(search, { target: { value: 'moon snacks' } });
    fireEvent.submit(search.closest('form')!);

    expect(screen.getByText(/About 4 results/)).toBeInTheDocument();
    expect(screen.getByText(/moon snacks — explained/)).toBeInTheDocument();
  });

  it('opens the parody mail and notes applications', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} />);

    fireEvent.click(screen.getByTestId('desktop-mail'));
    expect(screen.getByRole('dialog', { name: 'Orbit Mail' })).toBeInTheDocument();
    expect(screen.getByText('Your delivery is nearby-ish')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('desktop-notes'));
    const notes = screen.getByRole('textbox', { name: 'Nebula Notes document' });
    fireEvent.change(notes, { target: { value: 'Remember the space snacks.' } });
    expect(notes).toHaveValue('Remember the space snacks.');
  });

  it('offers the full HAB OS entertainment and utility app suite', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} />);

    for (const app of [
      'spotifly',
      'viewtube',
      'discourse',
      'spacebook',
      'snacks',
      'rover',
      'paint',
      'solitaire',
      'recycle',
      'bolty',
      'mission-chat',
      'camera-roll',
    ]) {
      expect(screen.getByTestId(`desktop-${app}`)).toBeInTheDocument();
    }
  });

  it('opens Rover Dash and honks the rover horn', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} />);
    fireEvent.click(screen.getByTestId('desktop-rover'));

    fireEvent.click(screen.getByRole('button', { name: '📣 Honk' }));
    expect(screen.getByRole('button', { name: /BEEP ×1/ })).toBeInTheDocument();
  });

  it('closes the top window before standing up when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<ComputerScreen planet={planet} onClose={onClose} />);
    fireEvent.click(screen.getByText(planet.content[0].title));

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: planet.content[0].title })).not.toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not restart the boot screen when HAB OS finished booting in the room', () => {
    render(<ComputerScreen planet={planet} onClose={() => {}} bootStartedAt={Date.now() - 5000} />);
    expect(screen.queryByLabelText('HAB OS is starting')).not.toBeInTheDocument();
  });
});
