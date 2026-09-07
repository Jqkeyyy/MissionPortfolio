export const PLANET_THEME_IDS = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
] as const;

export type PlanetThemeId = (typeof PLANET_THEME_IDS)[number];

export const HABITAT_FAMILY_IDS = [
  'solar-industrial',
  'terrestrial-research',
  'deep-space-station',
] as const;

export type HabitatFamilyId = (typeof HABITAT_FAMILY_IDS)[number];

export type ThemeColor = `#${string}`;

export type AmbientAnimation =
  | 'heat-shimmer'
  | 'dust-drift'
  | 'cloud-drift'
  | 'aurora-pulse'
  | 'starfield-drift';

export type TelemetryStatus = 'nominal' | 'advisory' | 'extreme';

export type TelemetryReadingId =
  | 'surface-temperature'
  | 'atmosphere'
  | 'hab-pressure'
  | 'oxygen-reserve'
  | 'comms-link';

export interface HabitatFamily {
  id: HabitatFamilyId;
  label: string;
  description: string;
  shellProfile: string;
  panelFinish: string;
  structuralCue: string;
}

export interface PlanetThemePalette {
  accent: ThemeColor;
  secondary: ThemeColor;
  interior: ThemeColor;
  panel: ThemeColor;
  text: ThemeColor;
}

export interface PlanetThemeLighting {
  temperatureKelvin: number;
  intensity: number;
}

export interface PlanetThemeWindow {
  treatment: 'radiation-shield' | 'clear-dome' | 'storm-glass' | 'deep-space-glass';
  atmosphericEffect: string;
  tint: ThemeColor;
  opacity: number;
}

export interface PlanetThemeWallpaper {
  gradient: string;
  pattern: 'solar-grid' | 'topographic' | 'research-grid' | 'orbit-lines' | 'signal-field';
}

export interface PlanetTelemetryReading {
  id: TelemetryReadingId;
  label: string;
  value: string | number;
  unit?: string;
  status: TelemetryStatus;
}

export interface PlanetTheme {
  id: PlanetThemeId;
  family: HabitatFamilyId;
  palette: PlanetThemePalette;
  lighting: PlanetThemeLighting;
  window: PlanetThemeWindow;
  wallpaper: PlanetThemeWallpaper;
  telemetry: readonly PlanetTelemetryReading[];
  props: readonly string[];
  decals: readonly string[];
  identityCue: string;
  ambient: {
    animation: AmbientAnimation;
    intensity: number;
  };
}

export const habitatFamilies = {
  'solar-industrial': {
    id: 'solar-industrial',
    label: 'Solar / Industrial',
    description: 'Heat-shielded mission modules with exposed service ribs and rugged work surfaces.',
    shellProfile: 'Angular pressure shell with compact equipment bays',
    panelFinish: 'Charcoal ceramic panels with worn metal edges',
    structuralCue: 'Heavy thermal shutters and visible conduit runs',
  },
  'terrestrial-research': {
    id: 'terrestrial-research',
    label: 'Terrestrial / Research',
    description: 'Bright modular laboratories designed for observation, analysis, and field work.',
    shellProfile: 'Rounded laboratory shell with open sight lines',
    panelFinish: 'Clean composite panels with labeled sample storage',
    structuralCue: 'Wide observation window and modular research rails',
  },
  'deep-space-station': {
    id: 'deep-space-station',
    label: 'Deep-space / Heavy Station',
    description: 'Long-duration stations with reinforced frames, layered insulation, and dense systems.',
    shellProfile: 'Reinforced station hull with deep equipment alcoves',
    panelFinish: 'Dark insulated panels with luminous edge markers',
    structuralCue: 'Thick viewport frame and overhead utility spine',
  },
} as const satisfies Record<HabitatFamilyId, HabitatFamily>;

const telemetry = (
  surfaceTemperatureC: number,
  atmosphere: string,
  habitatPressureKpa: number,
  oxygenReservePercent: number,
  commsLink: string,
  environmentStatus: TelemetryStatus = 'advisory',
): readonly PlanetTelemetryReading[] => [
  {
    id: 'surface-temperature',
    label: 'Surface temp',
    value: surfaceTemperatureC,
    unit: '°C',
    status: environmentStatus,
  },
  {
    id: 'atmosphere',
    label: 'Atmosphere',
    value: atmosphere,
    status: environmentStatus,
  },
  {
    id: 'hab-pressure',
    label: 'Hab pressure',
    value: habitatPressureKpa,
    unit: 'kPa',
    status: 'nominal',
  },
  {
    id: 'oxygen-reserve',
    label: 'O₂ reserve',
    value: oxygenReservePercent,
    unit: '%',
    status: 'nominal',
  },
  {
    id: 'comms-link',
    label: 'Comms link',
    value: commsLink,
    status: 'nominal',
  },
];

