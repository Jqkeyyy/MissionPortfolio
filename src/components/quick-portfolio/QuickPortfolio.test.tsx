import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { projects } from '@/data/projects';
import { useGameState } from '@/hooks/useGameState';
import { QuickPortfolio } from './QuickPortfolio';

describe('QuickPortfolio', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    useGameState.setState({ currentView: 'space', quickPortfolioOpen: false });
  });

  it('renders the shared portfolio, project, contact, and resume data', () => {
    render(<QuickPortfolio onClose={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Jake Sass' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Education' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Experience' })).toBeInTheDocument();
    for (const project of projects) {
      expect(screen.getByRole('heading', { name: project.name })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Download Jacob Sass resume as a PDF' })).toHaveAttribute(
      'href',
      '/Jacob-Sass-Resume.pdf',
    );
    expect(screen.getByRole('link', { name: 'Email Jake Sass' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:'),
    );
  });

  it('focuses its heading, traps Tab, closes on Escape, and restores focus', () => {
    const launchButton = document.createElement('button');
    launchButton.textContent = 'Launch';
    document.body.appendChild(launchButton);
    launchButton.focus();
    const onClose = vi.fn();
    const { unmount } = render(<QuickPortfolio onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'Jake Sass' })).toHaveFocus();

    const dialog = screen.getByRole('dialog', { name: 'Jake Sass' });
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(focusable.at(-1)).toHaveFocus();

    launchButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(focusable[0]).toHaveFocus();

    focusable.at(-1)?.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(focusable[0]).toHaveFocus();

    focusable[0].focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(focusable.at(-1)).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
    expect(launchButton).toHaveFocus();
  });

  it('returns to the existing exploration state without restarting it', () => {
    useGameState.setState({ currentView: 'planet', selectedPlanet: 'saturn', quickPortfolioOpen: true });
    render(<QuickPortfolio onClose={useGameState.getState().closeQuickPortfolio} />);

    fireEvent.click(screen.getByRole('button', { name: 'Return to exploration' }));

    expect(useGameState.getState()).toMatchObject({
      currentView: 'planet',
      selectedPlanet: 'saturn',
      quickPortfolioOpen: false,
    });
  });

  it('offers a print action', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(<QuickPortfolio onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Print' }));

    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });
});
