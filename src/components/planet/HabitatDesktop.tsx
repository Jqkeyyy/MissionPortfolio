import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BatteryMedium,
  ChevronRight,
  CircleUserRound,
  Cpu,
  Database,
  FileText,
  FolderOpen,
  HardDrive,
  Inbox,
  Mail,
  Maximize2,
  Minus,
  Monitor,
  NotebookPen,
  Package,
  Power,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Terminal,
  Trash2,
  Wifi,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ContentSign, PlanetData } from '@/data/planets';
import {
  formatTelemetryReading,
  getHabitatFamily,
  getPlanetTheme,
  getTelemetryReading,
} from '@/data/planetThemes';
import { contactActions } from '@/data/contact';
import { getProjectById } from '@/data/projects';
import { ContactActions } from '@/components/portfolio/ContactActions';
import { ProjectCaseStudy } from '@/components/portfolio/ProjectCaseStudy';
import { ScanlineReveal } from '@/components/ScanlineReveal';
import { FUN_APPS, FunAppContent, isFunApp, type FunAppDefinition, type FunAppId } from './HabitatFunApps';
import {
  getPlanetThemeCssVariables,
  getPlanetThemeDataAttributes,
} from './theme/themeStyles';

type SystemApp = 'archive' | 'terminal' | 'system' | 'giggle' | 'mail' | 'notes' | FunAppId;
type WindowKind = SystemApp | 'file';

interface DesktopWindowState {
  id: string;
  kind: WindowKind;
  title: string;
  item?: ContentSign;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  offset: number;
}

interface HabitatDesktopProps {
  planet: PlanetData;
  onStandUp: () => void;
  onSelectItem?: (item: ContentSign) => void;
  bootStartedAt?: number | null;
  preview?: boolean;
}

export const HAB_OS_BOOT_DURATION_MS = 1650;

interface DesktopIconProps {
  label: string;
  detail?: string;
  icon?: LucideIcon;
  logo?: ReactNode;
  color?: string;
  onOpen: () => void;
  testId?: string;
}

interface StartMenuApp {
  label: string;
  icon: LucideIcon;
  app: SystemApp;
  color: string;
}

interface DesktopWindowProps {
  windowState: DesktopWindowState;
  icon: LucideIcon;
  accent: string;
  desktopRef: React.RefObject<HTMLDivElement>;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  children: ReactNode;
}

const getItemIcon = (type: ContentSign['type']) => {
  switch (type) {
    case 'console':
      return Terminal;
    case 'tablet':
      return FileText;
    case 'crate':
      return Package;
    default:
      return Database;
  }
};

const getFileExtension = (type: ContentSign['type']) => {
  switch (type) {
    case 'console':
      return 'SYS';
    case 'tablet':
      return 'DOC';
    case 'crate':
      return 'ARC';
    default:
      return 'DAT';
  }
};

const getWindowIcon = (windowState: DesktopWindowState) => {
  if (windowState.item) return getItemIcon(windowState.item.type);
  if (windowState.kind === 'terminal') return Terminal;
  if (windowState.kind === 'system') return Cpu;
  if (windowState.kind === 'giggle') return Search;
  if (windowState.kind === 'mail') return Mail;
  if (windowState.kind === 'notes') return NotebookPen;
  if (isFunApp(windowState.kind)) return FUN_APPS.find((app) => app.id === windowState.kind)!.icon;
  return FolderOpen;
};

const GiggleLogo = ({ compact = false }: { compact?: boolean }) => (
  <span
    aria-hidden="true"
    className={`${compact ? 'text-xl' : 'text-3xl'} font-black tracking-[-0.16em] drop-shadow-[0_0_8px_rgba(255,255,255,0.22)]`}
  >
    <span className="text-cyan-300">G</span>
    <span className="text-amber-300">i</span>
    <span className="text-rose-300">g</span>
    <span className="text-emerald-300">g</span>
    <span className="text-violet-300">l</span>
    <span className="text-cyan-200">e</span>
  </span>
);

const OrbitMailLogo = () => (
  <span aria-hidden="true" className="relative flex h-8 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 shadow-[0_0_14px_rgba(103,232,249,0.35)]">
    <Mail className="h-5 w-5 text-white" />
    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#08131c] bg-rose-400" />
  </span>
);

const NebulaNotesLogo = () => (
  <span aria-hidden="true" className="relative flex h-9 w-8 rotate-[-3deg] items-center justify-center rounded-md bg-gradient-to-b from-amber-200 to-orange-400 shadow-[0_0_14px_rgba(251,191,36,0.3)]">
    <span className="absolute inset-x-1.5 top-2 h-px bg-orange-800/40" />
    <span className="absolute inset-x-1.5 top-4 h-px bg-orange-800/40" />
    <NotebookPen className="absolute bottom-1 right-0.5 h-4 w-4 text-orange-950/75" />
  </span>
);

