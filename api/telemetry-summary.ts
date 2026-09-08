import { getRedisEnvironment, redisCommand, redisPipeline, TELEMETRY_PREFIX } from './_telemetryStore.js';

export const config = { runtime: 'edge' };

const headers = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  const dashboardToken = process.env.TELEMETRY_DASHBOARD_TOKEN;
  if (!dashboardToken || request.headers.get('authorization') !== `Bearer ${dashboardToken}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }
  const environment = getRedisEnvironment();
  if (!environment) return new Response(JSON.stringify({ error: 'Telemetry store is not configured' }), { status: 503, headers });

  try {
    let cursor = '0';
    const keys: string[] = [];
    do {
      const result = await redisCommand<[string, string[]]>(environment, ['SCAN', cursor, 'MATCH', `${TELEMETRY_PREFIX}:*`, 'COUNT', 500]);
      cursor = String(result[0]);
      keys.push(...result[1]);
    } while (cursor !== '0' && keys.length < 5_000);

    const counts = keys.length ? await redisPipeline<number | string | null>(environment, keys.map((key) => ['GET', key])) : [];
    const events = keys.map((key, index) => {
      const [, , date, type, ...dimensions] = key.split(':');
      return { date, type, dimensions, count: Number(counts[index] ?? 0) };
    }).filter((entry) => Number.isFinite(entry.count) && entry.count > 0);
    return new Response(JSON.stringify({ generatedAt: Date.now(), events }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: 'Dashboard unavailable' }), { status: 503, headers });
  }
}
