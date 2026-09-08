import { describe, expect, it } from 'vitest';
import { isTelemetryEvent } from './eventSchema';

describe('telemetry event schema', () => {
  it.each([
    { type: 'route_choice', route: 'immersive' },
    { type: 'immersive_launch' },
    { type: 'quick_portfolio_open' },
    { type: 'destination_selected', destination: 'earth' },
    { type: 'destination_arrived', destination: 'moon' },
    { type: 'project_action', project: 'mission-portfolio', action: 'case-study' },
    { type: 'contact_action', channel: 'linkedin' },
    { type: 'tour_start' },
    { type: 'tour_complete' },
    { type: 'tour_skip' },
    { type: 'exploration_complete' },
    { type: 'webgl_unavailable', reason: 'unsupported' },
    { type: 'client_error', source: 'window-error', message: 'Redacted failure' },
  ])('accepts an allowlisted event: $type', (event) => {
    expect(isTelemetryEvent(event)).toBe(true);
  });

  it.each([
    { type: 'page_view', path: '/private?email=a@example.com' },
    { type: 'destination_selected', destination: 'pluto' },
    { type: 'immersive_launch', visitorId: '123' },
    { type: 'project_action', project: 'unknown', action: 'live' },
    { type: 'contact_action', channel: 'phone' },
    { type: 'client_error', source: 'window-error', message: '' },
  ])('rejects non-allowlisted fields or values', (event) => {
    expect(isTelemetryEvent(event)).toBe(false);
  });
});
