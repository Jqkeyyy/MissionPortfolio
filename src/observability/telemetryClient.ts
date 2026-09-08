import {
  createTelemetryEnvelope,
  isTelemetryEvent,
  type TelemetryEvent,
} from './eventSchema';
import { sanitizeClientErrorEvent } from './errorSanitizer';

export interface TelemetryClient {
  track: (event: unknown) => boolean;
  isEnabled: () => boolean;
}

interface PrivacyNavigator {
  doNotTrack?: string | null;
  globalPrivacyControl?: boolean;
  sendBeacon?: (url: string, data?: BodyInit | null) => boolean;
}

export interface TelemetryClientOptions {
  endpoint?: string;
  origin?: string;
  navigator?: PrivacyNavigator;
  fetcher?: typeof fetch;
  now?: () => number;
  dedupeWindowMs?: number;
  rateLimit?: number;
  rateWindowMs?: number;
}

const configuredEndpoint = import.meta.env.VITE_TELEMETRY_ENDPOINT as string | undefined;

export const resolveTelemetryEndpoint = (
  endpoint: string | undefined,
  origin: string | undefined,
): string | null => {
  if (!endpoint || !origin) return null;
  try {
    const resolved = new URL(endpoint, origin);
    const originUrl = new URL(origin);
    if (resolved.username || resolved.password || resolved.hash) return null;
    if (resolved.protocol !== 'https:' && resolved.origin !== originUrl.origin) return null;
    return resolved.toString();
  } catch {
    return null;
  }
};

export const isPrivacyOptOutEnabled = (privacyNavigator?: PrivacyNavigator): boolean => {
  if (!privacyNavigator) return false;
  return privacyNavigator.globalPrivacyControl === true || privacyNavigator.doNotTrack === '1';
};

const defaultOrigin = () => typeof window === 'undefined' ? undefined : window.location.origin;
const defaultNavigator = () => typeof navigator === 'undefined'
  ? undefined
  : navigator as PrivacyNavigator;

export const createTelemetryClient = (options: TelemetryClientOptions = {}): TelemetryClient => {
  const privacyNavigator = options.navigator ?? defaultNavigator();
  const endpoint = resolveTelemetryEndpoint(
    options.endpoint ?? configuredEndpoint,
    options.origin ?? defaultOrigin(),
  );
  const fetcher = options.fetcher ?? (typeof fetch === 'function' ? fetch.bind(globalThis) : undefined);
  const now = options.now ?? Date.now;
  const dedupeWindowMs = options.dedupeWindowMs ?? 2_000;
  const rateLimit = options.rateLimit ?? 12;
  const rateWindowMs = options.rateWindowMs ?? 60_000;
  const recentEvents = new Map<string, number>();
  let rateTimestamps: number[] = [];

  const enabled = Boolean(endpoint) && !isPrivacyOptOutEnabled(privacyNavigator);

  return {
    isEnabled: () => enabled,
    track: (candidate) => {
      if (!enabled || !endpoint || !isTelemetryEvent(candidate)) return false;

      const event: TelemetryEvent = candidate.type === 'client_error'
        ? sanitizeClientErrorEvent(candidate)
        : candidate;
      const timestamp = now();
      rateTimestamps = rateTimestamps.filter((seenAt) => timestamp - seenAt < rateWindowMs);
      if (rateTimestamps.length >= rateLimit) return false;

      const fingerprint = JSON.stringify(event);
      const previous = recentEvents.get(fingerprint);
      if (previous !== undefined && timestamp - previous < dedupeWindowMs) return false;

      recentEvents.forEach((seenAt, key) => {
        if (timestamp - seenAt >= dedupeWindowMs) recentEvents.delete(key);
      });
      recentEvents.set(fingerprint, timestamp);
      rateTimestamps.push(timestamp);

      const body = JSON.stringify(createTelemetryEnvelope(event, timestamp));
      try {
        if (privacyNavigator?.sendBeacon?.(endpoint, new Blob([body], { type: 'application/json' }))) {
          return true;
        }
        if (!fetcher) return false;
        void fetcher(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          credentials: 'omit',
          keepalive: true,
          referrerPolicy: 'no-referrer',
        }).catch(() => undefined);
        return true;
      } catch {
        return false;
      }
    },
  };
};

export const telemetryClient = createTelemetryClient();
