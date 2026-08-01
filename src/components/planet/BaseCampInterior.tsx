import { motion } from 'framer-motion';
import { PlanetData } from '@/data/planets';
import { DoorOpen, Monitor } from 'lucide-react';

interface BaseCampInteriorProps {
  planet: PlanetData;
  onExit: () => void;
  onAccessComputer: () => void;
}

export const BaseCampInterior = ({ planet, onExit, onAccessComputer }: BaseCampInteriorProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="room-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(220, 25%, 10%)" />
            <stop offset="45%" stopColor="hsl(220, 19%, 14%)" />
            <stop offset="100%" stopColor="hsl(220, 15%, 12%)" />
          </linearGradient>
          <radialGradient id="ceiling-glow" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="hsl(220, 30%, 18%)" />
            <stop offset="100%" stopColor="hsl(220, 25%, 12%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wall-panel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(220, 22%, 15%)" />
            <stop offset="100%" stopColor="hsl(220, 17%, 20%)" />
          </linearGradient>
          <radialGradient id="viewport-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={planet.color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={planet.color} stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="1000" height="600" fill="url(#room-bg)" />
        <rect x="0" y="0" width="1000" height="240" fill="url(#ceiling-glow)" />

        {[130, 330, 500, 670, 870].map((x) => (
          <rect key={x} x={x - 6} y="60" width="12" height="130" rx="4" fill="hsl(220, 14%, 22%)" />
        ))}

        {[320, 500, 680].map((x, i) => (
          <g key={x}>
            <rect x={x - 55} y="34" width="110" height="14" rx="6" fill="hsl(200, 55%, 60%)" />
            <motion.rect
              x={x - 60}
              y="46"
              width="120"
              height="120"
              rx="60"
              fill="hsl(200, 80%, 60%)"
              opacity="0.08"
              animate={{ opacity: [0.06, 0.14, 0.06] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
            />
          </g>
        ))}

        <rect x="420" y="20" width="160" height="90" rx="30" fill="hsl(230, 45%, 8%)" stroke="hsl(220, 20%, 32%)" strokeWidth="5" />
        <rect x="420" y="20" width="160" height="90" rx="30" fill="url(#viewport-glow)" />

        <rect x="0" y="90" width="170" height="420" fill="url(#wall-panel)" />
        <rect x="164" y="90" width="6" height="420" fill="hsl(220, 15%, 28%)" />
        <rect x="120" y="130" width="10" height="330" rx="5" fill="hsl(220, 12%, 40%)" />
        <rect x="100" y="160" width="6" height="260" rx="3" fill="hsl(190, 55%, 32%)" />
        {[0, 1, 2, 3].map((i) => (
          <motion.rect
            key={i}
            x="130"
            y={330 + i * 34}
            width="14"
            height="26"
            rx="6"
            fill="hsl(200, 70%, 45%)"
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        <g transform="translate(1000,0) scale(-1,1)">
          <rect x="0" y="90" width="170" height="420" fill="url(#wall-panel)" />
        </g>
        <rect x="830" y="90" width="6" height="420" fill="hsl(220, 15%, 28%)" />
        <rect x="855" y="150" width="70" height="50" rx="6" fill="hsl(220, 20%, 10%)" stroke="hsl(220, 15%, 30%)" strokeWidth="2" />
        <motion.rect
          x="861"
          y="156"
          width="58"
          height="38"
          rx="4"
          fill="hsl(150, 45%, 18%)"
          animate={{ opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        {[0, 1, 2, 3].map((i) => (
          <motion.rect
            key={i}
            x="860"
            y={330 + i * 34}
            width="14"
            height="26"
            rx="6"
            fill="hsl(25, 75%, 48%)"
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

        <rect x="0" y="470" width="1000" height="130" fill="hsl(220, 13%, 12%)" stroke="hsl(220, 10%, 22%)" strokeWidth="3" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={i}
            x1={(i + 1) * 100}
            y1="470"
            x2={(i + 1) * 100}
            y2="600"
            stroke="hsl(220, 10%, 40%)"
            strokeOpacity="0.15"
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <rect
            key={i}
            x={400 + i * 20}
            y="470"
            width="10"
            height="130"
            fill={i % 2 === 0 ? 'hsl(45, 90%, 55%)' : 'transparent'}
            opacity="0.08"
          />
        ))}
      </svg>

      <motion.button
        className="absolute left-[58%] bottom-[22%] -translate-x-1/2 z-20 group cursor-pointer"
        onClick={onAccessComputer}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
          className="overflow-visible transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(0,200,255,0.35)]"
        >
          <defs>
            <linearGradient id="monitor-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(220, 25%, 20%)" />
              <stop offset="100%" stopColor="hsl(220, 20%, 12%)" />
            </linearGradient>
          </defs>
          <rect x="25" y="10" width="100" height="72" rx="8" fill="url(#monitor-body)" stroke="hsl(220, 18%, 34%)" strokeWidth="3" />
          <motion.rect
            x="35"
            y="20"
            width="80"
            height="52"
            rx="4"
            fill="hsl(200, 50%, 14%)"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <rect x="70" y="82" width="10" height="14" fill="hsl(220, 10%, 35%)" />
          <rect x="50" y="96" width="50" height="6" rx="3" fill="hsl(220, 10%, 20%)" />
          <rect x="20" y="102" width="110" height="16" rx="3" fill="hsl(220, 12%, 22%)" stroke="hsl(220, 12%, 30%)" strokeWidth="2" />
          <rect x="26" y="118" width="8" height="26" fill="hsl(220, 10%, 20%)" />
          <rect x="116" y="118" width="8" height="26" fill="hsl(220, 10%, 20%)" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-start pt-4 pointer-events-none">
          <Monitor className="w-4 h-4 text-cyan-400 mt-2" />
          <p className="text-[9px] font-mono text-cyan-400 mt-1">MISSION TERMINAL</p>
        </div>

        <motion.div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="hud-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm tracking-mission text-primary">Access Terminal</span>
          </div>
        </motion.div>
      </motion.button>

      <motion.button
        className="absolute bottom-[22%] left-[38%] -translate-x-1/2 z-30 group cursor-pointer"
        onClick={onExit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.03 }}
      >
        <svg
          width="110"
          height="160"
          viewBox="0 0 110 160"
          className="overflow-visible transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(255,107,53,0.35)]"
        >
          <rect x="5" y="5" width="100" height="150" rx="14" fill="hsl(220, 15%, 22%)" stroke="hsl(220, 12%, 34%)" strokeWidth="4" />
          <rect
            x="16"
            y="16"
            width="78"
            height="128"
            rx="10"
            fill="hsl(220, 17%, 15%)"
            stroke="hsl(220, 10%, 30%)"
            strokeWidth="2"
            className="transition-colors duration-300 group-hover:stroke-primary"
          />
          <rect x="34" y="30" width="42" height="30" rx="4" fill="hsl(220, 28%, 10%)" stroke="hsl(220, 16%, 36%)" strokeWidth="2" />
          <rect x="82" y="70" width="8" height="30" rx="4" fill="hsl(220, 8%, 55%)" />
          <motion.circle
            cx="86"
            cy="85"
            r="3"
            fill="hsl(140, 70%, 50%)"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <text x="55" y="126" textAnchor="middle" fontSize="8" fill="hsl(220, 10%, 55%)" fontFamily="monospace" letterSpacing="1">
            AIRLOCK
          </text>
        </svg>

        <motion.div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="hud-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm tracking-mission text-primary">Exit</span>
          </div>
        </motion.div>
      </motion.button>

      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          className="hud-panel px-4 md:px-8 py-3 md:py-4 rounded-lg text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[10px] md:text-xs tracking-mission text-muted-foreground mb-1">BASE CAMP INTERIOR</p>
          <h1 className="font-heading text-lg md:text-xl text-primary text-glow">{planet.displayName}</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{planet.description}</p>
        </motion.div>
      </div>

      <motion.button
        className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 hud-panel px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center gap-2 md:gap-3 hover:bg-accent/20 transition-colors"
        onClick={onExit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <DoorOpen className="w-4 md:w-5 h-4 md:h-5" />
        <span className="font-heading text-xs md:text-sm tracking-mission">Exit Base Camp</span>
      </motion.button>

      <div className="fixed top-4 left-4 text-[10px] md:text-xs font-mono text-muted-foreground z-30 hidden md:block">
        <p>LOCATION: INTERIOR</p>
        <p>LIFE SUPPORT: ACTIVE</p>
        <p>PRESSURE: NOMINAL</p>
        <p>AIRLOCK: SEALED</p>
      </div>

      <div className="fixed top-4 right-4 text-[10px] md:text-xs font-mono text-muted-foreground text-right z-30 hidden md:block">
        <p>SYSTEMS: ONLINE</p>
        <p>POWER: 98%</p>
        <p>O₂ RECYCLER: ACTIVE</p>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${25 + Math.random() * 50}%`,
            }}
            animate={{ y: [0, -15, 0], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>
    </motion.div>
  );
};
