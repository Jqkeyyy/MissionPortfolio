import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlanetData } from '@/data/planets';

interface PlanetTerrainProps {
  planet: PlanetData;
}

type TerrainKind = 'rocky' | 'terrestrial' | 'cloud' | 'ice' | 'solar';

interface TerrainProfile {
  kind: TerrainKind;
  seed: number;
  sky: string;
  haze: string;
  horizon: string;
  high: string;
  mid: string;
  low: string;
  shadow: string;
  accent: string;
  noise: string;
  relief: number;
}

const terrainProfiles: Record<string, TerrainProfile> = {
  sun: {
    kind: 'solar', seed: 71, sky: '#351000', haze: '#ff9a1f', horizon: '#ffd36a',
    high: '#ffb51b', mid: '#f36b0d', low: '#9b1e02', shadow: '#5c0900', accent: '#fff2a8', noise: '0.018 0.095', relief: 1.5,
  },
  mercury: {
    kind: 'rocky', seed: 19, sky: '#171611', haze: '#9a8a70', horizon: '#b5a58c',
    high: '#a89c89', mid: '#6d655a', low: '#393733', shadow: '#171817', accent: '#c9bca6', noise: '0.035 0.085', relief: 5.8,
  },
  venus: {
    kind: 'rocky', seed: 43, sky: '#392009', haze: '#d99035', horizon: '#e9b965',
    high: '#c48a45', mid: '#865426', low: '#482918', shadow: '#26160d', accent: '#efc77e', noise: '0.026 0.075', relief: 4.2,
  },
  earth: {
    kind: 'terrestrial', seed: 83, sky: '#08264d', haze: '#7dc6e8', horizon: '#c8e9ee',
    high: '#718553', mid: '#354f35', low: '#182f29', shadow: '#0b1d1a', accent: '#b5c786', noise: '0.022 0.105', relief: 7.5,
  },
  moon: {
    kind: 'rocky', seed: 29, sky: '#08090b', haze: '#81858b', horizon: '#b6b8b8',
    high: '#aaa9a3', mid: '#6c6c69', low: '#383a3b', shadow: '#17191b', accent: '#d0cec5', noise: '0.04 0.11', relief: 6.5,
  },
  mars: {
    kind: 'rocky', seed: 59, sky: '#2b1009', haze: '#c45f30', horizon: '#e5a064',
    high: '#b75d36', mid: '#73351f', low: '#402016', shadow: '#21100d', accent: '#dc8a55', noise: '0.028 0.095', relief: 8.5,
  },
  jupiter: {
    kind: 'cloud', seed: 101, sky: '#2a1a13', haze: '#d5ad87', horizon: '#f1d6b0',
    high: '#d9b791', mid: '#9d765b', low: '#5c4138', shadow: '#2b2021', accent: '#e48d62', noise: '0.012 0.13', relief: 2.2,
  },
  saturn: {
    kind: 'cloud', seed: 113, sky: '#30281c', haze: '#d9c794', horizon: '#f4e5bd',
    high: '#dfcfa4', mid: '#a99469', low: '#5f5542', shadow: '#302c25', accent: '#b99062', noise: '0.01 0.14', relief: 1.8,
  },
  uranus: {
    kind: 'ice', seed: 127, sky: '#092b32', haze: '#71d4d4', horizon: '#c0f1eb',
    high: '#9edbd3', mid: '#4f9997', low: '#27565d', shadow: '#122d35', accent: '#d8ffff', noise: '0.024 0.105', relief: 5.5,
  },
  neptune: {
    kind: 'cloud', seed: 139, sky: '#071847', haze: '#376ee0', horizon: '#85a8ff',
    high: '#4777db', mid: '#244a9c', low: '#132a64', shadow: '#08143c', accent: '#9bc4ff', noise: '0.016 0.145', relief: 2.8,
  },
};

const fallbackProfile = terrainProfiles.mars;

