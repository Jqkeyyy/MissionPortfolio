const EVENT_TYPES = new Set([
  'route_choice',
  'immersive_launch',
  'quick_portfolio_open',
  'destination_selected',
  'destination_arrived',
  'project_action',
  'contact_action',
  'tour_start',
  'tour_complete',
  'tour_skip',
  'exploration_complete',
  'webgl_unavailable',
  'client_error',
]);

const DIMENSION_BY_EVENT: Record<string, readonly string[]> = {
  route_choice: ['route'],
  destination_selected: ['destination'],
  destination_arrived: ['destination'],
  project_action: ['project', 'action'],
  contact_action: ['channel'],
  webgl_unavailable: ['reason'],
  client_error: ['source'],
};

const ALLOWED_DIMENSIONS: Record<string, ReadonlySet<string>> = {
  route: new Set(['immersive', 'quick-portfolio']),
  destination: new Set(['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']),
  project: new Set(['fantasy-football', 'quizclone', 'campus-marketplace', 'mission-portfolio', 'whats-jake-doing', 'arena-tracker']),
  action: new Set(['case-study', 'live', 'repository']),
  channel: new Set(['email', 'github', 'linkedin', 'website']),
  reason: new Set(['unsupported', 'context-lost', 'initialization-failed']),
  source: new Set(['window-error', 'unhandled-rejection', 'react-boundary']),
};

const SAFE_VALUE = /^[a-z0-9-]{1,64}$/;
export const TELEMETRY_PREFIX = 'mission-portfolio:telemetry';

interface RedisEnvironment {
  url: string;
  token: string;
  retentionDays: number;
}

export const getRedisEnvironment = (): RedisEnvironment | null => {
  const url = process.env.TELEMETRY_REDIS_REST_URL?.replace(/\/$/, '');
  const token = process.env.TELEMETRY_REDIS_REST_TOKEN;
  if (!url || !token || !url.startsWith('https://')) return null;
  const parsedRetention = Number.parseInt(process.env.TELEMETRY_RETENTION_DAYS ?? '90', 10);
  return {
    url,
    token,
    retentionDays: Number.isFinite(parsedRetention) ? Math.min(365, Math.max(1, parsedRetention)) : 90,
  };
};

export const redisCommand = async <T>(environment: RedisEnvironment, command: readonly unknown[]): Promise<T> => {
  const response = await fetch(environment.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${environment.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`Telemetry store returned ${response.status}.`);
  const payload = await response.json() as { result: T };
  return payload.result;
};

export const redisPipeline = async <T>(environment: RedisEnvironment, commands: readonly (readonly unknown[])[]): Promise<T[]> => {
  const response = await fetch(`${environment.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${environment.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!response.ok) throw new Error(`Telemetry store returned ${response.status}.`);
  const payload = await response.json() as Array<{ result: T }>;
  return payload.map((entry) => entry.result);
};

export const getTelemetryBucket = (candidate: unknown, date = new Date()): string | null => {
  if (typeof candidate !== 'object' || candidate === null) return null;
  const envelope = candidate as Record<string, unknown>;
  if (envelope.schemaVersion !== 1 || typeof envelope.sentAt !== 'number') return null;
  if (Math.abs(Date.now() - envelope.sentAt) > 86_400_000) return null;
  if (typeof envelope.event !== 'object' || envelope.event === null) return null;
  const event = envelope.event as Record<string, unknown>;
  if (typeof event.type !== 'string' || !EVENT_TYPES.has(event.type)) return null;

  const dimensions = DIMENSION_BY_EVENT[event.type] ?? [];
  if (event.type === 'client_error') {
    const clientKeys = Object.keys(event);
    if (!clientKeys.includes('message') || typeof event.message !== 'string' || event.message.length === 0 || event.message.length > 20_000) return null;
    if (clientKeys.some((key) => !['type', 'source', 'message', 'stack'].includes(key))) return null;
    if (event.stack !== undefined && (typeof event.stack !== 'string' || event.stack.length > 40_000)) return null;
  }
  const expectedKeys = ['type', ...dimensions].sort();
  const actualKeys = Object.keys(event).filter((key) => event.type !== 'client_error' || key !== 'message' && key !== 'stack').sort();
  if (actualKeys.length !== expectedKeys.length || !actualKeys.every((key, index) => key === expectedKeys[index])) return null;

  const values = dimensions.map((dimension) => event[dimension]);
  if (values.some((value, index) => {
    const dimension = dimensions[index];
    return typeof value !== 'string' || !SAFE_VALUE.test(value) || !ALLOWED_DIMENSIONS[dimension]?.has(value);
  })) return null;
  const day = date.toISOString().slice(0, 10);
  return [TELEMETRY_PREFIX, day, event.type, ...values].join(':');
};
