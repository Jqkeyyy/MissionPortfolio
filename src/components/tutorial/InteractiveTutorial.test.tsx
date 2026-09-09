import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InteractiveTutorial } from './InteractiveTutorial';
import { interactiveTutorialSteps, type InteractiveTutorialController } from '@/hooks/useInteractiveTutorial';

const controller = (overrides: Partial<InteractiveTutorialController> = {}): InteractiveTutorialController => ({
  status: 'running',
  currentStepIndex: 0,
  currentStep: interactiveTutorialSteps[0],
  announcement: 'Tutorial step 1 of 8.',
  start: vi.fn(),
  exit: vi.fn(),
  ...overrides,
});

describe('InteractiveTutorial', () => {
  it('shows instructions and visually highlights the current real control', async () => {
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
    await waitFor(() => {
      expect(screen.getByTestId('interactive-tutorial').querySelector('.border-orange-300')).toBeInTheDocument();
    });
    target.remove();
  });

  it('shows a completion message after the final file is opened', () => {
    render(<InteractiveTutorial controller={controller({ status: 'complete' })} />);
    expect(screen.getByRole('heading', { name: 'You are ready to explore' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish tutorial' })).toBeInTheDocument();
  });

  it('renders nothing while idle', () => {
    const { container } = render(<InteractiveTutorial controller={controller({ status: 'idle' })} />);
    expect(container).toBeEmptyDOMElement();
  });
});
