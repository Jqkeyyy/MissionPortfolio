import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { contactActions } from '@/data/contact';
import { ContactActions } from './ContactActions';

describe('ContactActions', () => {
  it('renders every configured action with its exact destination', () => {
    render(<ContactActions />);

    for (const action of contactActions) {
      const link = screen.getByRole('link', { name: action.accessibleLabel });
      expect(link).toHaveAttribute('href', action.href);
    }
  });

  it('opens external actions safely in a new tab', () => {
    render(<ContactActions />);

    for (const action of contactActions.filter((item) => item.external)) {
      const link = screen.getByRole('link', { name: action.accessibleLabel });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('keeps email and resume actions in the current browsing context', () => {
    render(<ContactActions />);

    for (const action of contactActions.filter((item) => !item.external)) {
      const link = screen.getByRole('link', { name: action.accessibleLabel });
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
    }
  });

  it('downloads the resume using its stable public filename', () => {
    render(<ContactActions />);

    const resumeLink = screen.getByRole('link', {
      name: 'Download Jacob Sass resume as a PDF',
    });
    expect(resumeLink).toHaveAttribute('href', '/Jacob-Sass-Resume.pdf');
    expect(resumeLink).toHaveAttribute('download', 'Jacob-Sass-Resume.pdf');
  });

  it('supports a compact layout without changing available actions', () => {
    render(<ContactActions variant="compact" />);

    expect(screen.getAllByRole('link')).toHaveLength(contactActions.length);
    expect(screen.getByRole('list', { name: 'Contact and project links' })).toHaveClass(
      'grid-cols-1',
    );
  });
});
