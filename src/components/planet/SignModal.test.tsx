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
    expect(screen.getByText('Test Sign')).toBeInTheDocument();
    expect(screen.getByText('Test content body')).toBeInTheDocument();
  });

  it('renders the shared HudCorners targeting brackets', () => {
    render(<SignModal sign={sign} onClose={() => {}} />);
    expect(screen.getByTestId('hud-corners')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<SignModal sign={sign} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<SignModal sign={sign} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
