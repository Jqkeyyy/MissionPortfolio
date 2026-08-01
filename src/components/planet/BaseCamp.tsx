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
      {/* Base Camp Structure */}
      <div className="relative">
        {/* Main Habitat Dome */}
        <div className="relative">
          {/* Dome body */}
          <div
            className="w-56 h-32 rounded-t-full relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(255,107,53,0.3)]"
            style={{
              background: `linear-gradient(180deg,
                hsl(220, 20%, 25%) 0%,
                hsl(220, 15%, 20%) 50%,
                hsl(220, 10%, 15%) 100%
              )`,
              boxShadow: `
                inset 0 -10px 30px rgba(0,0,0,0.5),
                0 10px 40px rgba(0,0,0,0.6),
                0 0 0 2px hsl(var(--hud-line) / 0.3)
              `,
            }}
          >
            {/* Dome window panels */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-10 h-14 rounded-t-full"
                  style={{
                    background: `linear-gradient(180deg,
                      hsl(200, 60%, 30%) 0%,
                      hsl(200, 40%, 20%) 100%
                    )`,
                    boxShadow: 'inset 0 0 10px rgba(100, 200, 255, 0.3)',
                    border: '1px solid hsl(200, 40%, 40%)',
                  }}
                  animate={{
                    boxShadow: [
                      'inset 0 0 10px rgba(100, 200, 255, 0.3)',
                      'inset 0 0 20px rgba(100, 200, 255, 0.5)',
                      'inset 0 0 10px rgba(100, 200, 255, 0.3)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>

            {/* Dome lights */}
            <motion.div
              className="absolute top-2 right-4 w-2.5 h-2.5 rounded-full bg-mission-orange"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-3 left-6 w-2 h-2 rounded-full bg-green-400"
              animate={{ opacity: [0.8, 0.4, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />

            {/* Airlock door - highlighted */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-16 rounded-t-lg transition-colors"
              style={{
                background: `linear-gradient(180deg,
                  hsl(220, 15%, 30%) 0%,
                  hsl(220, 10%, 20%) 100%
                )`,
                border: '2px solid hsl(220, 20%, 40%)',
                borderBottom: 'none',
              }}
              whileHover={{
                borderColor: 'hsl(var(--mission-orange))',
              }}
            >
              {/* Door window */}
              <div
                className="absolute top-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-sm"
                style={{
                  background: 'linear-gradient(180deg, hsl(200, 50%, 25%), hsl(200, 40%, 15%))',
                  boxShadow: 'inset 0 0 5px rgba(100, 200, 255, 0.2)',
                }}
              />
              {/* Door handle */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-gray-500 rounded-full" />
            </motion.div>
          </div>

          {/* Base platform */}
          <div
            className="w-64 h-5 -mt-1 mx-auto rounded-sm"
            style={{
              background: 'linear-gradient(90deg, hsl(220, 10%, 15%), hsl(220, 15%, 25%), hsl(220, 10%, 15%))',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* Side structures */}
        <div className="absolute -left-20 bottom-5 flex flex-col gap-1">
          {/* Solar panel */}
          <div
            className="w-14 h-20 rounded-sm rotate-12"
            style={{
              background: `linear-gradient(45deg,
                hsl(220, 60%, 30%) 0%,
                hsl(220, 50%, 40%) 50%,
                hsl(220, 60%, 35%) 100%
              )`,
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              border: '1px solid hsl(220, 40%, 50%)',
            }}
          >
            {/* Panel grid lines */}
            <div className="absolute inset-1 grid grid-cols-3 grid-rows-5 gap-px opacity-50">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="bg-blue-900/50" />
              ))}
            </div>
          </div>
          {/* Panel stand */}
          <div className="w-2 h-8 bg-gray-600 mx-auto" />
        </div>

        {/* Antenna */}
        <div className="absolute -right-14 bottom-5">
          <div className="w-1.5 h-24 bg-gray-500 mx-auto" />
          <div
            className="w-10 h-10 rounded-full border-2 border-gray-400 bg-transparent mx-auto -mt-1"
            style={{
              borderTopColor: 'transparent',
              borderLeftColor: 'transparent',
              transform: 'rotate(45deg)',
            }}
          />
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Supply crates */}
        <div className="absolute -right-28 bottom-0 flex gap-2">
          <div
            className="w-10 h-10 rounded-sm"
            style={{
              background: 'linear-gradient(180deg, hsl(30, 30%, 35%), hsl(30, 25%, 25%))',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          />
          <div
            className="w-8 h-8 rounded-sm mt-2"
            style={{
              background: 'linear-gradient(180deg, hsl(200, 30%, 35%), hsl(200, 25%, 25%))',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          />
        </div>

        {/* Landing pad markings */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-80 h-2 flex justify-center gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-8 h-1 bg-mission-orange/40 rounded-full"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Enter hint */}
        <motion.div
          className="absolute -bottom-16 left-6 -translate-x-1/2 flex flex-col items-center"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="hud-panel px-4 py-2 rounded-lg flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <DoorClosed className="w-4 h-4 text-primary" />
            <span className="font-heading text-sm tracking-mission text-primary">Enter Base Camp</span>
          </div>
        </motion.div>

        {/* HUD Panel with planet info */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-max pointer-events-none">
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
