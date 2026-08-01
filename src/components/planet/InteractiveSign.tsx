import { motion } from 'framer-motion';
import { ContentSign as ContentSignType } from '@/data/planets';

interface InteractiveSignProps {
  sign: ContentSignType;
  index: number;
  totalSigns: number;
  onClick: () => void;
}

const getSignStructure = (type: ContentSignType['type'], index: number) => {
  switch (type) {
    case 'console':
      // Standing console terminal
      return (
        <div className="relative">
          {/* Console screen */}
          <div
            className="w-20 h-14 rounded-t-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 30%, 15%), hsl(220, 20%, 10%))',
              border: '2px solid hsl(220, 20%, 30%)',
              boxShadow: 'inset 0 0 20px rgba(50, 150, 255, 0.2), 0 4px 15px rgba(0,0,0,0.5)',
            }}
          >
            {/* Screen glow */}
            <motion.div
              className="absolute inset-2 rounded"
              style={{
                background: 'linear-gradient(180deg, hsl(200, 50%, 25%), hsl(200, 40%, 15%))',
              }}
              animate={{
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Scan lines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-px bg-cyan-400"
                  style={{ marginTop: `${i * 12.5}%` }}
                />
              ))}
            </div>
          </div>
          {/* Console body */}
          <div
            className="w-24 h-6 -mt-px mx-auto rounded-b-sm"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 15%, 25%), hsl(220, 10%, 18%))',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            }}
          >
            {/* Buttons */}
            <div className="flex justify-center gap-1 pt-1">
              <div className="w-2 h-2 rounded-full bg-red-500/80" />
              <div className="w-2 h-2 rounded-full bg-green-500/80" />
              <div className="w-2 h-2 rounded-full bg-blue-500/80" />
            </div>
          </div>
          {/* Stand */}
          <div className="w-4 h-8 bg-gray-600 mx-auto" />
          <div className="w-12 h-2 bg-gray-700 mx-auto rounded-sm" />
        </div>
      );

    case 'tablet':
      // Mounted tablet display
      return (
        <div className="relative">
          {/* Tablet frame */}
          <div
            className="w-16 h-20 rounded-lg relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 20%, 20%), hsl(220, 15%, 12%))',
              border: '3px solid hsl(220, 15%, 35%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(50, 150, 255, 0.15)',
            }}
          >
            {/* Screen */}
            <motion.div
              className="absolute inset-2 rounded-sm"
              style={{
                background: 'linear-gradient(180deg, hsl(180, 40%, 20%), hsl(180, 30%, 12%))',
              }}
              animate={{
                boxShadow: [
                  'inset 0 0 10px rgba(100, 255, 255, 0.2)',
                  'inset 0 0 15px rgba(100, 255, 255, 0.3)',
                  'inset 0 0 10px rgba(100, 255, 255, 0.2)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          {/* Mount arm */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <div className="w-3 h-6 bg-gray-500" />
            <div className="w-6 h-2 bg-gray-600 -mt-px rounded-sm" />
          </div>
        </div>
      );

    case 'crate':
      // Supply crate with data
      return (
        <div className="relative">
          {/* Main crate */}
          <div
            className="w-20 h-16 rounded-sm relative"
            style={{
              background: `linear-gradient(180deg, 
                hsl(${30 + index * 20}, 35%, 35%) 0%, 
                hsl(${30 + index * 20}, 30%, 25%) 100%
              )`,
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              border: '2px solid hsl(30, 20%, 45%)',
            }}
          >
            {/* Crate details */}
            <div className="absolute inset-2 border border-white/10" />
            {/* Handle */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-gray-600 rounded-sm" />
            {/* Label */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-4 rounded-sm"
              style={{
                background: 'hsl(var(--mission-orange) / 0.8)',
              }}
            />
            {/* Data chip indicator */}
            <motion.div
              className="absolute top-3 right-2 w-2 h-2 rounded-full bg-green-400"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      );

    default:
      // Sign post
      return (
        <div className="relative">
          {/* Sign board */}
          <div
            className="w-24 h-12 rounded-sm relative"
            style={{
              background: 'linear-gradient(180deg, hsl(220, 15%, 30%), hsl(220, 10%, 20%))',
              border: '2px solid hsl(220, 20%, 40%)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
            }}
          >
            {/* Text lines */}
            <div className="absolute inset-2 flex flex-col justify-center gap-1">
              <div className="h-1 bg-white/20 rounded-full" />
              <div className="h-1 bg-white/15 rounded-full w-3/4" />
            </div>
          </div>
          {/* Post */}
          <div className="w-3 h-12 bg-gray-600 mx-auto -mt-px" />
          <div className="w-8 h-2 bg-gray-700 mx-auto rounded-sm" />
        </div>
      );
  }
};

export const InteractiveSign = ({ sign, index, totalSigns, onClick }: InteractiveSignProps) => {
  // Position signs in quarters, skipping 2nd quarter where base camp is
  // Positions: 12.5% (quarter 1), 62.5% (quarter 3), 87.5% (quarter 4)
  // Base camp occupies 37.5% (quarter 2)
  const signPositions = [12.5, 62.5, 87.5];

  // For fewer items, spread them appropriately around the base camp
  const getXPosition = () => {
    if (totalSigns === 1) return 62.5; // Single sign goes to right of base camp
    if (totalSigns === 2) return index === 0 ? 12.5 : 62.5; // Left and right of base camp
    // For 3+ items, use the three positions around base camp
    return signPositions[index % 3];
  };

  const x = getXPosition();

  // Arc calculation - items at edges are higher (further), center is lower (closer)
  // This creates a curved horizon effect matching the planet surface
  const normalizedX = (x - 50) / 50; // -1 to 1
  const arcOffset = Math.abs(normalizedX) * 8; // Max 8% offset at edges
  const baseY = 78; // Base vertical position
  const y = baseY - arcOffset; // Edges are higher up (smaller y = higher on screen)

  // Rotation to follow the arc - items tilt toward center
  const rotation = normalizedX * -8; // Max 8 degrees rotation at edges

  // Uniform scale for all signs
  const scale = 1;

  return (
    <motion.button
      className="absolute z-20 group"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.15 }}
      onClick={onClick}
      whileHover={{ scale: scale * 1.1 }}
      whileTap={{ scale: scale * 0.95 }}
    >
      {/* Physical sign structure */}
      <div className="relative">
        {getSignStructure(sign.type, index)}
        
        {/* Hover label */}
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0, y: 5 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          <div className="hud-panel px-3 py-1.5 rounded text-xs">
            <span className="font-heading tracking-wide text-primary">
              {sign.title}
            </span>
          </div>
        </motion.div>

        {/* Interaction hint */}
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2"
          animate={{
            y: [0, -3, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-4 h-4 border-2 border-primary/50 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          </div>
        </motion.div>
      </div>
    </motion.button>
  );
};
