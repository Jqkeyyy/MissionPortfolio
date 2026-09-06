/* eslint-disable react-refresh/only-export-components -- HAB/OS app registry and renderer intentionally share one module. */
import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import {
  Bot,
  Camera,
  Car,
  CirclePlay,
  Gamepad2,
  Heart,
  MailOpen,
  MessageCircle,
  Minus,
  Music2,
  PackageOpen,
  Paintbrush,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  ShoppingBasket,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { PlanetData } from '@/data/planets';

export type FunAppId =
  | 'spotifly'
  | 'viewtube'
  | 'discourse'
  | 'spacebook'
  | 'snacks'
  | 'rover'
  | 'paint'
  | 'solitaire'
  | 'recycle'
  | 'bolty'
  | 'mission-chat'
  | 'camera-roll';

export interface FunAppDefinition {
  id: FunAppId;
  label: string;
  title: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  category: 'communication' | 'media' | 'mission' | 'utilities';
}

export const FUN_APPS: FunAppDefinition[] = [
  { id: 'spotifly', label: 'Spotifly', title: 'Spotifly', icon: Music2, color: '#86efac', gradient: 'from-emerald-500 to-lime-300', category: 'media' },
  { id: 'viewtube', label: 'ViewTube', title: 'ViewTube', icon: CirclePlay, color: '#fb7185', gradient: 'from-rose-600 to-orange-400', category: 'media' },
  { id: 'discourse', label: 'Discourse', title: 'Discourse', icon: MessageCircle, color: '#818cf8', gradient: 'from-indigo-600 to-violet-400', category: 'communication' },
  { id: 'spacebook', label: 'Spacebook', title: 'Spacebook', icon: Wifi, color: '#60a5fa', gradient: 'from-blue-600 to-cyan-400', category: 'communication' },
  { id: 'snacks', label: 'Snack Manager', title: 'Snack Manager', icon: ShoppingBasket, color: '#fbbf24', gradient: 'from-amber-500 to-orange-400', category: 'utilities' },
  { id: 'rover', label: 'Rover Dash', title: 'Rover Dashboard', icon: Car, color: '#fb923c', gradient: 'from-orange-600 to-amber-300', category: 'utilities' },
  { id: 'paint', label: 'Paint.exe', title: 'Paint.exe', icon: Paintbrush, color: '#f0abfc', gradient: 'from-fuchsia-500 via-cyan-400 to-amber-300', category: 'media' },
  { id: 'solitaire', label: 'Mars Solitaire', title: 'Solitaire: Mars Edition', icon: Gamepad2, color: '#fca5a5', gradient: 'from-red-700 to-orange-500', category: 'utilities' },
  { id: 'recycle', label: 'Recycle Nebula', title: 'Recycle Nebula', icon: Trash2, color: '#a5f3fc', gradient: 'from-slate-600 to-cyan-500', category: 'utilities' },
  { id: 'bolty', label: 'Ask Bolty', title: 'Bolty Assistant', icon: Bot, color: '#fde68a', gradient: 'from-yellow-500 to-orange-500', category: 'utilities' },
  { id: 'mission-chat', label: 'Mission Chat', title: 'Mission Control Chat', icon: Send, color: '#67e8f9', gradient: 'from-cyan-600 to-blue-500', category: 'communication' },
  { id: 'camera-roll', label: 'Camera Roll', title: 'Camera Roll', icon: Camera, color: '#c4b5fd', gradient: 'from-violet-600 to-pink-400', category: 'media' },
];

export const isFunApp = (kind: string): kind is FunAppId => FUN_APPS.some((app) => app.id === kind);

const tracks = [
  ['Lo-Fi to Repair Life Support To', 'DJ Oxygen Leak', '3:42'],
  ['Ground Control to Major Intern', 'The Unpaid Astronauts', '4:01'],
  ['Oops! All Asteroids', 'Collision Course', '2:58'],
  ['There Is No Sound in Space', 'Absolute Silence', '11:11'],
];

const Spotifly = () => {
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(22);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setProgress((value) => (value >= 100 ? 0 : value + 1)), 700);
    return () => window.clearInterval(timer);
  }, [playing]);

  const changeTrack = (next: number) => {
    setTrack((next + tracks.length) % tracks.length);
    setProgress(0);
    setPlaying(true);
  };

  return (
    <div className="flex h-full min-h-0 bg-[#07110d] text-white">
      <aside className="hidden w-40 shrink-0 border-r border-white/10 bg-black/20 p-4 sm:block">
        <p className="font-heading text-lg font-bold text-emerald-300">SPOTIFLY</p>
        <p className="mt-1 text-[10px] text-white/30">Music with wings. In space.</p>
        <div className="mt-6 space-y-3 text-xs text-white/45"><p className="text-white">Home</p><p>Browse</p><p>Radio Silence</p><p>Liked Noises</p></div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 gap-5 overflow-auto bg-[radial-gradient(circle_at_70%_10%,rgba(52,211,153,.25),transparent_45%),linear-gradient(#13281f,#07110d)] p-5">
          <div className="hidden h-44 w-44 shrink-0 items-center justify-center rounded-xl bg-[radial-gradient(circle,#86efac_0_4%,transparent_5%),conic-gradient(from_20deg,#052e16,#34d399,#172554,#052e16)] shadow-2xl md:flex"><Music2 className="h-16 w-16 text-white/85" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-white/40">Playlist</p>
            <h2 className="mt-2 font-heading text-2xl font-bold">Songs for a Questionable Mission</h2>
            <p className="mt-2 text-xs text-white/45">Curated by an algorithm that has never experienced oxygen.</p>
            <div className="mt-5 divide-y divide-white/10">
              {tracks.map(([title, artist, duration], index) => (
                <button key={title} type="button" onClick={() => changeTrack(index)} className={`grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-2 px-2 py-2 text-left text-xs hover:bg-white/5 ${track === index ? 'text-emerald-300' : 'text-white/65'}`}>
                  <span>{track === index && playing ? '♫' : index + 1}</span><span className="min-w-0"><span className="block truncate">{title}</span><span className="block truncate text-[10px] text-white/30">{artist}</span></span><span className="text-white/25">{duration}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <footer className="shrink-0 border-t border-white/10 bg-[#050a07] px-4 py-3">
          <div className="mb-2 flex items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-xs">{tracks[track][0]}</p><p className="truncate text-[10px] text-white/35">{tracks[track][1]}</p></div><button aria-label="Previous track" onClick={() => changeTrack(track - 1)}><SkipBack className="h-4 w-4" /></button><button aria-label={playing ? 'Pause track' : 'Play track'} onClick={() => setPlaying((value) => !value)} className="rounded-full bg-white p-2 text-black">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button><button aria-label="Next track" onClick={() => changeTrack(track + 1)}><SkipForward className="h-4 w-4" /></button><Volume2 className="h-4 w-4 text-white/35" /></div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400 transition-[width]" style={{ width: `${progress}%` }} /></div>
        </footer>
      </main>
    </div>
  );
};

const videos = [
  ['🚀', 'I Survived 24 Hours Outside the Airlock', 'Mr. Boost', '14:22', 'from-orange-500 to-red-900'],
  ['👽', 'Top 10 Aliens Who Refused To Be Interviewed', 'WatchMojo Nebula', '8:04', 'from-lime-500 to-emerald-950'],
  ['🔧', 'Fixing a Rover With Only Duct Tape', 'Linus Space Tips', '32:19', 'from-cyan-500 to-blue-950'],
  ['🌑', 'The Dark Side of the Moon Apartment Tour', 'Cribs: Lunar', '11:03', 'from-violet-500 to-slate-950'],
];

const ViewTube = () => {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex h-full flex-col bg-[#090909] text-white">
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-white/10 px-4"><span className="flex items-center gap-1 font-heading font-bold"><span className="rounded bg-rose-600 px-1.5 py-0.5"><Play className="h-3 w-3 fill-white" /></span>ViewTube</span><div className="mx-auto w-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/35">Search videos from this solar system</div></div>
      <div className="grid min-h-0 flex-1 gap-4 overflow-auto p-4 md:grid-cols-[minmax(0,1.5fr)_minmax(13rem,.7fr)]">
        <main><button type="button" aria-label="Toggle video playback" onClick={() => setPlaying((value) => !value)} className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${videos[selected][4]}`}><span className="text-7xl drop-shadow-2xl">{videos[selected][0]}</span><span className="absolute inset-0 bg-[radial-gradient(circle,transparent,rgba(0,0,0,.5))]" />{playing ? <span className="absolute bottom-4 left-4 rounded bg-black/60 px-3 py-1 text-xs">Playing an extremely convincing simulation...</span> : <span className="absolute rounded-full bg-black/65 p-4"><Play className="h-8 w-8 fill-white" /></span>}</button><h2 className="mt-3 font-heading text-lg">{videos[selected][1]}</h2><p className="mt-1 text-xs text-white/40">{videos[selected][2]} · 4.2M views · uploaded next Tuesday</p></main>
        <aside className="space-y-2">{videos.map((video, index) => <button key={video[1]} type="button" onClick={() => { setSelected(index); setPlaying(false); }} className={`flex w-full gap-2 rounded-lg p-2 text-left hover:bg-white/10 ${selected === index ? 'bg-white/10' : ''}`}><span className={`flex aspect-video w-24 shrink-0 items-center justify-center rounded bg-gradient-to-br text-2xl ${video[4]}`}>{video[0]}</span><span className="min-w-0 text-xs"><span className="line-clamp-2 text-white/80">{video[1]}</span><span className="mt-1 block text-[10px] text-white/35">{video[2]} · {video[3]}</span></span></button>)}</aside>
      </div>
    </div>
  );
};

const Discourse = ({ planet }: { planet: PlanetData }) => {
  const [channel, setChannel] = useState('general');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ who: 'RoverBot', text: `Welcome to ${planet.displayName}. Please keep all existential dread in #off-topic.` }, { who: 'Captain Maybe', text: 'Has anyone seen the 10mm socket?' }]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!input.trim()) return; setMessages((current) => [...current, { who: 'You', text: input.trim() }]); setInput(''); };
  return <div className="flex h-full bg-[#202225] text-white"><aside className="w-40 shrink-0 bg-[#17191c] p-3"><p className="mb-4 font-heading font-bold text-indigo-300">DISCOURSE</p>{['general', 'mission-memes', 'off-topic', 'is-that-alien'].map((name) => <button key={name} onClick={() => setChannel(name)} className={`mb-1 block w-full rounded px-2 py-1.5 text-left text-xs ${channel === name ? 'bg-indigo-400/20 text-white' : 'text-white/40 hover:bg-white/5'}`}># {name}</button>)}</aside><main className="flex min-w-0 flex-1 flex-col"><header className="border-b border-white/10 px-4 py-3 text-sm font-semibold"># {channel}</header><div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">{messages.map((message, index) => <div key={`${message.who}-${index}`} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-xs">{message.who[0]}</span><p className="text-sm"><span className="font-semibold text-indigo-200">{message.who}</span><span className="ml-2 text-[10px] text-white/20">Today-ish</span><span className="mt-1 block text-white/65">{message.text}</span></p></div>)}</div><form onSubmit={submit} className="m-3 flex rounded-lg bg-white/10"><input aria-label="Message Discourse" value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Message #${channel}`} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" /><button aria-label="Send Discourse message" className="px-3 text-indigo-300"><Send className="h-4 w-4" /></button></form></main></div>;
};

const Spacebook = ({ planet }: { planet: PlanetData }) => {
  const [liked, setLiked] = useState<number[]>([]);
  const posts = [{ who: 'Curiosity Rover', avatar: '🤖', text: `Checked in at ${planet.displayName}. Again. Because I live here.`, image: '🏜️', likes: 1240 }, { who: 'The Moon', avatar: '🌙', text: 'Going through a phase. Please respect my privacy.', image: '🌘', likes: 384000 }, { who: 'Mission Control Dad', avatar: '🧑‍🚀', text: 'Space is cold. Bring a jacket.', image: '🧥', likes: 42 }];
  return <div className="h-full overflow-auto bg-[#edf1f7] p-4 text-slate-800"><header className="sticky top-0 z-10 mx-auto mb-4 flex max-w-xl items-center rounded-xl bg-white px-4 py-3 shadow"><span className="font-heading text-xl font-black text-blue-600">spacebook</span><span className="ml-auto text-xs text-slate-400">Connecting people who are extremely far apart</span></header><div className="mx-auto max-w-lg space-y-4">{posts.map((post, index) => <article key={post.who} className="overflow-hidden rounded-xl bg-white shadow-sm"><div className="flex items-center gap-3 p-4"><span className="text-2xl">{post.avatar}</span><div><p className="text-sm font-bold">{post.who}</p><p className="text-[10px] text-slate-400">Somewhere in space · ☄</p></div></div><p className="px-4 pb-3 text-sm">{post.text}</p><div className="flex h-28 items-center justify-center bg-gradient-to-br from-blue-100 to-violet-200 text-6xl">{post.image}</div><button onClick={() => setLiked((values) => values.includes(index) ? values.filter((value) => value !== index) : [...values, index])} className={`m-3 flex items-center gap-2 text-xs ${liked.includes(index) ? 'text-rose-500' : 'text-slate-500'}`}><Heart className={`h-4 w-4 ${liked.includes(index) ? 'fill-current' : ''}`} /> {(post.likes + (liked.includes(index) ? 1 : 0)).toLocaleString()} transmissions</button></article>)}</div></div>;
};

const SnackManager = () => {
  const [snacks, setSnacks] = useState([{ name: 'Freeze-Dried Ice Cream', icon: '🍨', count: 7, warning: false }, { name: 'Emergency Burritos', icon: '🌯', count: 2, warning: true }, { name: 'Moon Cheese', icon: '🧀', count: 14, warning: false }, { name: 'Suspicious Blue Gel', icon: '🧪', count: 1, warning: true }]);
  const change = (index: number, amount: number) => setSnacks((current) => current.map((snack, snackIndex) => snackIndex === index ? { ...snack, count: Math.max(0, snack.count + amount) } : snack));
  return <div className="h-full overflow-auto bg-[#11100d] p-5 text-white"><div className="mb-5 flex items-end justify-between"><div><p className="font-heading text-xl text-amber-300">SNACK MANAGER 3000</p><p className="text-xs text-white/35">Mission-critical crumbs inventory</p></div><p className="rounded bg-emerald-400/10 px-3 py-2 font-mono text-xs text-emerald-300">CALORIES: CLASSIFIED</p></div><div className="grid gap-3 sm:grid-cols-2">{snacks.map((snack, index) => <article key={snack.name} className="rounded-xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-3"><span className="text-3xl">{snack.icon}</span><div className="min-w-0 flex-1"><p className="truncate text-sm">{snack.name}</p><p className={`text-[10px] ${snack.count < 3 ? 'text-rose-300' : 'text-white/30'}`}>{snack.count < 3 ? 'CRITICAL SNACK LEVEL' : 'Adequately snacky'}</p></div></div><div className="mt-4 flex items-center justify-center gap-4"><button aria-label={`Remove ${snack.name}`} onClick={() => change(index, -1)} className="rounded-full bg-white/10 p-2"><Minus className="h-4 w-4" /></button><span className="w-10 text-center font-mono text-2xl text-amber-200">{snack.count}</span><button aria-label={`Add ${snack.name}`} onClick={() => change(index, 1)} className="rounded-full bg-white/10 p-2"><Plus className="h-4 w-4" /></button></div></article>)}</div></div>;
};

const RoverDash = ({ planet }: { planet: PlanetData }) => {
  const [moving, setMoving] = useState(false);
  const [battery, setBattery] = useState(87);
  const [distance, setDistance] = useState(18);
  const [honks, setHonks] = useState(0);
  useEffect(() => { if (!moving) return; const timer = window.setInterval(() => { setBattery((value) => Math.max(0, value - 1)); setDistance((value) => (value + 2) % 82); }, 900); return () => window.clearInterval(timer); }, [moving]);
  return <div className="grid h-full min-h-0 bg-[#080c0f] text-white md:grid-cols-[1.35fr_.65fr]"><div className="relative overflow-hidden border-r border-white/10 bg-[linear-gradient(rgba(251,146,60,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,.08)_1px,transparent_1px),radial-gradient(circle_at_65%_45%,#713f12,#111827_65%)] bg-[size:28px_28px,28px_28px,auto]"><div className="absolute left-4 top-4 font-mono text-xs text-orange-200">ROVER-01 · {planet.displayName.toUpperCase()}</div><div className="absolute h-12 w-12 transition-all duration-700" style={{ left: `${distance}%`, top: `${35 + Math.sin(distance / 8) * 20}%` }}><span className="absolute inset-0 animate-ping rounded-full bg-orange-400/20" /><span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-orange-300 bg-orange-900/80"><Car className="h-6 w-6 text-orange-200" /></span></div><div className="absolute bottom-4 left-4 rounded bg-black/45 px-3 py-2 font-mono text-[10px] text-orange-100/60">ROUTE: wherever the interesting rock is →</div></div><aside className="overflow-auto p-4"><p className="mb-3 font-heading text-lg text-orange-300">ROVER DASH</p><div className="grid grid-cols-2 gap-2">{[['BATTERY', `${battery}%`], ['SPEED', moving ? '4.2 km/h' : '0 km/h'], ['SIGNAL', 'STRONG-ISH'], ['ROCKS SEEN', '12,481']].map(([label, value]) => <div key={label} className="rounded border border-white/10 bg-white/5 p-3"><p className="font-mono text-[9px] text-white/30">{label}</p><p className="mt-1 text-sm text-white/80">{value}</p></div>)}</div><div className="mt-3 flex aspect-video items-center justify-center overflow-hidden rounded border border-white/10 bg-[radial-gradient(circle_at_60%_65%,#9a5b28,transparent_12%),linear-gradient(#442615,#b66c35)]"><Camera className="h-8 w-8 text-white/25" /><span className="absolute font-mono text-[9px] text-white/35">LIVE-ish CAMERA</span></div><button onClick={() => setMoving((value) => !value)} className="mt-3 w-full rounded bg-orange-500 px-3 py-2 text-sm font-semibold text-black">{moving ? 'Apply Space Brake' : 'Drive Toward Rock'}</button><button onClick={() => setHonks((value) => value + 1)} className="mt-2 w-full rounded border border-cyan-300/30 px-3 py-2 text-sm text-cyan-200">📣 Honk{honks ? ` · BEEP ×${honks}` : ''}</button></aside></div>;
};

const PaintExe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState('#22d3ee');
  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current!; const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; };
  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); const context = event.currentTarget.getContext('2d'); const p = point(event); context?.beginPath(); context?.moveTo(p.x, p.y); };
  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const context = event.currentTarget.getContext('2d'); const p = point(event); if (!context) return; context.strokeStyle = color; context.lineWidth = 8; context.lineCap = 'round'; context.lineJoin = 'round'; context.lineTo(p.x, p.y); context.stroke(); };
  const stop = () => { drawing.current = false; };
  const clear = () => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 900, 500);
  return <div className="flex h-full flex-col bg-[#d8dde5] text-slate-800"><div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-400 bg-[#eef1f5] p-2"><span className="mr-2 font-heading text-sm">Paint.exe</span>{['#111827', '#ef4444', '#f59e0b', '#22c55e', '#22d3ee', '#8b5cf6', '#f472b6', '#ffffff'].map((value) => <button key={value} aria-label={`Use ${value}`} onClick={() => setColor(value)} className={`h-6 w-6 rounded-full border-2 ${color === value ? 'border-slate-900' : 'border-white'}`} style={{ backgroundColor: value }} />)}<button onClick={clear} className="ml-auto flex items-center gap-1 rounded bg-slate-700 px-3 py-1.5 text-xs text-white"><RotateCcw className="h-3 w-3" /> Clear</button></div><div className="min-h-0 flex-1 overflow-hidden bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] bg-[size:20px_20px] p-3"><canvas ref={canvasRef} width={900} height={500} aria-label="Paint canvas" onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} className="h-full w-full touch-none cursor-crosshair bg-white shadow" /></div></div>;
};

type Card = { rank: number; suit: string };
const rankName = (rank: number) => ['?', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][rank];
const newSolitaireGame = () => {
  const deck: Card[] = ['♥', '♦', '♣', '♠'].flatMap((suit) => Array.from({ length: 13 }, (_, index) => ({ rank: index + 1, suit })));
  for (let index = deck.length - 1; index > 0; index -= 1) { const swap = Math.floor(Math.random() * (index + 1)); [deck[index], deck[swap]] = [deck[swap], deck[index]]; }
  const columns = Array.from({ length: 7 }, () => deck.splice(0, 5));
  return { columns, stock: deck, waste: deck.pop()! };
};

const MarsSolitaire = () => {
  const [game, setGame] = useState(newSolitaireGame);
  const remaining = game.columns.reduce((total, column) => total + column.length, 0);
  const playColumn = (index: number) => setGame((current) => { const card = current.columns[index].at(-1); if (!card) return current; const gap = Math.abs(card.rank - current.waste.rank); if (gap !== 1 && gap !== 12) return current; const columns = current.columns.map((column, columnIndex) => columnIndex === index ? column.slice(0, -1) : column); return { ...current, columns, waste: card }; });
  const draw = () => setGame((current) => { if (!current.stock.length) return current; const stock = [...current.stock]; return { ...current, stock, waste: stock.pop()! }; });
  return <div className="flex h-full flex-col overflow-auto bg-[radial-gradient(circle_at_center,#9a3412,#3f0b0b)] p-4 text-white"><div className="mb-3 flex items-center"><div><p className="font-heading text-lg text-orange-100">MARS SOLITAIRE</p><p className="text-[10px] text-orange-100/50">Play exposed cards one rank above or below the waste. Aces wrap to Kings.</p></div><button onClick={() => setGame(newSolitaireGame())} className="ml-auto flex items-center gap-1 rounded bg-white/10 px-3 py-2 text-xs"><Shuffle className="h-3 w-3" /> New Deal</button></div>{remaining === 0 && <div className="mb-3 rounded bg-amber-300 p-3 text-center font-bold text-red-950">YOU WON MARS. Earth is next.</div>}<div className="flex min-h-48 flex-1 items-start justify-center gap-2">{game.columns.map((column, columnIndex) => <button key={columnIndex} onClick={() => playColumn(columnIndex)} className="relative h-44 w-16">{column.map((card, cardIndex) => <span key={`${card.suit}-${card.rank}`} className={`absolute left-0 flex h-20 w-14 flex-col rounded-md border border-slate-300 bg-white p-1 text-left text-sm font-bold shadow ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-slate-900'}`} style={{ top: `${cardIndex * 25}px`, zIndex: cardIndex }}>{rankName(card.rank)}<span className="text-xl">{card.suit}</span></span>)}{!column.length && <span className="absolute left-0 top-0 h-20 w-14 rounded border border-dashed border-orange-200/30" />}</button>)}</div><div className="mt-4 flex items-center justify-center gap-6"><button onClick={draw} className="flex h-20 w-14 items-center justify-center rounded-md border-2 border-orange-200/50 bg-[repeating-linear-gradient(45deg,#7f1d1d_0_5px,#c2410c_5px_10px)] text-xs shadow-lg">{game.stock.length}</button><div className={`flex h-20 w-14 flex-col rounded-md bg-white p-1 text-sm font-bold shadow-lg ${game.waste.suit === '♥' || game.waste.suit === '♦' ? 'text-red-600' : 'text-slate-900'}`}>{rankName(game.waste.rank)}<span className="text-2xl">{game.waste.suit}</span></div></div></div>;
};

const RecycleNebula = () => {
  const [files, setFiles] = useState([{ name: 'definitely_not_alien.txt', detail: '2 KB · deleted after legal called' }, { name: 'return_fuel_order_FINAL_v7.doc', detail: '0 KB · concerning' }, { name: 'captains_karaoke.wav', detail: '846 MB · extremely concerning' }, { name: 'passwords_public.txt', detail: '1 KB · nice try' }]);
  return <div className="flex h-full flex-col bg-[#07131c] p-5 text-white"><div className="mb-4 flex items-center"><div><p className="font-heading text-lg text-cyan-200">RECYCLE NEBULA</p><p className="text-xs text-white/30">Where files go to contemplate their choices</p></div><button onClick={() => setFiles([])} disabled={!files.length} className="ml-auto rounded border border-rose-300/20 px-3 py-2 text-xs text-rose-200 disabled:opacity-30">Empty Nebula</button></div><div className="min-h-0 flex-1 overflow-auto rounded-lg border border-white/10">{files.length ? files.map((file) => <div key={file.name} className="flex items-center gap-3 border-b border-white/10 p-3"><MailOpen className="h-5 w-5 text-cyan-300" /><div className="min-w-0 flex-1"><p className="truncate text-sm">{file.name}</p><p className="text-[10px] text-white/30">{file.detail}</p></div><button onClick={() => setFiles((current) => current.filter((item) => item.name !== file.name))} className="rounded bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:text-white">Restore</button></div>) : <div className="flex h-full min-h-44 flex-col items-center justify-center text-white/30"><PackageOpen className="mb-3 h-10 w-10" /><p>The void is empty.</p></div>}</div></div>;
};

const Bolty = ({ planet }: { planet: PlanetData }) => {
  const replies: Record<string, string> = { survive: 'Have you tried not opening the airlock? Users report a 100% improvement.', repair: 'Hit it gently. If that fails, hit it professionally.', lonely: `Remember: you are never alone on ${planet.displayName}. The microphones are always listening.`, purpose: 'Your purpose is to dismiss software updates until morale improves.' };
  const [messages, setMessages] = useState([{ who: 'Bolty', text: 'Hi! I’m Bolty. It looks like you’re trying to survive in space. Would you like questionable help?' }]);
  const ask = (key: string) => setMessages((current) => [...current, { who: 'You', text: key }, { who: 'Bolty', text: replies[key] }]);
  return <div className="flex h-full flex-col bg-[#fff8dc] text-slate-800"><div className="flex items-center gap-3 border-b border-amber-300 bg-amber-100 p-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow"><Bot className="h-7 w-7 text-white" /></span><div><p className="font-heading font-bold">BOLTY</p><p className="text-xs text-slate-500">Helpful-ish assistant · definitely not reading your files</p></div></div><div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">{messages.map((message, index) => <div key={index} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.who === 'Bolty' ? 'bg-white shadow' : 'ml-auto bg-cyan-600 text-white'}`}><b className="mr-2 text-xs">{message.who}</b>{message.text}</div>)}</div><div className="flex flex-wrap gap-2 border-t border-amber-300 p-3">{Object.keys(replies).map((key) => <button key={key} onClick={() => ask(key)} className="rounded-full border border-amber-400 bg-white px-3 py-1.5 text-xs hover:bg-amber-100">Ask about {key}</button>)}</div></div>;
};

const MissionChat = ({ planet }: { planet: PlanetData }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ who: 'MISSION CONTROL', text: `Habitat 01, confirm you have safely arrived on ${planet.displayName}.` }, { who: 'YOU', text: 'Define “safely.”' }, { who: 'MISSION CONTROL', text: 'Copy. Updating the form to “arrived.”' }]);
  const submit = (event: FormEvent) => { event.preventDefault(); const text = input.trim(); if (!text) return; setMessages((current) => [...current, { who: 'YOU', text }]); setInput(''); window.setTimeout(() => setMessages((current) => [...current, { who: 'MISSION CONTROL', text: ['Copy that. Probably.', 'Please hold. Space is experiencing higher than normal call volume.', 'We will add it to the mission report under “interesting.”'][current.length % 3] }]), 650); };
  return <div className="flex h-full flex-col bg-[#02090e] p-4 font-mono text-cyan-100"><div className="mb-3 flex items-center gap-2 border-b border-cyan-300/15 pb-3"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /><span className="text-xs tracking-widest">LIVE LINK · {planet.displayName.toUpperCase()}</span></div><div className="min-h-0 flex-1 space-y-3 overflow-auto">{messages.map((message, index) => <div key={index} className={message.who === 'YOU' ? 'ml-auto max-w-[80%] text-right' : 'max-w-[80%]'}><p className="text-[9px] tracking-widest text-cyan-300/35">{message.who}</p><p className={`mt-1 rounded-lg px-3 py-2 text-sm ${message.who === 'YOU' ? 'bg-cyan-500/20' : 'bg-white/5'}`}>{message.text}</p></div>)}</div><form onSubmit={submit} className="mt-3 flex border border-cyan-300/20 bg-cyan-300/5"><input aria-label="Message Mission Control" value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" placeholder="Transmit message..." /><button className="px-3 text-cyan-300"><Send className="h-4 w-4" /></button></form></div>;
};

const photos = [
  { title: 'First day on the job', icon: '🧑‍🚀', gradient: 'from-cyan-700 via-blue-950 to-black' },
  { title: 'Rover selfie #4,281', icon: '🤖', gradient: 'from-orange-400 via-amber-800 to-slate-950' },
  { title: 'Definitely just a weather balloon', icon: '🛸', gradient: 'from-violet-300 via-indigo-900 to-black' },
  { title: 'Lunch, before the incident', icon: '🌯', gradient: 'from-amber-300 via-orange-700 to-red-950' },
  { title: 'Blurry object approaching rapidly', icon: '👾', gradient: 'from-emerald-300 via-slate-800 to-black' },
  { title: 'Home, 34 million miles away', icon: '🌍', gradient: 'from-blue-300 via-blue-950 to-black' },
];

const CameraRoll = ({ planet }: { planet: PlanetData }) => {
  const [selected, setSelected] = useState(0);
  return <div className="grid h-full min-h-0 bg-[#08090d] text-white md:grid-cols-[1.3fr_.7fr]"><div className={`relative flex min-h-56 items-center justify-center overflow-hidden bg-gradient-to-br ${photos[selected].gradient}`}><span className="text-8xl drop-shadow-2xl blur-[1px]">{photos[selected].icon}</span><div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,.45)),repeating-linear-gradient(0deg,transparent_0_3px,rgba(255,255,255,.03)_4px)]" /><div className="absolute bottom-4 left-4"><p className="font-heading text-lg">{photos[selected].title}</p><p className="text-xs text-white/45">{planet.displayName} Camera Roll · enhanced beyond recognition</p></div></div><aside className="grid min-h-0 grid-cols-2 gap-2 overflow-auto p-3">{photos.map((photo, index) => <button key={photo.title} onClick={() => setSelected(index)} aria-label={`View ${photo.title}`} className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 bg-gradient-to-br text-3xl ${photo.gradient} ${selected === index ? 'border-violet-300' : 'border-transparent'}`}><span>{photo.icon}</span><span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-1 text-[9px]">{photo.title}</span></button>)}</aside></div>;
};

export const FunAppContent = ({ app, planet }: { app: FunAppId; planet: PlanetData }) => {
  if (app === 'spotifly') return <Spotifly />;
  if (app === 'viewtube') return <ViewTube />;
  if (app === 'discourse') return <Discourse planet={planet} />;
  if (app === 'spacebook') return <Spacebook planet={planet} />;
  if (app === 'snacks') return <SnackManager />;
  if (app === 'rover') return <RoverDash planet={planet} />;
  if (app === 'paint') return <PaintExe />;
  if (app === 'solitaire') return <MarsSolitaire />;
  if (app === 'recycle') return <RecycleNebula />;
  if (app === 'bolty') return <Bolty planet={planet} />;
  if (app === 'mission-chat') return <MissionChat planet={planet} />;
  return <CameraRoll planet={planet} />;
};
