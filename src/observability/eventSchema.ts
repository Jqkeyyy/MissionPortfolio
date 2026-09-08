import { PLANET_THEME_IDS, type PlanetThemeId } from '@/data/planetThemes';
import { projects, type ProjectId } from '@/data/projects';

export const TELEMETRY_SCHEMA_VERSION = 1 as const;

export type TelemetryEvent =
  | { type: 'route_choice'; route: 'immersive' | 'quick-portfolio' }
  | { type: 'immersive_launch' }
  | { type: 'quick_portfolio_open' }
  | { type: 'destination_selected'; destination: PlanetThemeId }
  | { type: 'destination_arrived'; destination: PlanetThemeId }
  | { type: 'project_action'; project: ProjectId; action: 'case-study' | 'live' | 'repository' }
  | { type: 'contact_action'; channel: 'email' | 'github' | 'linkedin' | 'website' }
  | { type: 'tour_start' }
  | { type: 'tour_complete' }
  | { type: 'tour_skip' }
  | { type: 'exploration_complete' }
  | { type: 'webgl_unavailable'; reason: 'unsupported' | 'context-lost' | 'initialization-failed' }
  | {
    type: 'client_error';
    source: 'window-error' | 'unhandled-rejection' | 'react-boundary';
    message: string;
    stack?: string;
  };

export interface TelemetryEnvelope {
  schemaVersion: typeof TELEMETRY_SCHEMA_VERSION;
  sentAt: number;
  event: TelemetryEvent;
}

const planetIds = new Set<string>(PLANET_THEME_IDS);
const projectIds = new Set<string>(projects.map((project) => project.id));

const hasExactKeys = (value: Record<string, unknown>, keys: readonly string[]) => {
  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...keys].sort();
  return actualKeys.length === expectedKeys.length
    && actualKeys.every((key, index) => key === expectedKeys[index]);
};

const isOneOf = <T extends string>(value: unknown, allowed: readonly T[]): value is T =>
  typeof value === 'string' && allowed.includes(value as T);

const isBoundedText = (value: unknown, maximum: number) =>
  typeof value === 'string' && value.length > 0 && value.length <= maximum;

export const isTelemetryEvent = (candidate: unknown): candidate is TelemetryEvent => {
  if (typeof candidate !== 'object' || candidate === null || !('type' in candidate)) return false;
  const event = candidate as Record<string, unknown>;

  switch (event.type) {
    case 'route_choice':
      return hasExactKeys(event, ['type', 'route'])
        && isOneOf(event.route, ['immersive', 'quick-portfolio']);
    case 'immersive_launch':
    case 'quick_portfolio_open':
    case 'tour_start':
    case 'tour_complete':
    case 'tour_skip':
    case 'exploration_complete':
      return hasExactKeys(event, ['type']);
    case 'destination_selected':
    case 'destination_arrived':
      return hasExactKeys(event, ['type', 'destination'])
        && typeof event.destination === 'string'
        && planetIds.has(event.destination);
    case 'project_action':
      return hasExactKeys(event, ['type', 'project', 'action'])
        && typeof event.project === 'string'
        && projectIds.has(event.project)
        && isOneOf(event.action, ['case-study', 'live', 'repository']);
    case 'contact_action':
      return hasExactKeys(event, ['type', 'channel'])
        && isOneOf(event.channel, ['email', 'github', 'linkedin', 'website']);
    case 'webgl_unavailable':
      return hasExactKeys(event, ['type', 'reason'])
        && isOneOf(event.reason, ['unsupported', 'context-lost', 'initialization-failed']);
    case 'client_error': {
      const keys = Object.keys(event);
      if (keys.some((key) => !['type', 'source', 'message', 'stack'].includes(key))) return false;
      if (!['type', 'source', 'message'].every((key) => keys.includes(key))) return false;
      return isOneOf(event.source, ['window-error', 'unhandled-rejection', 'react-boundary'])
        && isBoundedText(event.message, 20_000)
        && (event.stack === undefined || isBoundedText(event.stack, 40_000));
    }
    default:
      return false;
  }
};

export const createTelemetryEnvelope = (
  event: TelemetryEvent,
  sentAt: number,
): TelemetryEnvelope => ({
  schemaVersion: TELEMETRY_SCHEMA_VERSION,
  sentAt,
  event,
});
