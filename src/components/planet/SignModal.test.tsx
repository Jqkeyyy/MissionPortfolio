import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignModal } from './SignModal';
import type { ContentSign } from '@/data/planets';

describe('SignModal', () => {
  const sign: ContentSign = {
    id: 'test-1',
    title: 'Test Sign',
    content: 'Test content body',
    type: 'console',
  };

  it('renders the sign title and content', () => {
    render(<SignModal sign={sign} onClose={() => {}} />);
    expect(screen.getByRole('dialog', { name: 'Test Sign' })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Test Sign')).toBeInTheDocument();
    expect(screen.getByText('Test content body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close sign details/i })).toHaveFocus();
  });

  it('renders the shared HudCorners targeting brackets', () => {
    render(<SignModal sign={sign} onClose={() => {}} />);
    expect(screen.getByTestId('hud-corners')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<SignModal sign={sign} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close sign details/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<SignModal sign={sign} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape and keeps Tab focus inside the dialog', () => {
    const onClose = vi.fn();
    render(<SignModal sign={sign} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: /close sign details/i });

    fireEvent.keyDown(window, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    const outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    outsideButton.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
    outsideButton.remove();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('restores focus to the opener when it unmounts', () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const { unmount } = render(<SignModal sign={sign} onClose={() => {}} />);

    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
});
