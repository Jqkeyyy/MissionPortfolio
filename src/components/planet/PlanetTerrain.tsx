import { motion } from 'framer-motion';
import { PlanetData } from '@/data/planets';

interface PlanetTerrainProps {
  planet: PlanetData;
}

// Planet-specific terrain patterns
const getTerrainPattern = (planetId: string): React.ReactNode => {
  switch (planetId) {
    case 'sun':
      // Solar flares and plasma patterns
      return (
        <g>
          {Array.from({ length: 35 }).map((_, i) => {
            const yPos = 90 + Math.random() * 25;
            return (
              <ellipse
                key={i}
                cx={5 + Math.random() * 90}
                cy={yPos}
                rx={2 + Math.random() * 5}
                ry={0.5 + Math.random() * 3}
                fill={`hsl(${30 + Math.random() * 15}, 100%, ${50 + Math.random() * 30}%)`}
                opacity={0.25 + Math.random() * 0.35}
                transform={`rotate(${Math.random() * 360} ${5 + Math.random() * 90} ${yPos})`}
              />
            );
          })}
          {/* Glowing orbs */}
          {Array.from({ length: 8 }).map((_, i) => (
            <circle
              key={`glow-${i}`}
              cx={10 + i * 12}
              cy={88 + Math.random() * 10}
              r={2 + Math.random() * 3}
              fill={`hsl(35, 100%, ${60 + Math.random() * 20}%)`}
              opacity={0.4}
            />
          ))}
        </g>
      );

    case 'mercury':
      // Spotty craters with varying gray hues
      return (
        <g>
          {Array.from({ length: 50 }).map((_, i) => {
            const x = Math.random() * 100;
            const y = 45 + Math.random() * 50;
            const size = 1 + Math.random() * 4;
            const hue = Math.random() > 0.5 ? 0 : 30;
            const lightness = 25 + Math.random() * 30;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill={`hsl(${hue}, 5%, ${lightness}%)`}
                  opacity={0.6}
                />
                <circle
                  cx={x + 0.3}
                  cy={y + 0.3}
                  r={size * 0.6}
                  fill={`hsl(${hue}, 5%, ${lightness - 10}%)`}
                  opacity={0.4}
                />
              </g>
            );
          })}
        </g>
      );

    case 'venus':
      // Thetis Regio-style ridges and lines
      return (
        <g>
          {Array.from({ length: 20 }).map((_, i) => {
            const startX = Math.random() * 30;
            const startY = 50 + Math.random() * 35;
            return (
              <path
                key={i}
                d={`M ${startX} ${startY} 
                   Q ${startX + 20 + Math.random() * 20} ${startY + Math.sin(i) * 5} 
                     ${startX + 50 + Math.random() * 30} ${startY + Math.random() * 8}`}
                stroke={`hsl(40, 30%, ${40 + Math.random() * 20}%)`}
                strokeWidth={0.5 + Math.random() * 1}
                fill="none"
                opacity={0.4 + Math.random() * 0.3}
              />
            );
          })}
          {/* Volcanic-looking patches */}
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse
              key={`patch-${i}`}
              cx={10 + i * 8}
              cy={60 + Math.sin(i) * 15}
              rx={4 + Math.random() * 3}
              ry={2 + Math.random() * 2}
              fill={`hsl(35, 40%, ${35 + Math.random() * 15}%)`}
              opacity={0.3}
            />
          ))}
        </g>
      );

    case 'earth':
      // Land masses and water
      return (
        <g>
          {/* Continents */}
          <path
            d="M 5 58 Q 15 55 25 60 T 35 58 Q 40 62 30 68 Q 15 70 5 65 Z"
            fill="hsl(120, 30%, 35%)"
            opacity={0.7}
          />
          <path
            d="M 45 55 Q 55 52 65 56 T 75 54 Q 80 60 70 65 Q 55 68 45 62 Z"
            fill="hsl(100, 25%, 40%)"
            opacity={0.6}
          />
          <path
            d="M 80 60 Q 90 57 95 62 T 100 65 Q 95 70 85 68 Z"
            fill="hsl(90, 20%, 45%)"
            opacity={0.5}
          />
          <path
            d="M 10 75 Q 20 72 30 76 Q 40 80 30 85 Q 20 87 10 82 Z"
            fill="hsl(110, 28%, 38%)"
            opacity={0.65}
          />
          {/* Sandy beaches */}
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={i}
              cx={10 + i * 12}
              cy={70 + Math.sin(i) * 8}
              rx={3}
              ry={1}
              fill="hsl(45, 50%, 70%)"
              opacity={0.4}
            />
          ))}
          {/* Water texture */}
          {Array.from({ length: 15 }).map((_, i) => (
            <path
              key={`wave-${i}`}
              d={`M ${i * 7} ${62 + Math.sin(i) * 10} Q ${i * 7 + 3.5} ${60 + Math.sin(i) * 10} ${i * 7 + 7} ${62 + Math.sin(i) * 10}`}
              stroke="hsl(200, 50%, 60%)"
              strokeWidth={0.3}
              fill="none"
              opacity={0.3}
            />
          ))}
        </g>
      );

    case 'moon':
      // Lunar craters and dust
      return (
        <g>
          {Array.from({ length: 40 }).map((_, i) => {
            const x = Math.random() * 100;
            const y = 45 + Math.random() * 50;
            const size = 1 + Math.random() * 6;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill="hsl(0, 0%, 55%)"
                  opacity={0.3}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={size * 0.7}
                  fill="hsl(0, 0%, 45%)"
                  opacity={0.4}
                />
                {size > 3 && (
                  <circle
                    cx={x + 1}
                    cy={y + 1}
                    r={size * 0.3}
                    fill="hsl(0, 0%, 35%)"
                    opacity={0.5}
                  />
                )}
              </g>
            );
          })}
        </g>
      );

    case 'mars':
      // Red dust storms and rocky terrain
      return (
        <g>
          {/* Rocky outcrops - varied heights */}
          {Array.from({ length: 18 }).map((_, i) => {
            const baseY = 95;
            const height = 8 + Math.random() * 12;
            const x = 3 + i * 5.5;
            return (
              <polygon
                key={i}
                points={`${x},${baseY} ${x + 1.5},${baseY - height} ${x + 3},${baseY}`}
                fill={`hsl(${12 + Math.random() * 8}, ${55 + Math.random() * 15}%, ${28 + Math.random() * 15}%)`}
                opacity={0.5 + Math.random() * 0.2}
              />
            );
          })}
          {/* Rock layers */}
          {Array.from({ length: 5 }).map((_, i) => (
            <rect
              key={`layer-${i}`}
              x={0}
              y={75 + i * 4}
              width={100}
              height={1.5}
              fill={`hsl(15, 40%, ${35 + i * 3}%)`}
              opacity={0.25}
            />
          ))}
          {/* Dust patterns */}
          {Array.from({ length: 25 }).map((_, i) => (
            <ellipse
              key={`dust-${i}`}
              cx={Math.random() * 100}
              cy={55 + Math.random() * 35}
              rx={1.5 + Math.random() * 3}
              ry={0.8 + Math.random() * 1.5}
              fill={`hsl(${18 + Math.random() * 10}, 50%, ${45 + Math.random() * 15}%)`}
              opacity={0.25 + Math.random() * 0.2}
            />
          ))}
        </g>
      );

    case 'jupiter':
      // Gas giant bands
      return (
        <g>
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x={0}
              y={45 + i * 4.5}
              width={100}
              height={2 + Math.random() * 2}
              fill={`hsl(${30 + i * 5}, ${40 + Math.random() * 20}%, ${50 + Math.random() * 20}%)`}
              opacity={0.4 + Math.random() * 0.3}
            />
          ))}
          {/* Great spot hint */}
          <ellipse
            cx={70}
            cy={65}
            rx={8}
            ry={4}
            fill="hsl(15, 60%, 50%)"
            opacity={0.5}
          />
        </g>
      );

    case 'saturn':
      // Banded atmosphere with ring shadows
      return (
        <g>
          {Array.from({ length: 10 }).map((_, i) => (
            <rect
              key={i}
              x={0}
              y={45 + i * 5}
              width={100}
              height={2.5}
              fill={`hsl(${40 + i * 3}, ${30 + Math.random() * 20}%, ${55 + Math.random() * 15}%)`}
              opacity={0.35}
            />
          ))}
          {/* Ring shadow */}
          <ellipse
            cx={50}
            cy={60}
            rx={45}
            ry={3}
            fill="hsl(0, 0%, 10%)"
            opacity={0.2}
          />
        </g>
      );

    case 'uranus':
      // Icy blue-green terrain
      return (
        <g>
          {Array.from({ length: 18 }).map((_, i) => (
            <polygon
              key={i}
              points={`${i * 5.8},${95} ${i * 5.8 + 2.5},${65 - Math.random() * 15} ${i * 5.8 + 5},${95}`}
              fill={`hsl(${175 + Math.random() * 20}, 50%, ${60 + Math.random() * 20}%)`}
              opacity={0.4}
            />
          ))}
          {/* Ice crystals */}
          {Array.from({ length: 40 }).map((_, i) => (
            <circle
              key={`ice-${i}`}
              cx={Math.random() * 100}
              cy={50 + Math.random() * 45}
              r={0.5 + Math.random() * 1.5}
              fill="hsl(185, 80%, 85%)"
              opacity={0.5}
            />
          ))}
        </g>
      );

    case 'neptune':
      // Deep blue stormy atmosphere
      return (
        <g>
          {/* Storm bands */}
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              d={`M 0 ${48 + i * 5} Q 25 ${46 + i * 5} 50 ${49 + i * 5} T 100 ${47 + i * 5}`}
              stroke={`hsl(220, 60%, ${40 + i * 8}%)`}
              strokeWidth={2}
              fill="none"
              opacity={0.4}
            />
          ))}
          {/* Dark spots */}
          <ellipse cx={30} cy={65} rx={5} ry={3} fill="hsl(230, 50%, 25%)" opacity={0.6} />
          <ellipse cx={75} cy={58} rx={3} ry={2} fill="hsl(230, 50%, 30%)" opacity={0.5} />
        </g>
      );

    default:
      return null;
  }
};