const seeded = (seed: number, index: number) => {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const makeHorizon = (seed: number, baseline: number, relief: number, step = 6) => {
  const points: string[] = [];
  let index = 0;

  for (let x = -5; x <= 105; x += step) {
    const broadWave = Math.sin((x + seed) * 0.115) * relief * 0.38;
    const detail = (seeded(seed, index) - 0.5) * relief;
    points.push(`${index === 0 ? 'M' : 'L'} ${x} ${(baseline - broadWave - detail).toFixed(2)}`);
    index += 1;
  }

  return points.join(' ');
};

const makeRidge = (seed: number, baseline: number, relief: number, step = 6) =>
  `${makeHorizon(seed, baseline, relief, step)} L 105 100 L -5 100 Z`;

const makeFeatures = (profile: TerrainProfile, count: number) =>
  Array.from({ length: count }, (_, index) => ({
    x: 3 + seeded(profile.seed, index * 5) * 94,
    y: 53 + seeded(profile.seed, index * 5 + 1) * 42,
    size: 0.7 + seeded(profile.seed, index * 5 + 2) * 3.4,
    stretch: 0.45 + seeded(profile.seed, index * 5 + 3) * 0.65,
    tone: seeded(profile.seed, index * 5 + 4),
  }));

const RockyDetails = ({ profile }: { profile: TerrainProfile }) => {
  const craters = makeFeatures(profile, 9);
  const rocks = makeFeatures({ ...profile, seed: profile.seed + 17 }, 11);

  return (
    <g>
      {craters.map((crater, index) => (
        <g key={`crater-${index}`} opacity={0.34 + crater.tone * 0.26}>
          <ellipse cx={crater.x} cy={crater.y} rx={crater.size * 1.8} ry={crater.size * crater.stretch} fill={profile.shadow} />
          <path
            d={`M ${crater.x - crater.size * 1.7} ${crater.y - 0.15} Q ${crater.x} ${crater.y - crater.size * crater.stretch * 1.35} ${crater.x + crater.size * 1.7} ${crater.y - 0.15}`}
            fill="none"
            stroke={profile.accent}
            strokeWidth="0.35"
            opacity="0.65"
          />
          <ellipse cx={crater.x + crater.size * 0.25} cy={crater.y + crater.size * 0.12} rx={crater.size} ry={crater.size * crater.stretch * 0.43} fill={profile.low} opacity="0.65" />
        </g>
      ))}
      {rocks.map((rock, index) => (
        <path
          key={`rock-${index}`}
          d={`M ${rock.x - rock.size} ${rock.y} L ${rock.x - rock.size * 0.35} ${rock.y - rock.size * rock.stretch} L ${rock.x + rock.size * 0.45} ${rock.y - rock.size * rock.stretch * 0.72} L ${rock.x + rock.size} ${rock.y} Z`}
          fill={rock.tone > 0.5 ? profile.mid : profile.low}
          stroke={profile.high}
          strokeWidth="0.18"
          opacity={0.45 + rock.tone * 0.35}
        />
      ))}
    </g>
  );
};

const TerrestrialDetails = ({ profile }: { profile: TerrainProfile }) => (
  <g>
    <path d="M -5 57 Q 7 48 18 55 Q 29 41 42 55 Q 57 35 72 55 Q 86 43 105 58 L 105 67 L -5 67 Z" fill="#172f34" opacity="0.68" />
    <path d="M -5 61 Q 15 54 30 63 Q 46 49 60 63 Q 80 52 105 64 L 105 72 L -5 72 Z" fill={profile.low} opacity="0.72" />
    <path d="M -5 67 Q 19 63 42 68 Q 61 62 105 68 L 105 74 L -5 74 Z" fill="#5f8890" opacity="0.25" />
    {makeFeatures(profile, 16).map((feature, index) => (
      <path
        key={`growth-${index}`}
        d={`M ${feature.x} ${feature.y} l ${-0.7 - feature.size * 0.25} ${-1.2 - feature.size * 0.7} M ${feature.x} ${feature.y} l ${0.5 + feature.size * 0.2} ${-1 - feature.size * 0.55}`}
        stroke={index % 3 === 0 ? profile.accent : profile.high}
        strokeWidth="0.22"
        opacity="0.45"
      />
    ))}
  </g>
);

const CloudDetails = ({ planetId, profile }: { planetId: string; profile: TerrainProfile }) => (
  <g fill="none">
    {Array.from({ length: 10 }, (_, index) => {
      const y = 48 + index * 4.7;
      const offset = (seeded(profile.seed, index) - 0.5) * 7;
      return (
        <path
          key={`band-${index}`}
          d={`M -5 ${y} C 18 ${y - 3 + offset}, 34 ${y + 3}, 53 ${y} S 82 ${y - 3 - offset}, 105 ${y + 0.5}`}
          stroke={index % 3 === 0 ? profile.accent : index % 2 === 0 ? profile.high : profile.low}
          strokeWidth={1.2 + (index % 3) * 0.7}
          opacity={0.22 + (index % 4) * 0.07}
        />
      );
    })}
    {(planetId === 'jupiter' || planetId === 'neptune') && (
      <g transform={planetId === 'jupiter' ? 'translate(70 67)' : 'translate(31 64)'}>
        <ellipse rx="9" ry="3.4" fill={profile.shadow} opacity="0.42" />
        <ellipse rx="7" ry="2.25" fill={profile.accent} opacity="0.34" />
        <path d="M -6 0 C -3 -2 3 2 6 0" stroke={profile.high} strokeWidth="0.5" opacity="0.7" />
      </g>
    )}
  </g>
);

const IceDetails = ({ profile }: { profile: TerrainProfile }) => (
  <g>
    {Array.from({ length: 13 }, (_, index) => {
      const x = 4 + index * 8;
      const peak = 58 + seeded(profile.seed, index) * 20;
      return (
        <path
          key={`ice-${index}`}
          d={`M ${x - 5} 96 L ${x} ${peak} L ${x + 5} 96 Z`}
          fill={index % 2 ? profile.mid : profile.high}
          stroke={profile.accent}
          strokeWidth="0.22"
          opacity={0.26 + seeded(profile.seed + 2, index) * 0.24}
        />
      );
    })}
    {Array.from({ length: 8 }, (_, index) => (
      <path
        key={`fracture-${index}`}
        d={`M ${8 + index * 13} ${69 + (index % 3) * 6} l ${3 + (index % 2)} 5 l -2 4 l 4 6`}
        fill="none"
        stroke={profile.accent}
        strokeWidth="0.34"
        opacity="0.46"
      />
    ))}
  </g>
);

const SolarDetails = ({ profile }: { profile: TerrainProfile }) => (
  <g>
    {Array.from({ length: 13 }, (_, index) => {
      const x = -2 + index * 8.5;
      const y = 54 + seeded(profile.seed, index) * 35;
      return (
        <path
          key={`plasma-${index}`}
          d={`M ${x} ${y} C ${x + 2} ${y - 7}, ${x + 5} ${y + 6}, ${x + 8} ${y - 2}`}
          fill="none"
          stroke={index % 3 === 0 ? profile.accent : profile.high}
          strokeWidth={0.5 + seeded(profile.seed + 4, index) * 1.4}
          opacity={0.28 + seeded(profile.seed + 8, index) * 0.4}
        />
      );
    })}
    {makeFeatures(profile, 6).map((feature, index) => (
      <ellipse key={`hotspot-${index}`} cx={feature.x} cy={feature.y} rx={feature.size * 2.2} ry={feature.size * 0.55} fill={profile.accent} opacity={0.12 + feature.tone * 0.16} />
    ))}
  </g>
);

const DetailLayer = ({ planetId, profile }: { planetId: string; profile: TerrainProfile }) => {
  switch (profile.kind) {
    case 'terrestrial': return <TerrestrialDetails profile={profile} />;
    case 'cloud': return <CloudDetails planetId={planetId} profile={profile} />;
    case 'ice': return <IceDetails profile={profile} />;
    case 'solar': return <SolarDetails profile={profile} />;
    default: return <RockyDetails profile={profile} />;
  }
};

const shouldUseDetailedTerrain = () => {
  if (typeof window === 'undefined') return true;

  const nav = window.navigator as Navigator & { deviceMemory?: number };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const limitedCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
  const limitedMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;

  return !reducedMotion && !limitedCpu && !limitedMemory;
};

export const PlanetTerrain = ({ planet }: PlanetTerrainProps) => {
  const profile = terrainProfiles[planet.id] ?? fallbackProfile;
  const detailed = useMemo(shouldUseDetailedTerrain, []);
  const mainRidge = useMemo(() => makeRidge(profile.seed, 45, profile.relief, 5), [profile]);
  const horizon = useMemo(() => makeHorizon(profile.seed, 45, profile.relief, 5), [profile]);
  const farRidge = useMemo(() => makeRidge(profile.seed + 23, 51, profile.relief * 0.55, 7), [profile]);
  const particles = useMemo(() => makeFeatures({ ...profile, seed: profile.seed + 61 }, detailed ? 9 : 0), [detailed, profile]);
  const id = `terrain-${planet.id}`;

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.7 }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 bottom-[35%] h-[45%]"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${profile.haze}55 0%, ${profile.sky}1f 48%, transparent 74%)`,
          filter: detailed ? 'blur(10px)' : undefined,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-[37%] h-24 opacity-60"
        style={{ background: `linear-gradient(180deg, transparent, ${profile.horizon}2f 62%, ${profile.haze}16)` }}
      />

      <svg
        className="absolute bottom-0 left-0 h-[86%] w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={profile.high} />
            <stop offset="24%" stopColor={profile.mid} />
            <stop offset="68%" stopColor={profile.low} />
            <stop offset="100%" stopColor={profile.shadow} />
          </linearGradient>
          <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={profile.shadow} stopOpacity="0.72" />
            <stop offset="42%" stopColor={profile.accent} stopOpacity="0.2" />
            <stop offset="70%" stopColor={profile.high} stopOpacity="0.08" />
            <stop offset="100%" stopColor={profile.shadow} stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id={`${id}-vignette`} cx="50%" cy="44%" r="68%">
            <stop offset="0%" stopColor={profile.accent} stopOpacity="0.09" />
            <stop offset="62%" stopColor={profile.shadow} stopOpacity="0.08" />
            <stop offset="100%" stopColor={profile.shadow} stopOpacity="0.58" />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <path d={mainRidge} />
          </clipPath>
          {detailed && (
            <filter id={`${id}-texture`} x="-5%" y="-5%" width="110%" height="110%" filterRes="360 220" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency={profile.noise} numOctaves="3" seed={profile.seed} result="grain" />
              <feColorMatrix in="grain" type="saturate" values="0" result="mono" />
              <feComponentTransfer in="mono" result="soft-grain">
                <feFuncA type="linear" slope="0.32" />
              </feComponentTransfer>
              <feBlend in="SourceGraphic" in2="soft-grain" mode="soft-light" />
            </filter>
          )}
        </defs>

        <path d={farRidge} fill={profile.shadow} opacity="0.52" />
        <path d={mainRidge} fill={`url(#${id}-ground)`} />
        <rect
          x="-2"
          y="38"
          width="104"
          height="64"
          clipPath={`url(#${id}-clip)`}
          fill={`url(#${id}-light)`}
          filter={detailed ? `url(#${id}-texture)` : undefined}
          opacity="0.92"
        />
        <g clipPath={`url(#${id}-clip)`}>
          <DetailLayer planetId={planet.id} profile={profile} />
        </g>
        <rect x="0" y="38" width="100" height="62" fill={`url(#${id}-vignette)`} clipPath={`url(#${id}-clip)`} />
        <path d={horizon} fill="none" stroke={profile.horizon} strokeWidth="0.32" opacity="0.58" />
      </svg>

      {particles.map((particle, index) => (
        <span
          key={`particle-${index}`}
          className="planet-dust absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${24 + particle.tone * 52}%`,
            width: `${0.8 + particle.size * 0.34}px`,
            height: `${0.8 + particle.size * 0.34}px`,
            backgroundColor: profile.horizon,
            opacity: 0.15 + particle.tone * 0.2,
            animationDelay: `${-index * 0.73}s`,
            animationDuration: `${6 + particle.stretch * 5}s`,
          }}
        />
      ))}
    </motion.div>
  );
};
