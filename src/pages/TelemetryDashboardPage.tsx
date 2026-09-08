import { FormEvent, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

interface SummaryEvent {
  date: string;
  type: string;
  dimensions: string[];
  count: number;
}

const TelemetryDashboardPage = () => {
  const [token, setToken] = useState('');
  const [events, setEvents] = useState<SummaryEvent[]>([]);
  const [status, setStatus] = useState('Enter the dashboard token to load aggregate events.');
  const [loading, setLoading] = useState(false);

  useDocumentMetadata({
    title: 'Mission Analytics — Jake Sass',
    description: 'Private aggregate mission analytics dashboard.',
    path: '/mission-analytics',
    robots: 'noindex,nofollow',
  });

  const totals = useMemo(() => {
    const grouped = new Map<string, number>();
    events.forEach((event) => grouped.set(event.type, (grouped.get(event.type) ?? 0) + event.count));
    return [...grouped.entries()].sort((left, right) => right[1] - left[1]);
  }, [events]);
  const largestTotal = Math.max(1, ...totals.map(([, count]) => count));

  const loadSummary = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Loading aggregate events…');
    try {
      const response = await fetch('/api/telemetry-summary', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      });
      const payload = await response.json() as { events?: SummaryEvent[]; error?: string };
      if (!response.ok || !payload.events) throw new Error(payload.error ?? 'Unable to load analytics.');
      setEvents(payload.events);
      setStatus(`Loaded ${payload.events.length} aggregate buckets. No visitor identifiers are collected.`);
    } catch (error) {
      setEvents([]);
      setStatus(error instanceof Error ? error.message : 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#02070d] text-white">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded px-3 text-sm text-cyan-100 hover:bg-cyan-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Mission home
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <BarChart3 aria-hidden="true" className="h-7 w-7 text-orange-300" />
          <h1 className="font-heading text-3xl tracking-[0.1em] sm:text-5xl">Mission analytics</h1>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">
          Private daily counts for allowlisted mission actions. The collector stores no cookies, IP addresses, URLs, user agents, or visitor identifiers.
        </p>

        <form onSubmit={loadSummary} className="mt-8 flex max-w-xl flex-col gap-3 rounded-xl border border-white/12 bg-white/[0.035] p-5 sm:flex-row">
          <label className="min-w-0 flex-1">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/60"><LockKeyhole aria-hidden="true" className="h-4 w-4" /> Dashboard token</span>
            <input type="password" value={token} onChange={(event) => setToken(event.target.value)} required autoComplete="off" className="min-h-11 w-full rounded border border-white/20 bg-black/30 px-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-200" />
          </label>
          <button type="submit" disabled={loading} className="min-h-11 self-end rounded bg-orange-400 px-5 font-heading text-xs tracking-[0.1em] text-slate-950 hover:bg-orange-300 disabled:opacity-50">Load summary</button>
        </form>
        <p role="status" className="mt-3 text-sm text-cyan-100/65">{status}</p>

        {totals.length > 0 && (
          <section aria-labelledby="event-totals-heading" className="mt-10 rounded-xl border border-white/12 bg-[#06111a] p-5 sm:p-7">
            <h2 id="event-totals-heading" className="font-heading text-xl tracking-[0.1em]">Event totals</h2>
            <dl className="mt-6 space-y-4">
              {totals.map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-baseline justify-between gap-4"><dt className="font-mono text-xs text-white/70">{type}</dt><dd className="font-heading text-lg text-cyan-100">{count}</dd></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-orange-400" style={{ width: `${Math.max(2, count / largestTotal * 100)}%` }} /></div>
                </div>
              ))}
            </dl>
          </section>
        )}
      </main>
    </div>
  );
};

export default TelemetryDashboardPage;
