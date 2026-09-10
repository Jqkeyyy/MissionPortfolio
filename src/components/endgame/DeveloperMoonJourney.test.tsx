import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeveloperMoonJourney } from './DeveloperMoonJourney';

const stopTitles = [
  'Why build a portfolio you can drive through?',
  'Every idea needed somewhere to land',
  'A planet needed more than a backdrop',
  'The HAB worked, but the story paused here',
  'One stool connected the whole experience',
  'Memorable still had to mean usable',
];

describe('DeveloperMoonJourney', () => {
  it('presents the build story as a keyboard-operable rover route', async () => {
    render(<DeveloperMoonJourney open onOpenChange={() => {}} />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName('The Build Behind the Mission');
    expect(screen.getByRole('heading', { name: stopTitles[0] })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /visit rover stop/i })).toHaveLength(stopTitles.length);

    fireEvent.click(screen.getByRole('button', { name: /next log/i }));
    expect(await screen.findByRole('heading', { name: stopTitles[1] })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(await screen.findByRole('heading', { name: stopTitles[2] })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(await screen.findByRole('heading', { name: stopTitles[1] })).toBeInTheDocument();
  });

  it('finishes the ride from the final stop', () => {
    const onOpenChange = vi.fn();
    render(<DeveloperMoonJourney open onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole('button', {
      name: `Visit rover stop ${stopTitles.length}: ${stopTitles.at(-1)}`,
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish ride' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

});
