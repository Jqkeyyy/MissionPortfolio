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
      {/* Interior background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            hsl(220, 25%, 10%) 0%,
            hsl(220, 20%, 13%) 30%,
            hsl(220, 18%, 16%) 70%,
            hsl(220, 15%, 12%) 100%
          )`,
        }}
      />

      {/* Curved ceiling structure */}
      <div
        className="absolute top-0 left-0 right-0 h-[40%]"
        style={{
          background: `radial-gradient(ellipse 130% 100% at 50% 0%,
            hsl(220, 30%, 18%) 0%,
            hsl(220, 25%, 12%) 60%,
            transparent 100%
          )`,
        }}
      />

      {/* Ceiling beams */}
      <div className="absolute top-[15%] left-0 right-0 flex justify-between px-[10%]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-32 rounded-b-lg"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 15%, 25%), hsl(220, 12%, 18%))',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            }}
          />
        ))}
      </div>

      {/* Wall panels - left with equipment */}
      <div className="absolute left-0 top-[15%] bottom-[15%] w-[18%]">
        <div
          className="h-full"
          style={{
            background: 'linear-gradient(90deg, hsl(220, 22%, 15%), hsl(220, 18%, 20%))',
            borderRight: '4px solid hsl(220, 15%, 28%)',
          }}
        />
        {/* Pipes */}
        <div className="absolute right-6 top-[10%] bottom-[10%] w-2 bg-gradient-to-b from-gray-600 via-gray-500 to-gray-600 rounded-full" />
        <div className="absolute right-10 top-[15%] bottom-[20%] w-1.5 bg-gradient-to-b from-cyan-800 via-cyan-600 to-cyan-800 rounded-full" />
        {/* Vent */}
        <div className="absolute right-4 top-[30%] w-12 h-16 rounded-sm" style={{ background: 'hsl(220, 15%, 12%)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-2 bg-black/40 mt-1 mx-1 rounded-sm" />
          ))}
        </div>
        {/* Panel lights */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute right-3 w-3 h-10 rounded-full"
            style={{ top: `${55 + i * 12}%`, background: 'linear-gradient(180deg, hsl(200, 80%, 50%), hsl(200, 60%, 30%))' }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
        {/* Equipment rack */}
        <div className="absolute right-4 bottom-[15%] w-14 h-24 rounded-sm" style={{ background: 'linear-gradient(180deg, hsl(220, 12%, 22%), hsl(220, 10%, 16%))' }}>
          <div className="p-1.5 space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 rounded-sm bg-black/30 flex items-center px-1 gap-1">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-green-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1 + i * 0.3, repeat: Infinity }} />
                <div className="flex-1 h-1 bg-gray-600 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wall panels - right with equipment */}
      <div className="absolute right-0 top-[15%] bottom-[15%] w-[18%]">
        <div
          className="h-full"
          style={{
            background: 'linear-gradient(270deg, hsl(220, 22%, 15%), hsl(220, 18%, 20%))',
            borderLeft: '4px solid hsl(220, 15%, 28%)',
          }}
        />
        {/* Pipes */}
        <div className="absolute left-6 top-[5%] bottom-[15%] w-2 bg-gradient-to-b from-gray-600 via-gray-500 to-gray-600 rounded-full" />
        <div className="absolute left-10 top-[20%] bottom-[10%] w-1 bg-gradient-to-b from-orange-800 via-orange-600 to-orange-800 rounded-full" />
        {/* Wall monitor */}
        <div className="absolute left-4 top-[25%] w-20 h-14 rounded-md overflow-hidden" style={{ background: 'hsl(220, 20%, 10%)', border: '2px solid hsl(220, 15%, 30%)' }}>
          <motion.div
            className="absolute inset-1 rounded-sm"
            style={{ background: 'linear-gradient(180deg, hsl(150, 50%, 20%), hsl(150, 40%, 12%))' }}
            animate={{ opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="absolute inset-2 flex flex-col gap-1 justify-center">
            <div className="h-0.5 bg-green-400/50 rounded-full" />
            <div className="h-0.5 bg-green-400/40 rounded-full w-4/5" />
            <div className="h-0.5 bg-green-400/30 rounded-full w-3/5" />
          </div>
        </div>
        {/* Panel lights */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-3 w-3 h-10 rounded-full"
            style={{ top: `${55 + i * 12}%`, background: 'linear-gradient(180deg, hsl(25, 80%, 50%), hsl(25, 60%, 30%))' }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
        {/* Storage locker */}
        <div className="absolute left-4 bottom-[15%] w-14 h-28 rounded-sm" style={{ background: 'linear-gradient(180deg, hsl(220, 12%, 25%), hsl(220, 10%, 18%))', border: '2px solid hsl(220, 10%, 35%)' }}>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-600" />
          <div className="absolute top-10 left-0 right-0 h-px bg-gray-600" />
        </div>
      </div>

      {/* Floor with details */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[22%]"
        style={{
          background: `linear-gradient(180deg,
            hsl(220, 15%, 14%) 0%,
            hsl(220, 12%, 10%) 100%
          )`,
          borderTop: '3px solid hsl(220, 10%, 22%)',
        }}
      >
        {/* Floor grid pattern */}
        <div className="absolute inset-0 opacity-15">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${(i + 1) * 10}%` }} />
          ))}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${(i + 1) * 30}%` }} />
          ))}
        </div>
        {/* Floor hazard stripes near door */}
        <div className="absolute bottom-0 left-[35%] md:left-[38%] -translate-x-1/2 w-40 h-full flex">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-yellow-500/10' : 'bg-transparent'}`} />
          ))}
        </div>
      </div>

      {/* Ceiling lights */}
      <div className="absolute top-[6%] left-1/2 -translate-x-1/2 flex gap-28">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative">
            <div
              className="w-28 h-5 rounded-b-lg"
              style={{
                background: 'linear-gradient(180deg, hsl(200, 50%, 55%), hsl(200, 40%, 40%))',
                boxShadow: '0 15px 50px rgba(100, 200, 255, 0.4), 0 5px 20px rgba(100, 200, 255, 0.6)',
              }}
            />
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top, rgba(100, 200, 255, 0.15), transparent 70%)' }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
            />
          </div>
        ))}
      </div>

      {/* Window/viewport in ceiling */}
      <div className="absolute top-[3%] left-1/2 -translate-x-1/2">
        <div
          className="w-48 h-24 rounded-[40%] overflow-hidden"
          style={{
            background: `linear-gradient(180deg, hsl(220, 50%, 6%) 0%, hsl(240, 40%, 12%) 100%)`,
            border: '5px solid hsl(220, 20%, 30%)',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute inset-0 stars-bg opacity-70" />
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full opacity-30"
            style={{ background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}80)` }}
          />
        </div>
      </div>

      {/* MAIN COMPUTER TERMINAL - right side of room, grounded on floor */}
      <motion.button
        className="absolute left-[60%] md:left-[58%] bottom-[22%] -translate-x-1/2 z-20 group cursor-pointer"
        onClick={onAccessComputer}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Computer workstation */}
        <div className="relative flex flex-col items-center">
          {/* Monitor */}
          <div
            className="w-40 h-28 md:w-48 md:h-32 rounded-lg relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(0,200,255,0.3)]"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 25%, 18%), hsl(220, 20%, 12%))',
              border: '4px solid hsl(220, 18%, 30%)',
              boxShadow: 'inset 0 0 40px rgba(0, 150, 255, 0.2), 0 10px 40px rgba(0,0,0,0.6)',
            }}
          >
            {/* Screen */}
            <motion.div
              className="absolute inset-3 rounded-md"
              style={{
                background: 'linear-gradient(180deg, hsl(200, 50%, 15%), hsl(200, 40%, 8%))',
              }}
              animate={{
                boxShadow: [
                  'inset 0 0 20px rgba(0, 200, 255, 0.2)',
                  'inset 0 0 30px rgba(0, 200, 255, 0.4)',
                  'inset 0 0 20px rgba(0, 200, 255, 0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Screen content */}
            <div className="absolute inset-4 flex flex-col justify-center items-center">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Monitor className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mb-1 md:mb-2" />
              </motion.div>
              <p className="text-[10px] md:text-xs font-mono text-cyan-400 text-center">MISSION TERMINAL</p>
              <p className="text-[8px] md:text-[10px] font-mono text-cyan-600 mt-1">CLICK TO ACCESS</p>
            </div>

            {/* Scan lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="h-px bg-cyan-400" style={{ marginTop: '5%' }} />
              ))}
            </div>
          </div>

          {/* Monitor stand neck */}
          <div className="w-6 h-4 bg-gray-700" />

          {/* Monitor stand base */}
          <div className="w-16 h-2 bg-gray-800 rounded-sm" />

          {/* Desk surface */}
          <div
            className="w-52 md:w-60 h-4 rounded-sm"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 12%, 28%), hsl(220, 10%, 20%))',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          />

          {/* Desk front panel */}
          <div
            className="w-52 md:w-60 h-8 md:h-10 rounded-b-sm"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 10%, 18%), hsl(220, 8%, 14%))',
              borderLeft: '2px solid hsl(220, 12%, 25%)',
              borderRight: '2px solid hsl(220, 12%, 25%)',
              borderBottom: '2px solid hsl(220, 12%, 25%)',
            }}
          />

          {/* Desk legs */}
          <div className="w-52 md:w-60 flex justify-between px-2">
            <div
              className="w-3 h-12 md:h-16"
              style={{
                background: 'linear-gradient(90deg, hsl(220, 10%, 22%), hsl(220, 8%, 16%))',
              }}
            />
            <div
              className="w-3 h-12 md:h-16"
              style={{
                background: 'linear-gradient(90deg, hsl(220, 8%, 16%), hsl(220, 10%, 22%))',
              }}
            />
          </div>
        </div>

        {/* Hover label */}
        <motion.div
          className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="hud-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <Monitor className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm tracking-mission text-primary">Access Terminal</span>
          </div>
        </motion.div>

        {/* Interaction pulse */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6"
          animate={{ y: [0, -4, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-6 border-2 border-cyan-400/50 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
          </div>
        </motion.div>
      </motion.button>

      {/* AIRLOCK DOOR - left side, clickable to exit */}
      <motion.button
        className="absolute bottom-[22%] left-[35%] md:left-[38%] -translate-x-1/2 z-30 group cursor-pointer origin-bottom"
        onClick={onExit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Door frame */}
        <div
          className="relative w-28 h-40 md:w-32 md:h-44 rounded-t-xl"
          style={{
            background: 'linear-gradient(180deg, hsl(220, 15%, 22%), hsl(220, 12%, 16%))',
            border: '4px solid hsl(220, 12%, 32%)',
            boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Door inner panel */}
          <div
            className="absolute inset-2 md:inset-3 rounded-t-lg transition-all duration-300 group-hover:shadow-[inset_0_0_30px_rgba(255,107,53,0.3)]"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 18%, 18%), hsl(220, 15%, 12%))',
              border: '2px solid hsl(220, 10%, 28%)',
            }}
          >
            {/* Door window */}
            <div
              className="absolute top-3 md:top-4 left-1/2 -translate-x-1/2 w-14 md:w-16 h-10 md:h-12 rounded-md overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, hsl(220, 30%, 8%), hsl(220, 25%, 15%))',
                border: '2px solid hsl(220, 15%, 35%)',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)',
              }}
            >
              <div className="absolute inset-0 opacity-40">
                <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: `linear-gradient(180deg, transparent, ${planet.color}40)` }} />
              </div>
            </div>

            {/* Door handle */}
            <div className="absolute top-1/2 right-2 md:right-3 -translate-y-1/2">
              <div className="w-2.5 md:w-3 h-10 md:h-12 rounded-full bg-gray-500 shadow-lg" />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>

            {/* Door label */}
            <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 text-center">
              <p className="text-[8px] md:text-[10px] font-mono text-gray-500 tracking-wider">AIRLOCK</p>
            </div>
          </div>

          {/* Door frame lights */}
          <motion.div
            className="absolute -left-1 top-1/4 w-1 md:w-1.5 h-6 md:h-8 rounded-full bg-green-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -right-1 top-1/4 w-1 md:w-1.5 h-6 md:h-8 rounded-full bg-green-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>

        {/* Exit label on hover */}
        <motion.div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="hud-panel px-4 py-2 rounded-lg flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm tracking-mission text-primary">Exit</span>
          </div>
        </motion.div>
      </motion.button>

      {/* Interior header */}
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

      {/* Exit button (bottom HUD) */}
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

      {/* HUD corners */}
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

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${25 + Math.random() * 50}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
