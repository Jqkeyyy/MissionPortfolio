import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ErrorMonitoringTarget } from './installGlobalErrorMonitoring';
import { TelemetryBridge } from './TelemetryBridge';
import type { TelemetryClient } from './telemetryClient';

describe('TelemetryBridge', () => {
  it('renders children and cleans up installed global listeners', () => {
    const listeners = new Map<string, EventListener>();
    const target: ErrorMonitoringTarget = {
      addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
        if (typeof listener === 'function') listeners.set(type, listener);
      }) as ErrorMonitoringTarget['addEventListener'],
      removeEventListener: vi.fn() as ErrorMonitoringTarget['removeEventListener'],
    };
    const client: TelemetryClient = { track: vi.fn(() => true), isEnabled: () => true };
    const { unmount } = render(
      <TelemetryBridge client={client} errorTarget={target}>
        <p>Application</p>
      </TelemetryBridge>,
    );

    expect(document.body).toHaveTextContent('Application');
    expect(target.addEventListener).toHaveBeenCalledTimes(2);
    unmount();
    expect(target.removeEventListener).toHaveBeenCalledTimes(2);
  });
});
