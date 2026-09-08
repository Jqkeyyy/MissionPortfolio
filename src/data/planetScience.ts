import type { PlanetThemeId } from './planetThemes';

export interface PlanetScienceRecord {
  bodyId: PlanetThemeId;
  bodyType: 'star' | 'planet' | 'natural satellite';
  meanOrbitalSpeedKmS?: number;
  ringSummary?: string;
  scienceNote: string;
  sourceLabel: string;
  sourceUrl: `https://${string}`;
}

export const planetScience: PlanetScienceRecord[] = [
  {
    bodyId: 'sun',
    bodyType: 'star',
    scienceNote: 'The Sun contains about 99.8% of the mass in our solar system.',
    sourceLabel: 'NASA Sun Facts',
    sourceUrl: 'https://science.nasa.gov/sun/facts/',
  },
  {
    bodyId: 'mercury',
    bodyType: 'planet',
    meanOrbitalSpeedKmS: 47.4,
    scienceNote: 'Mercury is the smallest planet and the closest planet to the Sun.',
    sourceLabel: 'NASA Mercury Facts',
    sourceUrl: 'https://science.nasa.gov/mercury/facts/',
  },
  {
    bodyId: 'venus',
    bodyType: 'planet',
    meanOrbitalSpeedKmS: 35,
    scienceNote: 'Venus rotates backward compared with most planets.',
    sourceLabel: 'NASA Venus Facts',
    sourceUrl: 'https://science.nasa.gov/venus/venus-facts/',
  },
  {
    bodyId: 'earth',
    bodyType: 'planet',
    meanOrbitalSpeedKmS: 29.8,
    scienceNote: 'Earth is the only world currently known to support life.',
    sourceLabel: 'NASA Earth Facts',
    sourceUrl: 'https://science.nasa.gov/earth/facts/',
  },
  {
    bodyId: 'moon',
    bodyType: 'natural satellite',
    meanOrbitalSpeedKmS: 1.022,
    scienceNote: 'The Moon rotates once per orbit, keeping nearly the same face toward Earth.',
    sourceLabel: 'NASA Moon Facts',
    sourceUrl: 'https://science.nasa.gov/moon/facts/',
  },
  {
    bodyId: 'mars',
    bodyType: 'planet',
    meanOrbitalSpeedKmS: 24.1,
    scienceNote: 'Mars has seasons, polar ice caps, volcanoes, canyons, and weather.',
    sourceLabel: 'NASA Mars Facts',
    sourceUrl: 'https://science.nasa.gov/mars/facts/',
  },
  {
    bodyId: 'jupiter',
    bodyType: 'planet',
    meanOrbitalSpeedKmS: 13.1,
    ringSummary: 'A faint ring system made mostly of dust from small inner moons.',
    scienceNote: 'Jupiter is the largest planet and has the shortest planetary day.',
    sourceLabel: 'NASA Jupiter Facts',
    sourceUrl: 'https://science.nasa.gov/jupiter/jupiter-facts/',
  },
  {
    bodyId: 'saturn',
    bodyType: 'planet',
    meanOrbitalSpeedKmS: 9.7,
    ringSummary: 'Seven main ring groups made of billions of icy and rocky particles.',
    scienceNote: 'Saturn has the most extensive and visually prominent ring system.',
    sourceLabel: 'NASA Saturn Facts',
    sourceUrl: 'https://science.nasa.gov/saturn/facts/',
  },
  {
    bodyId: 'uranus',
    bodyType: 'planet',
    meanOrbitalSpeedKmS: 6.8,
    ringSummary: 'Thirteen known, narrow rings; most are dark and faint.',
    scienceNote: 'Uranus rotates on its side and in the retrograde direction.',
    sourceLabel: 'NASA Uranus Facts',
    sourceUrl: 'https://science.nasa.gov/uranus/facts/',
  },
  {
    bodyId: 'neptune',
    bodyType: 'planet',
    meanOrbitalSpeedKmS: 5.4,
    ringSummary: 'At least five main rings, including dusty arcs within the Adams ring.',
    scienceNote: 'Neptune is the most distant major planet and has supersonic winds.',
    sourceLabel: 'NASA Neptune Facts',
    sourceUrl: 'https://science.nasa.gov/neptune/neptune-facts/',
  },
];

export const getPlanetScience = (bodyId: PlanetThemeId) => (
  planetScience.find((record) => record.bodyId === bodyId)
);