const FunDesktopShortcut = ({ app, onOpen }: { app: FunAppDefinition; onOpen: () => void }) => {
  const Icon = app.icon;
  return (
    <DesktopIcon
      label={app.label}
      logo={(
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${app.gradient} shadow-[0_0_14px_currentColor]`}>
          <Icon className="h-5 w-5 text-white" />
        </span>
      )}
      color={app.color}
      onOpen={onOpen}
      testId={`desktop-${app.id}`}
    />
  );
};

const DesktopIcon = ({ label, detail, icon: Icon, logo, color, onOpen, testId }: DesktopIconProps) => (
  <button
    type="button"
    data-testid={testId}
    aria-label={`Open ${label}`}
    onClick={onOpen}
    className="group flex w-[5.7rem] flex-col items-center gap-1.5 rounded-md p-2 text-center outline-none transition-[background-color,transform] hover:bg-white/10 active:scale-[0.96] focus-visible:bg-white/10 focus-visible:ring-1 focus-visible:ring-white/60 sm:w-[6.4rem]"
  >
    <span
      className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-[#08131c]/95 shadow-[0_7px_18px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform group-hover:-translate-y-0.5 sm:h-14 sm:w-14"
      style={{ color }}
    >
      {logo ?? (Icon && <Icon className="h-6 w-6 drop-shadow-[0_0_9px_currentColor] sm:h-7 sm:w-7" />)}
      <span className="absolute inset-x-2 bottom-1 h-px bg-current opacity-35" />
    </span>
    <span className="line-clamp-2 max-w-full rounded bg-black/35 px-1 text-xs font-medium leading-4 text-white shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-[13px]">
      {label}
    </span>
    {detail && <span className="sr-only">{detail}</span>}
  </button>
);

const DesktopClock = () => {
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const clockTimer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(clockTimer);
  }, []);

  return (
    <div className="text-right leading-4">
      <p>{clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      <p className="hidden text-white/25 sm:block">{clock.toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
    </div>
  );
};

const DesktopWindow = ({
  windowState,
  icon: Icon,
  accent,
  desktopRef,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  children,
}: DesktopWindowProps) => {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const windowRef = useRef<HTMLElement>(null);
  const positionX = useMotionValue(0);
  const positionY = useMotionValue(0);
  const dragOrigin = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    positionX: number;
    positionY: number;
  } | null>(null);
  const floatingStyle: CSSProperties = windowState.maximized
    ? { inset: '0.5rem 0.5rem 3.65rem' }
    : {
        left: `${Math.min(5 + windowState.offset * 3.4, 20)}%`,
        top: `${Math.min(8 + windowState.offset * 3.5, 24)}%`,
        width: 'min(45rem, 90%)',
        height: 'min(29rem, calc(100% - 6.5rem))',
      };

  const moveWindow = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current;
    const desktopElement = desktopRef.current;
    const windowElement = windowRef.current;
    if (!origin || origin.pointerId !== event.pointerId || !desktopElement || !windowElement) return;

    const desktopBounds = desktopElement.getBoundingClientRect();
    const scaleX = desktopBounds.width / desktopElement.clientWidth;
    const scaleY = desktopBounds.height / desktopElement.clientHeight;
    if (!scaleX || !scaleY) return;

    const proposedX = origin.positionX + (event.clientX - origin.clientX) / scaleX;
    const proposedY = origin.positionY + (event.clientY - origin.clientY) / scaleY;
    const minimumX = -windowElement.offsetLeft;
    const maximumX = desktopElement.clientWidth - windowElement.offsetLeft - windowElement.offsetWidth;
    const minimumY = -windowElement.offsetTop;
    const taskbarClearance = 56;
    const maximumY = desktopElement.clientHeight
      - taskbarClearance
      - windowElement.offsetTop
      - windowElement.offsetHeight;

    positionX.set(Math.min(Math.max(proposedX, minimumX), Math.max(minimumX, maximumX)));
    positionY.set(Math.min(Math.max(proposedY, minimumY), Math.max(minimumY, maximumY)));
  };

  const finishMovingWindow = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragOrigin.current?.pointerId !== event.pointerId) return;
    dragOrigin.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <motion.section
      ref={windowRef}
      role="dialog"
      aria-label={windowState.title}
      className="hab-desktop-window absolute flex min-h-48 flex-col overflow-hidden rounded-lg border border-white/20 bg-[#07131c]/[0.985] text-white shadow-[0_24px_80px_rgba(0,0,0,0.62),0_0_0_1px_rgba(255,255,255,0.05)] will-change-transform"
      style={{
        ...floatingStyle,
        zIndex: windowState.zIndex,
        x: windowState.maximized ? 0 : positionX,
        y: windowState.maximized ? 0 : positionY,
      }}
      onPointerDown={onFocus}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 310, damping: 28 }}
    >
      <header className="flex h-11 shrink-0 cursor-default select-none items-center justify-between border-b border-white/10 bg-white/[0.055] pl-3">
        <div
          className={`flex h-full min-w-0 flex-1 touch-none items-center gap-2 ${windowState.maximized ? '' : 'cursor-grab active:cursor-grabbing'}`}
          onPointerDown={(event) => {
            onFocus();
            if (windowState.maximized) return;
            event.preventDefault();
            dragOrigin.current = {
              pointerId: event.pointerId,
              clientX: event.clientX,
              clientY: event.clientY,
              positionX: positionX.get(),
              positionY: positionY.get(),
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={moveWindow}
          onPointerUp={finishMovingWindow}
          onPointerCancel={finishMovingWindow}
          onDoubleClick={onMaximize}
        >
          <Icon className="h-4 w-4 shrink-0" style={{ color: accent }} />
          <span className="truncate text-sm font-medium text-white/90">{windowState.title}</span>
        </div>
        <div className="flex h-full items-stretch">
          <button
            type="button"
            aria-label={`Minimize ${windowState.title}`}
            onClick={(event) => {
              event.stopPropagation();
              onMinimize();
            }}
            className="flex w-10 items-center justify-center text-white/45 hover:bg-white/10 hover:text-white"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`${windowState.maximized ? 'Restore' : 'Maximize'} ${windowState.title}`}
            onClick={(event) => {
              event.stopPropagation();
              onMaximize();
            }}
            className="flex w-10 items-center justify-center text-white/45 hover:bg-white/10 hover:text-white"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Close ${windowState.title}`}
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="flex w-11 items-center justify-center text-white/45 hover:bg-red-500/80 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </motion.section>
  );
};

export const HabitatDesktop = ({ planet, onStandUp, onSelectItem, bootStartedAt, preview = false }: HabitatDesktopProps) => {
  const theme = getPlanetTheme(planet.id)!;
  const family = getHabitatFamily(theme.family);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const desktopRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const [windows, setWindows] = useState<DesktopWindowState[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [booting, setBooting] = useState(() => (
    prefersReducedMotion ? false : bootStartedAt ? Date.now() - bootStartedAt < HAB_OS_BOOT_DURATION_MS : true
  ));
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'HAB/OS command console ready.',
    "Type 'help' to list available commands.",
  ]);
  const [giggleInput, setGiggleInput] = useState('');
  const [giggleQuery, setGiggleQuery] = useState('');
  const [selectedMail, setSelectedMail] = useState(0);
  const [notesText, setNotesText] = useState(
    `Things to do on ${planet.displayName}:\n\n- Check oxygen\n- Pretend the antenna is fine\n- Do not press the blinking red button\n- Water the plastic plant`,
  );
  const nextZ = useRef(20);

  const wallpaperStyle = {
    ...getPlanetThemeCssVariables(theme),
    '--terminal-accent': theme.palette.accent,
    background: `
      radial-gradient(circle at 76% 26%, ${theme.palette.secondary}45 0%, ${theme.palette.secondary}12 20%, transparent 43%),
      radial-gradient(ellipse at 50% 118%, ${theme.palette.accent}48 0%, ${theme.palette.accent}18 31%, transparent 58%),
      ${theme.wallpaper.gradient}
    `,
  } as CSSProperties;

  const planetCode = useMemo(() => planet.displayName.toUpperCase().replace(/\s+/g, '-'), [planet.displayName]);
  const mailMessages = useMemo(() => [
    {
      from: 'Mission Control',
      subject: `Quick question about ${planet.displayName}`,
      preview: 'Did anyone remember to pack the return fuel?',
      body: `Hello Habitat 01,\n\nTiny logistics question: did anyone remember to pack the return fuel? No rush. Actually, moderate rush.\n\nRegards,\nMission Control`,
      time: '08:42',
    },
    {
      from: 'Orbit Eats',
      subject: 'Your delivery is nearby-ish',
      preview: 'Your driver is currently 34 million miles away.',
      body: `Good news! Your order is on its way.\n\nEstimated arrival: 6 to 8 business light-years.\n\nPlease meet your driver at the nearest airlock.`,
      time: '07:15',
    },
    {
      from: 'HAB/OS Security',
      subject: 'Suspicious login detected',
      preview: `A login was detected from ${planet.displayName}.`,
      body: `We detected a login to your account from ${planet.displayName}.\n\nIf this was you, no action is needed. If this was not you, that raises several larger questions.`,
      time: 'Yesterday',
    },
  ], [planet.displayName]);

  useEffect(() => {
    const elapsed = bootStartedAt ? Date.now() - bootStartedAt : 0;
    const remainingBootTime = prefersReducedMotion
      ? 0
      : Math.max(0, HAB_OS_BOOT_DURATION_MS - elapsed);
    setBooting(remainingBootTime > 0);
    const bootTimer = window.setTimeout(() => setBooting(false), remainingBootTime);
    return () => {
      window.clearTimeout(bootTimer);
    };
  }, [bootStartedAt, planet.id, prefersReducedMotion]);

  const focusWindow = (id: string) => {
    nextZ.current += 1;
    setWindows((current) => current.map((entry) => (
      entry.id === id ? { ...entry, minimized: false, zIndex: nextZ.current } : entry
    )));
    setStartOpen(false);
  };

  const openWindow = (kind: WindowKind, title: string, item?: ContentSign) => {
    const id = item ? `file:${item.id}` : kind;
    const existing = windows.find((entry) => entry.id === id);
    if (existing) {
      focusWindow(id);
      return;
    }

    nextZ.current += 1;
    setWindows((current) => [
      ...current,
      {
        id,
        kind,
        title,
        item,
        minimized: false,
        maximized: false,
        zIndex: nextZ.current,
        offset: current.length % 5,
      },
    ]);
    setStartOpen(false);
    if (kind === 'terminal') window.setTimeout(() => terminalInputRef.current?.focus(), 80);
  };

  const openApp = (app: SystemApp) => {
    if (app === 'archive') openWindow('archive', `${planet.displayName} Mission Archive`);
    if (app === 'terminal') openWindow('terminal', 'HAB/OS Terminal');
    if (app === 'system') openWindow('system', 'System Information');
    if (app === 'giggle') openWindow('giggle', 'Giggle');
    if (app === 'mail') openWindow('mail', 'Orbit Mail');
    if (app === 'notes') openWindow('notes', 'Nebula Notes');
    const funApp = FUN_APPS.find((entry) => entry.id === app);
    if (funApp) openWindow(funApp.id, funApp.title);
  };

  const openItem = (item: ContentSign) => {
    openWindow('file', item.title, item);
    onSelectItem?.(item);
  };

  const closeWindow = (id: string) => {
    setWindows((current) => current.filter((entry) => entry.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows((current) => current.map((entry) => (
      entry.id === id ? { ...entry, minimized: true } : entry
    )));
  };

  const toggleMaximizeWindow = (id: string) => {
    setWindows((current) => current.map((entry) => (
      entry.id === id ? { ...entry, maximized: !entry.maximized, minimized: false } : entry
    )));
    focusWindow(id);
  };

  const runTerminalCommand = (event: FormEvent) => {
    event.preventDefault();
    const rawCommand = terminalInput.trim();
    if (!rawCommand) return;

    const [command, ...args] = rawCommand.toLowerCase().split(/\s+/);
    let response = '';

    switch (command) {
      case 'help':
        response = 'Commands: help, dir, open <number>, planet, status, about, clear, exit';
        break;
      case 'dir':
      case 'files':
        response = planet.content.map((item, index) => `${index + 1}. ${item.title}.${getFileExtension(item.type).toLowerCase()}`).join('  |  ');
        break;
      case 'open': {
        const query = args.join(' ');
        const numericIndex = Number.parseInt(query, 10);
        const selectedItem = Number.isNaN(numericIndex)
          ? planet.content.find((item) => item.title.toLowerCase().includes(query))
          : planet.content[numericIndex - 1];
        if (selectedItem) {
          openItem(selectedItem);
          response = `Opening ${selectedItem.title}...`;
        } else {
          response = "File not found. Use 'dir' to list this planet's files.";
        }
        break;
      }
      case 'planet':
      case 'location':
        response = `Current station: ${planet.displayName} / Habitat 01 / ${planet.description}`;
        break;
      case 'status':
        response = `LIFE SUPPORT: NOMINAL | COMMS: ONLINE | ARCHIVE: ${planet.content.length} FILES | POWER: 98%`;
        break;
      case 'about':
      case 'whoami':
        response = 'JAKE SASS // Developer building practical products, data tools, and interactive experiences.';
        break;
      case 'clear':
        setTerminalLines([]);
        setTerminalInput('');
        return;
      case 'exit':
      case 'logout':
        onStandUp();
        return;
      default:
        response = `Unknown command: ${command}. Type 'help' for assistance.`;
    }

    setTerminalLines((current) => [...current, `C:\\HAB\\${planetCode}> ${rawCommand}`, response]);
    setTerminalInput('');
  };

  useEffect(() => {
    if (preview) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (startOpen) {
        setStartOpen(false);
        return;
      }

      const visibleWindows = windows.filter((entry) => !entry.minimized);
      if (visibleWindows.length) {
        const topWindow = visibleWindows.reduce((top, entry) => entry.zIndex > top.zIndex ? entry : top);
        closeWindow(topWindow.id);
        return;
      }

      onStandUp();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStandUp, preview, startOpen, windows]);

  const activeWindowId = windows
    .filter((entry) => !entry.minimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]?.id;

  const searchGiggle = (event: FormEvent) => {
    event.preventDefault();
    const query = giggleInput.trim();
    if (query) setGiggleQuery(query);
  };

  const renderWindowContent = (entry: DesktopWindowState) => {
    if (isFunApp(entry.kind)) return <FunAppContent app={entry.kind} planet={planet} />;

    if (entry.kind === 'giggle') {
      const results = [
        {
          site: 'Definitely Accurate Space Facts',
          title: `${giggleQuery} — explained with unreasonable confidence`,
          description: `Everything HAB/OS could find about “${giggleQuery}” near ${planet.displayName}. Accuracy may decrease with distance from Earth.`,
        },
        {
          site: 'Cosmic Stack Exchange',
          title: `Is ${giggleQuery} supposed to make that noise?`,
          description: 'Top answer: turn it off, count to ten, turn it back on, and avoid making eye contact with the warning light.',
        },
        {
          site: 'Galactipedia',
          title: giggleQuery || 'The free encyclopedia anyone in Mission Control can edit',
          description: `A mostly complete article last updated from Habitat 01. Citation needed. Oxygen also needed.`,
        },
      ];

      return (
        <div className="flex h-full flex-col bg-[#f6f8fb] text-slate-800">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3">
            <ArrowLeft className="h-4 w-4 text-slate-400" />
            <ArrowRight className="h-4 w-4 text-slate-300" />
            <RefreshCw className="h-4 w-4 text-slate-400" />
            <div className="flex min-w-0 flex-1 items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
              <span className="mr-2 text-emerald-500">●</span> https://giggle.space/search
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-5 sm:p-7">
            <form onSubmit={searchGiggle} className={`mx-auto ${giggleQuery ? 'max-w-3xl' : 'flex min-h-full max-w-xl flex-col justify-center'}`}>
              <div className="mb-5 flex items-center justify-center"><GiggleLogo /></div>
              <div className="flex items-center rounded-full border border-slate-300 bg-white px-4 shadow-sm transition-shadow focus-within:border-cyan-400 focus-within:shadow-md">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  aria-label="Search Giggle"
                  value={giggleInput}
                  onChange={(event) => setGiggleInput(event.target.value)}
                  placeholder="Search the known-ish universe"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                />
                <span className="text-base" title="Voice search is unavailable in a vacuum">🎙️</span>
              </div>
              {!giggleQuery && <p className="mt-4 text-center text-xs text-slate-400">I’m Feeling Questionably Lucky</p>}
            </form>
            {giggleQuery && (
              <div className="mx-auto mt-6 max-w-3xl space-y-5">
                <p className="text-xs text-slate-400">About 4 results (0.0000003 light-years)</p>
                {results.map((result) => (
                  <article key={result.site} className="max-w-2xl">
                    <p className="text-xs text-slate-600">{result.site}</p>
                    <h3 className="mt-0.5 cursor-pointer text-lg font-medium text-indigo-700 hover:underline">{result.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{result.description}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (entry.kind === 'mail') {
      const message = mailMessages[selectedMail];
      return (
        <div className="flex h-full min-h-0 bg-[#071019]">
          <aside className="hidden w-36 shrink-0 border-r border-white/10 bg-black/15 p-3 sm:block">
            <button type="button" className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-2 text-xs font-semibold text-white shadow-lg">
              <Send className="h-3.5 w-3.5" /> Compose
            </button>
            <div className="space-y-1 text-xs text-white/50">
              <p className="flex items-center gap-2 rounded bg-white/10 px-2 py-2 text-white"><Inbox className="h-4 w-4" /> Inbox <span className="ml-auto">3</span></p>
              <p className="flex items-center gap-2 px-2 py-2"><Star className="h-4 w-4" /> Starred</p>
              <p className="flex items-center gap-2 px-2 py-2"><Send className="h-4 w-4" /> Sent</p>
              <p className="flex items-center gap-2 px-2 py-2"><Trash2 className="h-4 w-4" /> Trash</p>
            </div>
          </aside>
          <div className="grid min-w-0 flex-1 grid-cols-[minmax(11rem,0.85fr)_minmax(0,1.4fr)]">
            <div className="overflow-auto border-r border-white/10">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
                <OrbitMailLogo />
                <span className="font-heading text-sm tracking-wide text-white/85">Orbit Mail</span>
              </div>
              {mailMessages.map((mail, index) => (
                <button
                  key={mail.subject}
                  type="button"
                  onClick={() => setSelectedMail(index)}
                  className={`block w-full border-b border-white/10 p-3 text-left transition-colors ${selectedMail === index ? 'bg-cyan-300/10' : 'hover:bg-white/5'}`}
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-white/85"><span className="truncate">{mail.from}</span><span className="ml-auto shrink-0 text-[10px] font-normal text-white/30">{mail.time}</span></span>
                  <span className="mt-1 block truncate text-xs text-white/65">{mail.subject}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-white/30">{mail.preview}</span>
                </button>
              ))}
            </div>
            <article className="overflow-auto p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-300/55">Incoming transmission</p>
              <h3 className="mt-2 font-heading text-xl text-white/90">{message.subject}</h3>
              <p className="mt-2 border-b border-white/10 pb-4 text-xs text-white/40">From: {message.from.toLowerCase().replace(/\s+/g, '.')}@definitely.space</p>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-white/70">{message.body}</p>
            </article>
          </div>
        </div>
      );
    }

    if (entry.kind === 'notes') {
      return (
        <div className="flex h-full flex-col bg-[#f7d96f] text-amber-950">
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-amber-900/15 bg-[#efca52] px-4">
            <NebulaNotesLogo />
            <span className="font-heading text-sm font-semibold">Nebula Notes</span>
            <span className="ml-auto font-mono text-[10px] text-amber-950/45">SAVED LOCALLY · PROBABLY</span>
          </div>
          <textarea
            aria-label="Nebula Notes document"
            value={notesText}
            onChange={(event) => setNotesText(event.target.value)}
            spellCheck={false}
            className="min-h-0 flex-1 resize-none bg-[repeating-linear-gradient(transparent_0,transparent_31px,rgba(120,53,15,0.12)_32px)] px-7 py-5 font-mono text-sm leading-8 outline-none"
          />
        </div>
      );
    }

    if (entry.kind === 'archive') {
      return (
        <div className="flex h-full min-h-0 bg-[#07121a]">
          <aside className="hidden w-44 shrink-0 border-r border-white/10 bg-black/15 p-3 sm:block">
            <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">Quick access</p>
            <button type="button" className="flex w-full items-center gap-2 rounded bg-white/10 px-2.5 py-2 text-left text-xs text-white/80">
              <HardDrive className="h-4 w-4" style={{ color: theme.palette.accent }} /> Mission drive
            </button>
            <button type="button" onClick={() => openApp('system')} className="mt-1 flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-xs text-white/45 hover:bg-white/5 hover:text-white/80">
              <Cpu className="h-4 w-4" /> This station
            </button>
          </aside>
          <div className="min-w-0 flex-1 overflow-auto p-4">
            <div className="mb-4 flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 font-mono text-xs text-white/40">
              <span>HAB</span><ChevronRight className="h-3 w-3" /><span>{planetCode}</span><ChevronRight className="h-3 w-3" /><span className="text-white/70">ARCHIVE</span>
            </div>
            {planet.id === 'neptune' && (
              <section aria-labelledby="neptune-contact-heading" className="mb-4 rounded-lg border border-cyan-200/15 bg-cyan-200/[0.035] p-4">
                <h3 id="neptune-contact-heading" className="font-heading text-base tracking-[0.08em] text-cyan-100">
                  Direct communication channels
                </h3>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  Email, professional profiles, résumé, and live projects.
                </p>
                <ContactActions actions={contactActions} variant="compact" className="mt-3 sm:grid-cols-2" />
              </section>
            )}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {planet.content.map((item) => {
                const Icon = getItemIcon(item.type);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openItem(item)}
                    className="group flex min-h-28 flex-col items-center justify-center rounded-md border border-transparent p-3 text-center hover:border-white/10 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/60"
                  >
                    <Icon className="mb-2 h-8 w-8 transition-transform group-hover:-translate-y-0.5" style={{ color: theme.palette.accent }} />
                    <span className="line-clamp-2 text-sm text-white/80">{item.title}</span>
                    <span className="mt-1 font-mono text-[10px] uppercase text-white/25">{getFileExtension(item.type)} file</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (entry.kind === 'terminal') {
      return (
        <div className="flex h-full flex-col bg-[#020709] p-4 font-mono text-xs leading-6 text-emerald-200 sm:text-sm">
          <div className="min-h-0 flex-1 overflow-auto" aria-live="polite">
            {terminalLines.map((line, index) => (
              <p key={`${line}-${index}`} className={line.startsWith('C:\\') ? 'mt-2 text-cyan-200' : 'text-emerald-200/80'}>{line}</p>
            ))}
          </div>
          <form onSubmit={runTerminalCommand} className="mt-2 flex items-center gap-2 border-t border-emerald-300/10 pt-2">
            <label htmlFor="hab-terminal-input" className="shrink-0 text-cyan-200">C:\HAB\{planetCode}&gt;</label>
            <input
              ref={terminalInputRef}
              id="hab-terminal-input"
              aria-label="Terminal command"
              value={terminalInput}
              onChange={(event) => setTerminalInput(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-emerald-100 caret-emerald-300 outline-none"
            />
          </form>
        </div>
      );
    }

    if (entry.kind === 'system') {
      const habPressure = getTelemetryReading(theme, 'hab-pressure');
      const oxygenReserve = getTelemetryReading(theme, 'oxygen-reserve');
      const commsLink = getTelemetryReading(theme, 'comms-link');

      return (
        <div className="h-full overflow-auto bg-[radial-gradient(circle_at_top_right,var(--terminal-accent),transparent_46%)] p-5 sm:p-7" style={{ '--terminal-accent': `${theme.palette.accent}24` } as CSSProperties}>
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
              <Monitor className="h-8 w-8" style={{ color: theme.palette.accent }} />
            </span>
            <div>
              <p className="font-heading text-xl tracking-[0.08em]">HAB/OS</p>
              <p className="font-mono text-xs text-white/35">Exploration Edition · Build 26.09</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Station', `${planet.displayName} Habitat 01`],
              ['Mission', planet.description],
              ['Habitat family', family.label],
              ['Shell profile', family.shellProfile],
              ['Panel finish', family.panelFinish],
              ['Archive', `${planet.content.length} local objects`],
              ['Network', formatTelemetryReading(commsLink)],
              ['Hab pressure', formatTelemetryReading(habPressure)],
              ['O₂ reserve', formatTelemetryReading(oxygenReserve)],
              ['Security', 'Encrypted / read-only'],
              ['Viewport', `${theme.window.treatment} · ${theme.window.atmosphericEffect}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">{label}</p>
                <p className="mt-1 text-sm text-white/80">{value}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const item = entry.item!;
    const ItemIcon = getItemIcon(item.type);
    const project = item.projectId ? getProjectById(item.projectId) : undefined;
    return (
      <article className="h-full overflow-auto bg-[linear-gradient(145deg,#08151e,#040b10)] p-5 sm:p-8">
        <div className="mb-6 flex items-start gap-4 border-b border-white/10 pb-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <ItemIcon className="h-6 w-6" style={{ color: theme.palette.accent }} />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-xl tracking-[0.06em] text-white/90">{item.title}</h3>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-white/30">
              {planetCode} · {getFileExtension(item.type)} · Read only
            </p>
          </div>
        </div>
        <ScanlineReveal duration={0.35}>
          {project ? (
            <ProjectCaseStudy project={project} variant="full" className="max-w-5xl" />
          ) : (
            <p className="max-w-3xl whitespace-pre-line text-base leading-8 text-white/78 sm:text-lg">{item.content}</p>
          )}
        </ScanlineReveal>
      </article>
    );
  };

  const startMenuGroups: { title: string; apps: StartMenuApp[] }[] = [
    {
      title: 'Main Apps',
      apps: [
        { label: 'Archive', icon: FolderOpen, app: 'archive', color: theme.palette.accent },
        { label: 'Terminal', icon: Terminal, app: 'terminal', color: '#67e8f9' },
        { label: 'System', icon: Cpu, app: 'system', color: '#a5b4fc' },
        { label: 'Giggle', icon: Search, app: 'giggle', color: '#67e8f9' },
        { label: 'Orbit Mail', icon: Mail, app: 'mail', color: '#a78bfa' },
        { label: 'Notes', icon: NotebookPen, app: 'notes', color: '#fbbf24' },
      ],
    },
    {
      title: 'Communication',
      apps: [
        ...FUN_APPS.filter((app) => app.category === 'communication').map((app) => ({ ...app, app: app.id })),
      ],
    },
    {
      title: 'Media & Creative',
      apps: FUN_APPS.filter((app) => app.category === 'media').map((app) => ({ ...app, app: app.id })),
    },
    {
      title: 'Games & Utilities',
      apps: [
        ...FUN_APPS.filter((app) => app.category === 'utilities').map((app) => ({ ...app, app: app.id })),
      ],
    },
  ];

  return (
    <div
      ref={desktopRef}
      className="planet-theme-scope terminal-desktop hab-desktop relative h-full w-full select-none overflow-hidden"
      {...getPlanetThemeDataAttributes(theme)}
      style={wallpaperStyle}
      onPointerDown={() => setStartOpen(false)}
    >
      <div aria-hidden="true" className="terminal-grid terminal-theme-pattern absolute inset-0 opacity-20" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.035),transparent_35%,rgba(255,255,255,0.018)_62%,transparent)]" />
      <div aria-hidden="true" className="absolute bottom-[8%] right-[5%] font-heading text-[clamp(3.5rem,10vw,9rem)] font-semibold tracking-[-0.06em] text-white/[0.035]">
        {planet.displayName.toUpperCase()}
      </div>
      <div aria-hidden="true" className="terminal-family-mark absolute right-[5%] top-[5%] font-mono text-[10px] uppercase tracking-[0.24em] text-white/20">
        {family.label} · {theme.lighting.temperatureKelvin}K
      </div>
      <div aria-hidden="true" className="absolute bottom-12 left-0 right-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />

      <div className="relative z-10 flex max-h-[calc(100%-3.6rem)] w-max max-w-full items-start gap-3 overflow-x-auto overflow-y-hidden p-3">
        <section aria-label="Main desktop apps" className="w-[13.5rem] shrink-0 rounded-xl border border-white/[0.07] bg-[#02070b]/35 p-1.5">
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Main Apps</p>
          <div className="grid grid-cols-2 gap-0.5">
            <DesktopIcon label="Mission Archive" detail={`${planet.content.length} files`} icon={FolderOpen} color={theme.palette.accent} onOpen={() => openApp('archive')} testId="desktop-archive" />
            <DesktopIcon label="HAB Terminal" icon={Terminal} color="#67e8f9" onOpen={() => openApp('terminal')} testId="desktop-terminal" />
            <DesktopIcon label="This Station" icon={Monitor} color="#a5b4fc" onOpen={() => openApp('system')} testId="desktop-system" />
            <DesktopIcon label="Giggle" logo={<GiggleLogo compact />} color="#67e8f9" onOpen={() => openApp('giggle')} testId="desktop-giggle" />
            <DesktopIcon label="Orbit Mail" logo={<OrbitMailLogo />} color="#a78bfa" onOpen={() => openApp('mail')} testId="desktop-mail" />
            <DesktopIcon label="Nebula Notes" logo={<NebulaNotesLogo />} color="#fbbf24" onOpen={() => openApp('notes')} testId="desktop-notes" />
          </div>
        </section>

        <section aria-label="Mission files" className="w-[13.5rem] shrink-0 rounded-xl border border-white/[0.07] bg-[#02070b]/35 p-1.5">
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Mission Files</p>
          <div className="grid grid-cols-2 gap-0.5">
            {planet.content.map((item) => (
              <DesktopIcon key={item.id} label={item.title} detail={`${getFileExtension(item.type)} file`} icon={getItemIcon(item.type)} color={theme.palette.accent} onOpen={() => openItem(item)} />
            ))}
          </div>
        </section>

        <section aria-label="Communication desktop apps" className="w-[13.5rem] shrink-0 rounded-xl border border-white/[0.07] bg-[#02070b]/35 p-1.5">
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Communication</p>
          <div className="grid grid-cols-2 gap-0.5">
            {FUN_APPS.filter((app) => app.category === 'communication').map((app) => <FunDesktopShortcut key={app.id} app={app} onOpen={() => openApp(app.id)} />)}
          </div>
        </section>

        <section aria-label="Media desktop apps" className="w-[13.5rem] shrink-0 rounded-xl border border-white/[0.07] bg-[#02070b]/35 p-1.5">
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Media &amp; Creative</p>
          <div className="grid grid-cols-2 gap-0.5">
            {FUN_APPS.filter((app) => app.category === 'media').map((app) => <FunDesktopShortcut key={app.id} app={app} onOpen={() => openApp(app.id)} />)}
          </div>
        </section>

        <section aria-label="Utilities desktop apps" className="w-[13.5rem] shrink-0 rounded-xl border border-white/[0.07] bg-[#02070b]/35 p-1.5">
          <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">Games &amp; Utilities</p>
          <div className="grid grid-cols-2 gap-0.5">
            {FUN_APPS.filter((app) => app.category === 'utilities').map((app) => <FunDesktopShortcut key={app.id} app={app} onOpen={() => openApp(app.id)} />)}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {windows.filter((entry) => !entry.minimized).map((entry) => (
          <DesktopWindow
            key={entry.id}
            windowState={entry}
            icon={getWindowIcon(entry)}
            accent={theme.palette.accent}
            desktopRef={desktopRef}
            onFocus={() => focusWindow(entry.id)}
            onClose={() => closeWindow(entry.id)}
            onMinimize={() => minimizeWindow(entry.id)}
            onMaximize={() => toggleMaximizeWindow(entry.id)}
          >
            {renderWindowContent(entry)}
          </DesktopWindow>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {startOpen && (
          <motion.aside
            aria-label="HAB OS Start menu"
            className="absolute bottom-[3.55rem] left-2 z-[200] w-[min(22rem,calc(100%-1rem))] overflow-hidden rounded-xl border border-white/20 bg-[#07121a]/95 shadow-[0_24px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:left-3"
            onPointerDown={(event) => event.stopPropagation()}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
          >
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <CircleUserRound className="h-9 w-9 text-white/65" />
                <div>
                  <p className="text-sm font-medium text-white/90">Mission Operator</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">{planet.displayName} · Habitat 01</p>
                </div>
              </div>
            </div>
            <div className="max-h-[21rem] space-y-4 overflow-y-auto p-4">
              {startMenuGroups.map((group) => (
                <section key={group.title} aria-label={`${group.title} apps`}>
                  <p className="mb-1.5 px-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">{group.title}</p>
                  <div className="grid grid-cols-3 gap-1">
                    {group.apps.map(({ label, icon: Icon, app, color }) => (
                      <button key={app} type="button" onClick={() => openApp(app)} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg p-2 text-center text-xs text-white/60 hover:bg-white/10 hover:text-white">
                        <Icon className="h-6 w-6" style={{ color }} />
                        <span className="line-clamp-2">{label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="border-t border-white/10 p-2">
              <button type="button" onClick={onStandUp} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-red-400/10 hover:text-red-100">
                <Power className="h-4 w-4" /> Stand up from computer
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <footer
        className="absolute inset-x-0 bottom-0 z-[190] flex h-12 items-center border-t border-white/15 bg-[#03080d]/88 px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:px-3"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Open HAB OS Start menu"
          aria-expanded={startOpen}
          onClick={() => setStartOpen((open) => !open)}
          className={`flex h-9 w-10 items-center justify-center rounded-md transition-colors ${startOpen ? 'bg-white/15' : 'hover:bg-white/10'}`}
        >
          <span className="grid h-4 w-4 grid-cols-2 gap-0.5">
            {Array.from({ length: 4 }).map((_, index) => <span key={index} className="rounded-[1px] bg-cyan-200 shadow-[0_0_5px_rgba(165,243,252,0.5)]" />)}
          </span>
        </button>
        <button type="button" aria-label="Search HAB OS" onClick={() => setStartOpen(true)} className="ml-1 hidden h-9 w-32 items-center gap-2 rounded-md bg-white/[0.07] px-3 text-left text-xs text-white/35 hover:bg-white/10 sm:flex">
          <Search className="h-3.5 w-3.5" /> Search
        </button>
        <div className="ml-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1">
          {windows.map((entry) => {
            const Icon = getWindowIcon(entry);
            const active = activeWindowId === entry.id && !entry.minimized;
            return (
              <button
                key={entry.id}
                type="button"
                aria-label={`${entry.minimized ? 'Restore' : 'Focus'} ${entry.title}`}
                onClick={() => active ? minimizeWindow(entry.id) : focusWindow(entry.id)}
                className={`relative flex h-9 max-w-40 items-center gap-2 rounded-md px-2.5 text-xs transition-colors ${active ? 'bg-white/15 text-white/90' : 'text-white/45 hover:bg-white/10 hover:text-white/75'}`}
              >
                <Icon className="h-4 w-4 shrink-0" style={{ color: theme.palette.accent }} />
                <span className="hidden truncate md:inline">{entry.title}</span>
                {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full" style={{ backgroundColor: theme.palette.accent }} />}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 pl-2 font-mono text-[10px] text-white/45">
          <Wifi className="hidden h-3.5 w-3.5 sm:block" />
          <BatteryMedium className="hidden h-3.5 w-3.5 sm:block" />
          <DesktopClock />
        </div>
      </footer>

      <AnimatePresence>
        {booting && (
          <motion.div
            aria-label="HAB OS is starting"
            className="absolute inset-0 z-[300] flex flex-col items-center justify-center bg-[#020609]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <motion.div
              className="mb-5 grid h-14 w-14 grid-cols-2 gap-1.5"
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.span
                  key={index}
                  className="rounded-sm"
                  style={{ backgroundColor: theme.palette.accent }}
                  animate={{ opacity: [0.32, 1, 0.32] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: index * 0.12 }}
                />
              ))}
            </motion.div>
            <p className="font-heading text-lg tracking-[0.22em] text-white/90">HAB/OS</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">Mounting {planetCode} mission archive</p>
            <div className="mt-6 h-0.5 w-44 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full" style={{ backgroundColor: theme.palette.accent }} initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: prefersReducedMotion ? 0 : 1.35, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div aria-hidden="true" className="camp-scanlines pointer-events-none absolute inset-0 z-[400] opacity-[0.035]" />
      <div className="sr-only" aria-live="polite">
        <ShieldCheck /> HAB OS secured. <Radio /> {planet.displayName} mission archive mounted.
      </div>
    </div>
  );
};
