import { describe, expect, it, vi } from 'vitest';
import { createTelemetryClient, resolveTelemetryEndpoint } from './telemetryClient';

describe('telemetry client', () => {
  it('accepts HTTPS or same-origin endpoints and rejects unsafe endpoints', () => {
    expect(resolveTelemetryEndpoint('/api/telemetry', 'https://portfolio.test'))
      .toBe('https://portfolio.test/api/telemetry');
    expect(resolveTelemetryEndpoint('https://metrics.example/collect', 'https://portfolio.test'))
      .toBe('https://metrics.example/collect');
    expect(resolveTelemetryEndpoint('http://metrics.example/collect', 'https://portfolio.test')).toBeNull();
    expect(resolveTelemetryEndpoint('https://metrics.example/collect#secret', 'https://portfolio.test')).toBeNull();
  });

  it('is a no-op without an endpoint and when GPC or DNT is enabled', () => {
    const fetcher = vi.fn();
    expect(createTelemetryClient({ fetcher, origin: 'https://portfolio.test' }).track({ type: 'tour_start' }))
      .toBe(false);
    expect(createTelemetryClient({ endpoint: '/api', origin: 'https://portfolio.test', navigator: { globalPrivacyControl: true }, fetcher }).isEnabled()).toBe(false);
    expect(createTelemetryClient({ endpoint: '/api', origin: 'https://portfolio.test', navigator: { doNotTrack: '1' }, fetcher }).isEnabled()).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('sends only validated, identifier-free envelopes with omitted credentials', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const client = createTelemetryClient({
      endpoint: '/api/telemetry',
      origin: 'https://portfolio.test',
      navigator: {},
      fetcher,
      now: () => 123,
    });

    expect(client.track({ type: 'destination_arrived', destination: 'earth' })).toBe(true);
    expect(client.track({ type: 'page_view', url: 'https://portfolio.test/?email=a@example.com' })).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe('https://portfolio.test/api/telemetry');
    expect(init).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' });
    expect(JSON.parse(init.body)).toEqual({
      schemaVersion: 1,
      sentAt: 123,
      event: { type: 'destination_arrived', destination: 'earth' },
    });
  });

  it('redacts client errors before transport', () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const client = createTelemetryClient({
      endpoint: '/api',
      origin: 'https://portfolio.test',
      navigator: {},
      fetcher,
    });
    client.track({
      type: 'client_error',
      source: 'react-boundary',
      message: 'Failed for person@example.com at https://private.test/?token=abc',
    });
    const event = JSON.parse(fetcher.mock.calls[0][1].body).event;
    expect(event.message).toContain('[redacted-email]');
    expect(event.message).toContain('[redacted-url]');
  });

  it('deduplicates, rate-limits, and swallows transport failures', () => {
    let timestamp = 1_000;
    const fetcher = vi.fn(() => { throw new Error('offline'); });
    const client = createTelemetryClient({
      endpoint: '/api',
      origin: 'https://portfolio.test',
      navigator: {},
      fetcher: fetcher as unknown as typeof fetch,
      now: () => timestamp,
      rateLimit: 2,
    });

    expect(() => client.track({ type: 'tour_start' })).not.toThrow();
    expect(client.track({ type: 'tour_start' })).toBe(false);
    timestamp += 3_000;
    expect(client.track({ type: 'tour_complete' })).toBe(false);
    expect(client.track({ type: 'exploration_complete' })).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('uses sendBeacon without falling through to fetch', () => {
    const fetcher = vi.fn();
    const sendBeacon = vi.fn(() => true);
    const client = createTelemetryClient({
      endpoint: '/api',
      origin: 'https://portfolio.test',
      navigator: { sendBeacon },
      fetcher,
    });
    expect(client.track({ type: 'quick_portfolio_open' })).toBe(true);
    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
