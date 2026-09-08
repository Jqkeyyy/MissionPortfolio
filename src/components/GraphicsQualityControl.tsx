import { Gauge } from 'lucide-react';
import { useGraphicsSettings, type GraphicsPreference } from '@/hooks/useGraphicsSettings';
import { cn } from '@/lib/utils';

const options: readonly { value: GraphicsPreference; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'low', label: 'Low' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'high', label: 'High' },
];

export const GraphicsQualityControl = ({ className }: { className?: string }) => {
  const preference = useGraphicsSettings((state) => state.preference);
  const setPreference = useGraphicsSettings((state) => state.setPreference);

  return (
    <label className={cn('flex min-h-11 items-center gap-2 rounded border border-cyan-200/20 bg-background/55 px-3', className)}>
      <Gauge aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-300" />
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-cyan-100/75">Graphics</span>
      <select
        value={preference}
        onChange={(event) => setPreference(event.target.value as GraphicsPreference)}
        className="ml-auto min-h-9 rounded border border-white/15 bg-[#06111a] px-2 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
        aria-label="Graphics quality"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
};
