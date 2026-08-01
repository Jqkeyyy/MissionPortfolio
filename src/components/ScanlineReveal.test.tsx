import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScanlineReveal } from './ScanlineReveal';

describe('ScanlineReveal', () => {
  it('renders its children', () => {
    render(
      <ScanlineReveal>
        <p>Reveal me</p>
      </ScanlineReveal>
    );
    expect(screen.getByText('Reveal me')).toBeInTheDocument();
  });

  it('renders children when active is explicitly false', () => {
    render(
      <ScanlineReveal active={false}>
        <p>Still present</p>
      </ScanlineReveal>
    );
    expect(screen.getByText('Still present')).toBeInTheDocument();
  });
});
