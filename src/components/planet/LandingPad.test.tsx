import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { planets } from '@/data/planets';
import { LandingPad } from './LandingPad';

describe('LandingPad', () => {
  const planet = planets.find((candidate) => candidate.id === 'mars')!;

  it('renders the pad asset and exposes a future ship landing target', () => {
    const { container } = render(<LandingPad planet={planet} />);

    expect(container.querySelector('img')).toHaveAttribute('src', '/landing-pad.png');
    expect(container.querySelector('[data-landing-zone="primary"]')).toHaveAttribute('data-status', 'ready');
    expect(container.querySelector('#ship-landing-target')).toHaveAttribute('data-landing-target', 'true');
    expect(container.querySelectorAll('.landing-beacon')).toHaveLength(8);
  });
});
