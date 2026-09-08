import { getRedisEnvironment, getTelemetryBucket, redisPipeline } from './_telemetryStore.js';

export const config = { runtime: 'edge' };

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: responseHeaders });
  }
  const contentLength = Number.parseInt(request.headers.get('content-length') ?? '0', 10);
  if (contentLength > 4_096) {
    return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers: responseHeaders });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: responseHeaders });
  }
  const bucket = getTelemetryBucket(payload);
  if (!bucket) return new Response(JSON.stringify({ error: 'Invalid event' }), { status: 400, headers: responseHeaders });

  const environment = getRedisEnvironment();
  if (!environment) {
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store', 'X-Telemetry-Status': 'disabled' } });
  }

  try {
    await redisPipeline(environment, [
      ['INCR', bucket],
      ['EXPIRE', bucket, environment.retentionDays * 86_400],
    ]);
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return new Response(JSON.stringify({ error: 'Collector unavailable' }), { status: 503, headers: responseHeaders });
  }
}
