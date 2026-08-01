import { motion } from 'framer-motion';
import { PlanetData, ContentSign as ContentSignType } from '@/data/planets';
import { Monitor, X, ChevronRight, Database, FileText, Terminal, Package } from 'lucide-react';
import { ScanlineReveal } from '@/components/ScanlineReveal';

interface ComputerScreenProps {
  planet: PlanetData;
  onClose: () => void;
  onSelectItem: (sign: ContentSignType) => void;
}

const getItemIcon = (type: ContentSignType['type']) => {
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

export const ComputerScreen = ({ planet, onClose, onSelectItem }: ComputerScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Darkened background */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Computer monitor frame */}
      <motion.div
        className="relative w-full max-w-3xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        {/* Monitor bezel */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, hsl(220, 15%, 20%), hsl(220, 12%, 12%))',
            border: '4px solid hsl(220, 12%, 28%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.3)',
          }}
        >
          {/* Screen area */}
          <div
            className="m-3 md:m-4 rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 40%, 8%), hsl(220, 35%, 5%))',
              boxShadow: 'inset 0 0 50px rgba(0, 100, 150, 0.2)',
            }}
          >
            {/* CRT scan line effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="h-px bg-white" style={{ marginTop: '2px' }} />
              ))}
            </div>

            {/* Screen content */}
            <div className="relative p-4 md:p-6 min-h-[400px] md:min-h-[500px]">
              {/* Header bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h2 className="font-heading text-lg md:text-xl text-cyan-400 tracking-wide">
                      MISSION TERMINAL
                    </h2>
                    <p className="text-xs text-cyan-600 font-mono">
                      {planet.displayName.toUpperCase()} // {planet.description}
                    </p>
                  </div>
                </div>
                <button
                  data-testid="computer-screen-close"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 hover:text-white" />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-6" />

              {/* Menu header */}
              <div className="mb-4">
                <p className="text-xs font-mono text-gray-500 mb-1">
                  {'>'} SELECT DATA FILE TO ACCESS:
                </p>
              </div>

              {/* Content items as menu */}
              <div className="space-y-3">
                {planet.content.map((item, index) => {
                  const Icon = getItemIcon(item.type);
                  return (
                    <motion.button
                      key={item.id}
                      className="w-full text-left group"
                      onClick={() => onSelectItem(item)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <div
                        className="flex items-center gap-4 p-4 rounded-lg transition-all duration-200 group-hover:bg-cyan-500/10"
                        style={{
                          background: 'linear-gradient(90deg, hsl(220, 30%, 12%), transparent)',
                          border: '1px solid hsl(220, 20%, 20%)',
                        }}
                      >
                        {/* Index number */}
                        <div className="w-8 h-8 rounded-md bg-cyan-500/20 flex items-center justify-center">
                          <span className="font-mono text-sm text-cyan-400">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>

                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-cyan-400" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <ScanlineReveal delay={0.1 + index * 0.1} duration={0.3}>
                            <h3 className="font-heading text-base md:text-lg text-white group-hover:text-cyan-300 transition-colors truncate">
                              {item.title}
                            </h3>
                          </ScanlineReveal>
                          <p className="text-xs text-gray-500 font-mono uppercase">
                            {item.type} FILE
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between text-xs font-mono text-gray-600">
                  <span>SYSTEM STATUS: ONLINE</span>
                  <span>{planet.content.length} FILES AVAILABLE</span>
                </div>
              </div>

              {/* Blinking cursor */}
              <motion.div
                className="absolute bottom-6 left-6 flex items-center gap-1 text-cyan-500 font-mono text-sm"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span>{'>'}</span>
                <span className="w-2 h-4 bg-cyan-500" />
              </motion.div>
            </div>
          </div>

          {/* Monitor stand hint */}
          <div className="h-3 bg-gradient-to-b from-transparent to-black/20" />
        </div>

        {/* Monitor base/stand */}
        <div className="flex justify-center">
          <div
            className="w-20 h-8 -mt-1 rounded-b-lg"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 12%, 18%), hsl(220, 10%, 12%))',
            }}
          />
        </div>
        <div className="flex justify-center">
          <div
            className="w-40 h-3 rounded-b-lg"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 10%, 15%), hsl(220, 8%, 10%))',
              boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
            }}
          />
        </div>

        {/* Close hint */}
        <p className="text-center text-xs text-gray-600 mt-4 font-mono">
          PRESS ESC OR CLICK OUTSIDE TO EXIT TERMINAL
        </p>
      </motion.div>
    </motion.div>
  );
};