export const PlanetTerrain = ({ planet }: PlanetTerrainProps) => {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Curved terrain SVG */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[85%]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradient for terrain base */}
          <linearGradient id={`terrain-gradient-${planet.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={planet.color} stopOpacity={0.6} />
            <stop offset="50%" stopColor={planet.color} stopOpacity={0.75} />
            <stop offset="100%" stopColor={planet.color} stopOpacity={0.9} />
          </linearGradient>
          
          {/* Curved edge filter */}
          <filter id="terrain-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>

        {/* Main curved terrain shape */}
        <path
          d="M -5 100
             L -5 45
             Q 0 42 10 40
             Q 25 38 50 37
             Q 75 38 90 40
             Q 100 42 105 45
             L 105 100 Z"
          fill={`url(#terrain-gradient-${planet.id})`}
        />

        {/* Secondary curve for depth */}
        <path
          d="M -5 100
             L -5 55
             Q 15 52 50 50
             Q 85 52 105 55
             L 105 100 Z"
          fill={planet.color}
          opacity={0.3}
        />

        {/* Planet-specific terrain details */}
        {getTerrainPattern(planet.id)}
      </svg>


      {/* Dust particles for atmosphere */}
      <div className="absolute inset-0">
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${20 + Math.random() * 70}%`,
              backgroundColor: planet.color,
              opacity: 0.2 + Math.random() * 0.3,
            }}
            animate={{
              x: [0, Math.random() * 20 - 10],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
