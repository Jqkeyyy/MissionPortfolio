import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InteractiveTutorial } from './InteractiveTutorial';
import { getTutorialGeometry } from './tutorialGeometry';
import { interactiveTutorialSteps, type InteractiveTutorialController } from '@/hooks/useInteractiveTutorial';

const controller = (overrides: Partial<InteractiveTutorialController> = {}): InteractiveTutorialController => ({
  status: 'running',
  currentStepIndex: 0,
  currentStep: interactiveTutorialSteps[0],
  announcement: 'Tutorial step 1 of 12.',
  start: vi.fn(),
  exit: vi.fn(),
  ...overrides,
});

describe('InteractiveTutorial', () => {
  it('centers the arrow on both normal and viewport-clipped target bounds', () => {
    const centered = getTutorialGeometry({ left: 300, top: 240, width: 120, height: 80 }, 1280, 720);
    expect(centered.arrow.left).toBe(360);
    expect(centered.arrow.left).toBe(centered.highlight.left + centered.highlight.width / 2);

    const clipped = getTutorialGeometry({ left: -30, top: 240, width: 80, height: 80 }, 390, 844);
    expect(clipped.highlight.left).toBe(6);
    expect(clipped.arrow.left).toBe(clipped.highlight.left + clipped.highlight.width / 2);
  });

  it('shows instructions and leaves the Sun box to the matching 3D highlight', async () => {
    const target = document.createElement('button');
    target.dataset.tutorialTarget = 'sun';
    target.getBoundingClientRect = () => ({
      left: 300,
      top: 240,
      width: 120,
      height: 80,
      right: 420,
      bottom: 320,
      x: 300,
      y: 240,
      toJSON: () => ({}),
    });
    document.body.append(target);

    render(<InteractiveTutorial controller={controller()} />);

    expect(screen.getByRole('heading', { name: 'Start with the Sun' })).toBeInTheDocument();
    expect(screen.getByText(/click the Sun in the center/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exit tutorial' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('tutorial-arrow')).toBeInTheDocument());
    expect(screen.queryByTestId('tutorial-highlight')).not.toBeInTheDocument();
    const arrow = screen.getByTestId('tutorial-arrow');
    expect(arrow).not.toHaveClass('motion-safe:animate-bounce');
    expect(arrow.firstElementChild).toHaveClass('motion-safe:animate-bounce');
    target.remove();
  });

  it('shows a completion message after another destination is reached', () => {
    render(<InteractiveTutorial controller={controller({ status: 'complete' })} />);
    expect(screen.getByRole('heading', { name: 'You are ready to explore' })).toBeInTheDocument();
    expect(screen.getByText(/reached a second destination/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish tutorial' })).toBeInTheDocument();
  });

  it('renders nothing while idle', () => {
    const { container } = render(<InteractiveTutorial controller={controller({ status: 'idle' })} />);
    expect(container).toBeEmptyDOMElement();
  });
});
