import { sanitizeError } from './errorSanitizer';
import type { TelemetryClient } from './telemetryClient';

export interface ErrorMonitoringTarget {
  addEventListener: Window['addEventListener'];
  removeEventListener: Window['removeEventListener'];
}

export const installGlobalErrorMonitoring = (
  client: TelemetryClient,
  target: ErrorMonitoringTarget = window,
) => {
  const onError = (event: Event) => {
    const errorEvent = event as ErrorEvent;
    const sanitized = sanitizeError(errorEvent.error ?? errorEvent.message ?? 'Unknown window error');
    client.track({ type: 'client_error', source: 'window-error', ...sanitized });
  };
  const onUnhandledRejection = (event: Event) => {
    const rejectionEvent = event as PromiseRejectionEvent;
    const sanitized = sanitizeError(rejectionEvent.reason);
    client.track({ type: 'client_error', source: 'unhandled-rejection', ...sanitized });
  };

  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onUnhandledRejection);

  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onUnhandledRejection);
  };
};
