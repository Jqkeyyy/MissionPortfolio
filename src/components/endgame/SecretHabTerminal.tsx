import { FormEvent, useEffect, useRef, useState } from 'react';
import { Coffee, Terminal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export type HabTerminalEffect =
  | 'chaos'
  | 'singularity'
  | 'moonwalk'
  | 'launch'
  | 'coffee'
  | 'pod-bay';

interface SecretHabTerminalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEffect?: (effect: HabTerminalEffect) => void;
}

const normalizeCommand = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const commandResponse = (command: string): { message: string; effect?: HabTerminalEffect } => {
  switch (command) {
    case 'help':
      return { message: 'AVAILABLE: help, status, clear, whoami. Additional maintenance commands are intentionally undocumented.' };
    case 'status':
      return { message: 'HAB ONLINE // TEN DESTINATIONS VERIFIED // ANOMALY PERMISSIONS: ELEVATED' };
    case 'whoami':
      return { message: 'PILOT // EXPLORER // AUTHORIZED TROUBLEMAKER' };
    case 'chaos':
      return { message: 'Physics committee overruled. Chaos controls enabled.', effect: 'chaos' };
    case 'singularity':
      return { message: 'Hidden mass detected beyond Neptune. Event Horizon coordinates uploaded.', effect: 'singularity' };
    case 'moonwalk':
      return { message: 'Rover route acquired. Developer Moon descent window opened.', effect: 'moonwalk' };
    case 'sudo launch':
      return { message: 'Override accepted. Autopilot replay authorized.', effect: 'launch' };
    case 'coffee':
      return { message: 'Fabricator error: coffee replaced with aggressively competent TypeScript.', effect: 'coffee' };
    case 'open the pod bay doors':
      return { message: "I'm sorry, pilot. I absolutely can do that — the doors are already open.", effect: 'pod-bay' };
    case 'clear':
      return { message: '' };
    case '':
      return { message: '' };
    default:
      return { message: `COMMAND NOT FOUND: ${command.toUpperCase()}. Try help — or ignore the manual.` };
  }
};
export const SecretHabTerminal = ({ open, onOpenChange, onEffect }: SecretHabTerminalProps) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([
    'HAB MAINTENANCE SHELL v6.0',
    'Type help for documented commands. Curiosity may reveal the rest.',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setCommand('');
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = normalizeCommand(command);
    if (!normalized) return;
    const result = commandResponse(normalized);
    if (normalized === 'clear') {
      setHistory([]);
    } else {
      setHistory((current) => [...current.slice(-7), `> ${normalized}`, result.message]);
    }
    setCommand('');
    if (result.effect) onEffect?.(result.effect);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-[2100] w-[calc(100vw-2rem)] max-w-2xl border-emerald-300/35 bg-[#020b08]/98 p-0 text-emerald-100 shadow-[0_0_70px_rgba(52,211,153,0.16)]"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="border-b border-emerald-300/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <Terminal aria-hidden="true" className="h-5 w-5 text-emerald-300" />
            <DialogTitle className="font-heading text-xl tracking-wide">Secret HAB Terminal</DialogTitle>
          </div>
          <DialogDescription className="mt-1 font-mono text-xs text-emerald-100/55">
            Maintenance channel. The visible command index is incomplete by design.
          </DialogDescription>
        </div>

        <div
          className="min-h-64 space-y-2 px-5 py-4 font-mono text-xs leading-6 text-emerald-200/85 sm:text-sm"
          aria-live="polite"
          aria-label="Terminal output"
        >
          {history.length === 0 ? <p className="text-emerald-100/40">SCREEN CLEARED</p> : history.map((line, index) => (
            <p key={`${index}-${line}`} className={line.startsWith('>') ? 'text-white' : undefined}>{line}</p>
          ))}
        </div>

        <form onSubmit={submit} className="flex gap-2 border-t border-emerald-300/20 p-4">
          <label htmlFor="hab-command" className="sr-only">Enter terminal command</label>
          <span aria-hidden="true" className="self-center font-mono text-emerald-300">&gt;</span>
          <input
            ref={inputRef}
            id="hab-command"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="min-h-11 min-w-0 flex-1 rounded border border-emerald-300/25 bg-emerald-950/35 px-3 font-mono text-sm text-white outline-none placeholder:text-emerald-100/25 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300/30"
            placeholder="enter command"
          />
          <button
            type="submit"
            className="min-h-11 rounded border border-emerald-300/40 bg-emerald-300/10 px-4 font-heading text-xs tracking-wide text-emerald-100 hover:bg-emerald-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            Execute
          </button>
        </form>
        <p className="flex items-center gap-2 px-5 pb-4 font-mono text-[10px] text-emerald-100/35">
          <Coffee aria-hidden="true" className="h-3 w-3" /> HAB operators occasionally leave clues in plain sight.
        </p>
      </DialogContent>
    </Dialog>
  );
};
