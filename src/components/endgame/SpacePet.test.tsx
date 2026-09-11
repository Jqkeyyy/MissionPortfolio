import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createSpacePetStore } from '@/features/endgame/spacePet';
import { SpacePet } from './SpacePet';

describe('SpacePet', () => {
  it('reacts to view and destination changes', () => {
    const store = createSpacePetStore();
    const { rerender } = render(
      <SpacePet store={store} context={{ view: 'space' }} listenForPageClicks={false} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('All planets accounted for');

    rerender(
      <SpacePet
        store={store}
        context={{ view: 'planet', destinationId: 'mars', destinationName: 'Mars' }}
        listenForPageClicks={false}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('New world: Mars');
  });

  it('follows outside interactions and only chatters on the fixed cadence', () => {
    const store = createSpacePetStore();
    render(<SpacePet store={store} context={{ view: 'space' }} />);
    const initialMessage = store.getState().message?.text;

    fireEvent.click(document.body, { clientX: 120, clientY: 180 });
    fireEvent.click(document.body, { clientX: 130, clientY: 190 });
    fireEvent.click(document.body, { clientX: 140, clientY: 200 });
    expect(store.getState().message?.text).toBe(initialMessage);

    fireEvent.click(document.body, { clientX: 150, clientY: 210 });
    expect(store.getState()).toMatchObject({
      interactionCount: 4,
      position: { x: 150, y: 210 },
      message: { source: 'interaction' },
    });
  });

  it('can power down and be recalled with accessible controls', () => {
    const store = createSpacePetStore();
    const onEnabledChange = vi.fn();
    render(
      <SpacePet
        store={store}
        context={{ view: 'space' }}
        listenForPageClicks={false}
        onEnabledChange={onEnabledChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Power down M-0' }));
    expect(onEnabledChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('button', { name: 'Recall maintenance companion M-0' }))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Recall maintenance companion M-0' }));
    expect(onEnabledChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByLabelText('Maintenance companion M-0')).toBeInTheDocument();
  });

  it('marks reduced-motion mode and accepts a clamped host anchor', () => {
    const store = createSpacePetStore();
    render(
      <SpacePet
        store={store}
        context={{ view: 'intercepting', destinationName: 'Neptune', traveling: true }}
        anchor={{ x: -50, y: 20_000 }}
        reducedMotion
      />,
    );

    expect(screen.getByLabelText('Maintenance companion M-0'))
      .toHaveAttribute('data-reduced-motion', 'true');
    expect(store.getState().position?.x).toBe(52);
    expect(store.getState().position?.y).toBe(window.innerHeight - 52);
  });
});
