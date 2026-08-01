import { motion } from 'framer-motion';
import { PlanetData } from '@/data/planets';
import { DoorClosed } from 'lucide-react';

interface BaseCampProps {
  planet: PlanetData;
  onClick: () => void;
}

export const BaseCamp = ({ planet, onClick }: BaseCampProps) => {
  return (
    <motion.button
      className="absolute bottom-[18%] z-10 group"
      style={{ left: '50%' }}
      initial={{ opacity: 0, scale: 0.8, y: 20, x: '-50%' }}
      animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
      transition={{ delay: 0.4, duration: 0.6 }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <svg
          width="360"
          height="220"
          viewBox="0 0 360 220"
          className="overflow-visible transition-all duration-300 group-hover:drop-shadow-[0_0_30px_rgba(255,107,53,0.35)]"
        >
          <defs>
            <linearGradient id={`dome-${planet.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(220, 22%, 28%)" />
              <stop offset="55%" stopColor="hsl(220, 16%, 20%)" />
              <stop offset="100%" stopColor="hsl(220, 12%, 14%)" />
            </linearGradient>
            <radialGradient id={`window-${planet.id}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="hsl(200, 90%, 70%)" />
              <stop offset="100%" stopColor="hsl(200, 60%, 25%)" />
            </radialGradient>
            <linearGradient id={`panel-${planet.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(220, 60%, 42%)" />
              <stop offset="100%" stopColor="hsl(220, 55%, 22%)" />
            </linearGradient>
            <pattern id={`panel-grid-${planet.id}`} width="8" height="10" patternUnits="userSpaceOnUse">
              <rect width="8" height="10" fill="none" stroke="hsl(220, 40%, 15%)" strokeWidth="0.6" />
            </pattern>
          </defs>

          <ellipse cx="180" cy="196" rx="150" ry="14" fill="hsl(220, 12%, 10%)" opacity="0.6" />
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.line
              key={i}
              x1={70 + i * 55}
              y1="200"
              x2={92 + i * 55}
              y2="200"
              stroke="hsl(24, 95%, 53%)"
              strokeWidth="3"
              strokeLinecap="round"
              animate={{ opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}

          <g transform="translate(48, 108) rotate(-14)">
            <rect width="52" height="72" rx="3" fill={`url(#panel-${planet.id})`} stroke="hsl(220, 45%, 55%)" strokeWidth="1.5" />
            <rect width="52" height="72" rx="3" fill={`url(#panel-grid-${planet.id})`} />
          </g>
          <rect x="70" y="176" width="6" height="20" fill="hsl(220, 10%, 35%)" />

          <line x1="300" y1="70" x2="300" y2="160" stroke="hsl(220, 10%, 55%)" strokeWidth="3" />
          <path d="M 285 78 L 300 60 L 315 78" fill="none" stroke="hsl(220, 10%, 55%)" strokeWidth="2.5" />
          <motion.circle
            cx="300"
            cy="60"
            r="4"
            fill="hsl(0, 85%, 55%)"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />

          <path
            d="M 90 170 Q 90 60 180 55 Q 270 60 270 170 Z"
            fill={`url(#dome-${planet.id})`}
            stroke="hsl(var(--hud-line))"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />

          {[142, 180, 218].map((cx, i) => (
            <motion.circle
              key={cx}
              cx={cx}
              cy="108"
              r="13"
              fill={`url(#window-${planet.id})`}
              stroke="hsl(200, 40%, 45%)"
              strokeWidth="1.5"
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}

          <motion.circle
            cx="252"
            cy="72"
            r="2.5"
            fill="hsl(24, 95%, 53%)"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx="112"
            cy="76"
            r="2"
            fill="hsl(140, 70%, 50%)"
            animate={{ opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />

          <rect x="78" y="168" width="204" height="14" rx="2" fill="hsl(220, 14%, 16%)" stroke="hsl(220, 10%, 24%)" />

          <g>
            <path
              d="M 160 168 L 160 132 Q 160 122 180 122 Q 200 122 200 132 L 200 168 Z"
              fill="hsl(220, 16%, 22%)"
              stroke="hsl(220, 18%, 38%)"
              strokeWidth="2"
              className="transition-colors duration-300 group-hover:stroke-primary"
            />
            <rect x="170" y="132" width="20" height="20" rx="2" fill="hsl(200, 45%, 20%)" stroke="hsl(200, 40%, 40%)" />
            <rect x="176" y="158" width="8" height="3" rx="1.5" fill="hsl(220, 8%, 60%)" />
          </g>

          <rect x="258" y="172" width="20" height="20" rx="2" fill="hsl(30, 28%, 30%)" stroke="hsl(30, 20%, 20%)" />
          <rect x="238" y="178" width="16" height="14" rx="2" fill="hsl(200, 26%, 30%)" stroke="hsl(200, 20%, 20%)" />
        </svg>

        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="hud-panel px-4 py-2 rounded-lg flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <DoorClosed className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm tracking-mission text-primary">Enter Base Camp</span>
          </div>
        </motion.div>

        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-max pointer-events-none">
          <div
            className="hud-panel px-6 py-4 rounded-lg text-center"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--background) / 0.9), hsl(var(--background) / 0.95))',
            }}
          >
            <p className="text-xs tracking-mission text-muted-foreground mb-1">
              BASE CAMP ESTABLISHED
            </p>
            <h1 className="font-heading text-xl md:text-2xl text-primary text-glow">
              {planet.displayName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{planet.description}</p>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
