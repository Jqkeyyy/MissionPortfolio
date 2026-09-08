import { describe, expect, it, vi } from 'vitest';
import { installGlobalErrorMonitoring } from './installGlobalErrorMonitoring';
import type { TelemetryClient } from './telemetryClient';

describe('global error monitoring', () => {
  it('reports sanitized errors and rejected promises', () => {
    const track = vi.fn((_event: unknown) => true);
    const client: TelemetryClient = { track, isEnabled: () => true };
    const cleanup = installGlobalErrorMonitoring(client);

    window.dispatchEvent(new ErrorEvent('error', {
      error: new Error('Failed person@example.com at https://private.test/?secret=1'),
    }));
    const rejection = new Event('unhandledrejection');
    Object.defineProperty(rejection, 'reason', { value: new Error('Rejected token abcdefghijklmnopqrstuvwxyz1234') });
    window.dispatchEvent(rejection);

    expect(track).toHaveBeenCalledTimes(2);
    expect(track.mock.calls[0][0]).toMatchObject({
      type: 'client_error',
      source: 'window-error',
      message: expect.stringContaining('[redacted-email]'),
    });
    cleanup();
  });

  it('removes both listeners during cleanup', () => {
    const client: TelemetryClient = { track: vi.fn(() => true), isEnabled: () => true };
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const cleanup = installGlobalErrorMonitoring(client);
    cleanup();
    expect(removeEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });
});