export const planetThemes = {
  sun: {
    id: 'sun',
    family: 'solar-industrial',
    palette: {
      accent: '#ffca55',
      secondary: '#ff7048',
      interior: '#24140d',
      panel: '#351b11',
      text: '#fff4d4',
    },
    lighting: { temperatureKelvin: 2700, intensity: 0.92 },
    window: {
      treatment: 'radiation-shield',
      atmosphericEffect: 'A segmented flare shield silhouettes the solar corona.',
      tint: '#ff8a45',
      opacity: 0.48,
    },
    wallpaper: {
      gradient: 'radial-gradient(circle at 72% 18%, #7d3218 0%, #26120c 42%, #09080b 100%)',
      pattern: 'solar-grid',
    },
    telemetry: telemetry(5500, 'Coronal plasma', 101.2, 98, 'Helios relay', 'extreme'),
    props: ['mission briefing console', 'solar observation filters'],
    decals: ['orientation compass', 'mission launch emblem'],
    identityCue: 'A backlit mission compass frames the central briefing console.',
    ambient: { animation: 'heat-shimmer', intensity: 0.34 },
  },
  mercury: {
    id: 'mercury',
    family: 'solar-industrial',
    palette: {
      accent: '#d6b58c',
      secondary: '#8c7853',
      interior: '#211d1a',
      panel: '#332b25',
      text: '#f7ead9',
    },
    lighting: { temperatureKelvin: 3300, intensity: 0.76 },
    window: {
      treatment: 'radiation-shield',
      atmosphericEffect: 'Hard sunlight cuts across a cratered horizon with no visible haze.',
      tint: '#d8bb91',
      opacity: 0.2,
    },
    wallpaper: {
      gradient: 'linear-gradient(145deg, #453a31 0%, #211d1a 48%, #0c0d10 100%)',
      pattern: 'topographic',
    },
    telemetry: telemetry(167, 'Trace exosphere', 101.1, 97, 'Campus uplink', 'extreme'),
    props: ['field notebook rack', 'coursework sample trays'],
    decals: ['UW-Whitewater research patch', 'six-term honors markers'],
    identityCue: 'Pinned research notes and six honors markers turn one wall into an education log.',
    ambient: { animation: 'heat-shimmer', intensity: 0.18 },
  },
  venus: {
    id: 'venus',
    family: 'terrestrial-research',
    palette: {
      accent: '#ffd27d',
      secondary: '#d36b98',
      interior: '#2b1d24',
      panel: '#422b35',
      text: '#fff4dd',
    },
    lighting: { temperatureKelvin: 3100, intensity: 0.84 },
    window: {
      treatment: 'storm-glass',
      atmosphericEffect: 'Dense amber cloud bands diffuse light across the observation glass.',
      tint: '#f0a65f',
      opacity: 0.38,
    },
    wallpaper: {
      gradient: 'linear-gradient(135deg, #6f3c45 0%, #30202a 50%, #111016 100%)',
      pattern: 'research-grid',
    },
    telemetry: telemetry(464, 'Dense CO₂', 101.3, 99, 'Skills matrix', 'extreme'),
    props: ['language sample cylinders', 'framework analysis rack'],
    decals: ['full-stack flow diagram', 'ML pipeline strip'],
    identityCue: 'Color-coded sample racks map languages, full-stack tools, and machine-learning systems.',
    ambient: { animation: 'cloud-drift', intensity: 0.22 },
  },
  earth: {
    id: 'earth',
    family: 'terrestrial-research',
    palette: {
      accent: '#62b0ff',
      secondary: '#4fda91',
      interior: '#111d28',
      panel: '#172b3a',
      text: '#eaf8ff',
    },
    lighting: { temperatureKelvin: 5000, intensity: 0.82 },
    window: {
      treatment: 'clear-dome',
      atmosphericEffect: 'A blue atmospheric limb and slow cloud layer fill the broad observation window.',
      tint: '#7cc8ff',
      opacity: 0.16,
    },
    wallpaper: {
      gradient: 'linear-gradient(150deg, #16465d 0%, #142631 48%, #091016 100%)',
      pattern: 'signal-field',
    },
    telemetry: telemetry(15, 'N₂ / O₂', 101.3, 100, 'County network', 'nominal'),
    props: ['support ticket console', 'deployment checklist board'],
    decals: ['500-user network map', 'workstation migration timeline'],
    identityCue: 'A live support board connects field deployments, client work, and operations experience.',
    ambient: { animation: 'cloud-drift', intensity: 0.14 },
  },
  moon: {
    id: 'moon',
    family: 'terrestrial-research',
    palette: {
      accent: '#dce5ef',
      secondary: '#8798ad',
      interior: '#181b20',
      panel: '#262b32',
      text: '#f5f8fb',
    },
    lighting: { temperatureKelvin: 4400, intensity: 0.66 },
    window: {
      treatment: 'clear-dome',
      atmosphericEffect: 'Sharp shadows cross pale regolith beneath an unfiltered star field.',
      tint: '#c8d0d8',
      opacity: 0.08,
    },
    wallpaper: {
      gradient: 'linear-gradient(160deg, #40464e 0%, #20242a 43%, #090b0f 100%)',
      pattern: 'research-grid',
    },
    telemetry: telemetry(-20, 'Vacuum', 101.2, 98, 'Principles beacon', 'extreme'),
    props: ['evidence review table', 'architecture checklist stand'],
    decals: ['security boundary diagram', 'clarity standards plaque'],
    identityCue: 'Three engraved checklists present security, evidence, and clarity as mission rules.',
    ambient: { animation: 'dust-drift', intensity: 0.08 },
  },
  mars: {
    id: 'mars',
    family: 'solar-industrial',
    palette: {
      accent: '#ff7955',
      secondary: '#a94b37',
      interior: '#2a1815',
      panel: '#3d211b',
      text: '#ffe9df',
    },
    lighting: { temperatureKelvin: 3000, intensity: 0.72 },
    window: {
      treatment: 'storm-glass',
      atmosphericEffect: 'Fine rust-colored dust moves low across a basalt plain.',
      tint: '#cf674a',
      opacity: 0.28,
    },
    wallpaper: {
      gradient: 'linear-gradient(145deg, #643225 0%, #2b1a17 47%, #0e0d10 100%)',
      pattern: 'topographic',
    },
    telemetry: telemetry(-63, 'Thin CO₂', 101, 96, 'Builder channel', 'advisory'),
    props: ['prototype sketch table', 'field tool pegboard'],
    decals: ['builder values stencil', 'favorite territories map'],
    identityCue: 'Prototype sketches surround a rugged workbench built for turning everyday needs into tools.',
    ambient: { animation: 'dust-drift', intensity: 0.24 },
  },
  jupiter: {
    id: 'jupiter',
    family: 'deep-space-station',
    palette: {
      accent: '#e8ad73',
      secondary: '#9b5c43',
      interior: '#241b19',
      panel: '#392821',
      text: '#fff0dd',
    },
    lighting: { temperatureKelvin: 3500, intensity: 0.74 },
    window: {
      treatment: 'storm-glass',
      atmosphericEffect: 'Layered cloud bands roll beyond reinforced glass as the Great Red Spot passes.',
      tint: '#c8875e',
      opacity: 0.32,
    },
    wallpaper: {
      gradient: 'linear-gradient(125deg, #664231 0%, #2b201d 52%, #0c0c10 100%)',
      pattern: 'orbit-lines',
    },
    telemetry: telemetry(-110, 'H₂ / He cloud deck', 101.4, 99, 'Operations mesh', 'extreme'),
    props: ['dispatch route table', 'equipment status rack'],
    decals: ['200-job route map', 'automation pipeline schematic'],
    identityCue: 'A dispatch wall traces more than 200 jobs through the operations and automation platform.',
    ambient: { animation: 'cloud-drift', intensity: 0.28 },
  },
  saturn: {
    id: 'saturn',
    family: 'deep-space-station',
    palette: {
      accent: '#f4d58d',
      secondary: '#9d80c8',
      interior: '#211e28',
      panel: '#34303e',
      text: '#fff7df',
    },
    lighting: { temperatureKelvin: 3900, intensity: 0.78 },
    window: {
      treatment: 'deep-space-glass',
      atmosphericEffect: 'The ring plane slices across the viewport in bright layers of ice and shadow.',
      tint: '#e2c58a',
      opacity: 0.2,
    },
    wallpaper: {
      gradient: 'radial-gradient(ellipse at 75% 25%, #63556d 0%, #292531 44%, #0c0b10 100%)',
      pattern: 'orbit-lines',
    },
    telemetry: telemetry(-140, 'H₂ / He cloud deck', 101.3, 98, 'Project archive', 'extreme'),
    props: ['case-study drafting table', 'project evidence terminals'],
    decals: ['Fantasy Football schematic', 'QuizClone and Marketplace plans'],
    identityCue: 'Layered project schematics echo Saturn’s rings around a central case-study table.',
    ambient: { animation: 'starfield-drift', intensity: 0.14 },
  },
  uranus: {
    id: 'uranus',
    family: 'deep-space-station',
    palette: {
      accent: '#80f2ef',
      secondary: '#5d9fdc',
      interior: '#102329',
      panel: '#17353c',
      text: '#e7ffff',
    },
    lighting: { temperatureKelvin: 5600, intensity: 0.7 },
    window: {
      treatment: 'deep-space-glass',
      atmosphericEffect: 'A cyan atmospheric disk turns slowly on its side beyond the station frame.',
      tint: '#70d8dc',
      opacity: 0.24,
    },
    wallpaper: {
      gradient: 'linear-gradient(155deg, #1b6570 0%, #153039 46%, #071014 100%)',
      pattern: 'signal-field',
    },
    telemetry: telemetry(-195, 'H₂ / He / CH₄', 101.2, 97, 'Prototype lab', 'extreme'),
    props: ['experimental app rack', 'prototype diagnostics bench'],
    decals: ['Mission Portfolio orbit map', 'calendar and arena telemetry cards'],
    identityCue: 'A tilted prototype rack showcases experimental tools at the same angle as the planet’s axis.',
    ambient: { animation: 'aurora-pulse', intensity: 0.18 },
  },
  neptune: {
    id: 'neptune',
    family: 'deep-space-station',
    palette: {
      accent: '#6f91ff',
      secondary: '#5ce1e6',
      interior: '#10182b',
      panel: '#172442',
      text: '#edf4ff',
    },
    lighting: { temperatureKelvin: 6200, intensity: 0.74 },
    window: {
      treatment: 'storm-glass',
      atmosphericEffect: 'Cobalt storms and thin methane clouds race past the outer-system relay.',
      tint: '#4d74e8',
      opacity: 0.34,
    },
    wallpaper: {
      gradient: 'radial-gradient(circle at 70% 15%, #274f9c 0%, #152342 46%, #080b16 100%)',
      pattern: 'signal-field',
    },
    telemetry: telemetry(-200, 'H₂ / He / CH₄', 101.4, 100, 'Contact relay', 'extreme'),
    props: ['long-range message terminal', 'profile beacon array'],
    decals: ['open channel emblem', 'live-project signal map'],
    identityCue: 'A bright long-range relay makes email, profiles, and live projects feel one action away.',
    ambient: { animation: 'aurora-pulse', intensity: 0.26 },
  },
} as const satisfies Record<PlanetThemeId, PlanetTheme>;

export const isPlanetThemeId = (id: string): id is PlanetThemeId =>
  PLANET_THEME_IDS.some((themeId) => themeId === id);

export const getPlanetTheme = (id: string): PlanetTheme | undefined =>
  isPlanetThemeId(id) ? planetThemes[id] : undefined;

export const getHabitatFamily = (id: HabitatFamilyId): HabitatFamily => habitatFamilies[id];

export const getTelemetryReading = (
  theme: PlanetTheme,
  id: TelemetryReadingId,
): PlanetTelemetryReading => {
  const reading = theme.telemetry.find((candidate) => candidate.id === id);

  if (!reading) {
    throw new Error(`Missing ${id} telemetry for ${theme.id}`);
  }

  return reading;
};

export const formatTelemetryReading = (reading: PlanetTelemetryReading): string =>
  reading.unit
    ? `${reading.value}${reading.unit === '°C' || reading.unit === '%' ? '' : ' '}${reading.unit}`
    : String(reading.value);
