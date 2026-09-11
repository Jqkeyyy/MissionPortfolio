import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SecretHabTerminal } from './SecretHabTerminal';

const execute = (command: string) => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Enter terminal command' }), {
    target: { value: command },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Execute' }));
};

describe('SecretHabTerminal', () => {
  it('shows only documented commands in help', () => {
    render(<SecretHabTerminal open onOpenChange={vi.fn()} />);
    execute('help');
    expect(screen.getByLabelText('Terminal output')).toHaveTextContent('help, status, clear, whoami');
    expect(screen.getByLabelText('Terminal output')).not.toHaveTextContent('sudo launch');
  });

  it('normalizes and dispatches hidden commands', () => {
    const onEffect = vi.fn();
    render(<SecretHabTerminal open onOpenChange={vi.fn()} onEffect={onEffect} />);
    execute('  OPEN   THE POD BAY DOORS  ');
    expect(onEffect).toHaveBeenCalledWith('pod-bay');
    expect(screen.getByLabelText('Terminal output')).toHaveTextContent('the doors are already open');
  });

  it('clears terminal history', () => {
    render(<SecretHabTerminal open onOpenChange={vi.fn()} />);
    execute('status');
    execute('clear');
    expect(screen.getByLabelText('Terminal output')).toHaveTextContent('SCREEN CLEARED');
    expect(screen.getByLabelText('Terminal output')).not.toHaveTextContent('HAB ONLINE');
  });
});
