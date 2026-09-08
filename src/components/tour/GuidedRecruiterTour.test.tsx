import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GuidedRecruiterTour } from './GuidedRecruiterTour';
import type { RecruiterTourController } from '@/hooks/useRecruiterTour';
import { recruiterTour } from '@/data/recruiterTour';

const makeController = (
  overrides: Partial<RecruiterTourController> = {},
): RecruiterTourController => ({
  status: 'running',
  currentStepIndex: 0,
  currentStop: recruiterTour[0],
  remainingDwellMs: 12_000,
  announcement: 'Arrived at The Sun. Step 1 of 4.',
  start: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  nextStop: vi.fn(),
  exit: vi.fn(),
  ...overrides,
});

describe('GuidedRecruiterTour', () => {
  it('shows the current step and resolves existing featured content', () => {
    render(
      <GuidedRecruiterTour
        controller={makeController()}
        onOpenQuickPortfolio={vi.fn()}
        onExploreFreely={vi.fn()}
      />,
    );

    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Sun' })).toBeInTheDocument();
    expect(screen.getByText('Welcome, Pilot')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pause guided tour/i })).toHaveFocus();
    expect(screen.getByTestId('guided-recruiter-tour')).toHaveClass('motion-reduce:transition-none');
  });

  it('provides native pause, next, and exit controls plus Escape support', () => {
    const controller = makeController();
    render(
      <GuidedRecruiterTour
        controller={controller}
        onOpenQuickPortfolio={vi.fn()}
        onExploreFreely={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /pause guided tour/i }));
    fireEvent.click(screen.getByRole('button', { name: /next tour stop/i }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(controller.pause).toHaveBeenCalledTimes(1);
    expect(controller.nextStop).toHaveBeenCalledTimes(1);
    expect(controller.exit).toHaveBeenCalledTimes(1);
  });

  it('announces state changes through a polite atomic live region', () => {
    render(
      <GuidedRecruiterTour
        controller={makeController({ announcement: 'Guided tour resumed.' })}
        onOpenQuickPortfolio={vi.fn()}
        onExploreFreely={vi.fn()}
      />,
    );

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).toHaveTextContent('Guided tour resumed.');
  });

  it('offers Quick Portfolio and free exploration after completion', () => {
    const onOpenQuickPortfolio = vi.fn();
    const onExploreFreely = vi.fn();
    render(
      <GuidedRecruiterTour
        controller={makeController({
          status: 'complete',
          currentStepIndex: 3,
          currentStop: recruiterTour[3],
          announcement: 'Guided tour complete at Neptune.',
        })}
        onOpenQuickPortfolio={onOpenQuickPortfolio}
        onExploreFreely={onExploreFreely}
      />,
    );

    const quickPortfolio = screen.getByRole('button', { name: /open quick portfolio/i });
    expect(quickPortfolio).toHaveFocus();
    fireEvent.click(quickPortfolio);
    fireEvent.click(screen.getByRole('button', { name: /explore freely/i }));
    expect(onOpenQuickPortfolio).toHaveBeenCalledTimes(1);
    expect(onExploreFreely).toHaveBeenCalledTimes(1);
  });

  it('renders nothing while idle', () => {
    const { container } = render(
      <GuidedRecruiterTour
        controller={makeController({ status: 'idle' })}
        onOpenQuickPortfolio={vi.fn()}
        onExploreFreely={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
