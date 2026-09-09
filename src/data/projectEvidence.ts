import type { ProjectId } from './projects';
import type { ProjectMedia } from '@/types/portfolio';

export interface ArchitectureNode {
  label: string;
  detail: string;
  role: 'interface' | 'service' | 'data' | 'external';
}

export interface ProjectEvidence {
  architectureSummary: string;
  architecture: readonly ArchitectureNode[];
  media: readonly ProjectMedia[];
}

export const projectEvidence = {
  'fantasy-football': {
    architectureSummary: 'A reproducible local analytics pipeline turns historical football data into calibrated, league-aware decisions.',
    architecture: [
      { label: 'nflverse + Sleeper', detail: 'Historical, roster, scoring, and availability inputs', role: 'external' },
      { label: 'Polars pipeline', detail: 'Identity resolution, point-in-time features, and Parquet artifacts', role: 'service' },
      { label: 'ML evaluation', detail: 'Walk-forward LightGBM and probability calibration', role: 'data' },
      { label: 'Decision workspace', detail: 'Streamlit, CLI, and static HTML recommendations', role: 'interface' },
    ],
    media: [],
  },
  quizclone: {
    architectureSummary: 'Shared study content flows through database-enforced ownership into several adaptive learning modes.',
    architecture: [
      { label: 'React client', detail: 'Authoring, flashcards, Learn, Test, and progress views', role: 'interface' },
      { label: 'Supabase Auth', detail: 'Session management and existing-account access', role: 'service' },
      { label: 'PostgreSQL + RLS', detail: 'Owned and shared sets with row-level authorization', role: 'data' },
      { label: 'Portable backups', detail: 'Versioned, validated export and restore workflow', role: 'external' },
    ],
    media: [],
  },
  'campus-marketplace': {
    architectureSummary: 'A separated web, API, and data stack supports trusted student accounts and the full marketplace lifecycle.',
    architecture: [
      { label: 'React storefront', detail: 'Discovery, listings, favorites, messaging, and moderation UI', role: 'interface' },
      { label: 'Express REST API', detail: 'Validation, authorization, sessions, and business workflows', role: 'service' },
      { label: 'PostgreSQL', detail: 'Users, listings, conversations, favorites, and audit state', role: 'data' },
      { label: 'Cloudinary + SendGrid', detail: 'Listing media and verified-email delivery', role: 'external' },
    ],
    media: [
      {
        src: '/project-media/campus-marketplace.webp',
        alt: 'Campus Marketplace application landing page.',
        caption: 'The deployed student marketplace interface.',
        width: 1440,
        height: 900,
      },
    ],
  },
  'mission-portfolio': {
    architectureSummary: 'Typed portfolio data feeds a fast recruiter path and an opt-in immersive experience through shared navigation state.',
    architecture: [
      { label: 'Route + content layer', detail: 'Shareable pages, typed projects, contact actions, and metadata', role: 'interface' },
      { label: 'Zustand mission state', detail: 'Cancelable travel, dialogs, progress, sound, and tutorial coordination', role: 'service' },
      { label: 'Lazy experience layers', detail: 'Three.js map, travel, surfaces, HAB desktop, and recruiter view', role: 'data' },
      { label: 'Quality + observability', detail: 'Vitest, Playwright, recovery boundaries, and private aggregate events', role: 'external' },
    ],
    media: [
      {
        src: '/project-media/mission-portfolio.webp',
        alt: 'Mission Portfolio route selection screen with immersive and recruiter-friendly options.',
        caption: 'The capability-safe entry route keeps WebGL opt-in.',
        width: 1440,
        height: 900,
      },
    ],
  },
  'whats-jake-doing': {
    architectureSummary: 'A public calendar reads protected event data while server-only functions own administrative writes and feed generation.',
    architecture: [
      { label: 'React calendar', detail: 'Public day, week, month, and availability views', role: 'interface' },
      { label: 'Vercel Functions', detail: 'Authenticated writes and calendar feed responses', role: 'service' },
      { label: 'Supabase PostgreSQL', detail: 'Events, overrides, sessions, and row-level policies', role: 'data' },
      { label: 'ICS subscribers', detail: 'Standards-based calendar subscription output', role: 'external' },
    ],
    media: [
      {
        src: '/project-media/whats-jake-doing.webp',
        alt: "What's Jake Doing public calendar interface.",
        caption: 'The live public availability and calendar experience.',
        width: 1440,
        height: 900,
      },
    ],
  },
  'arena-tracker': {
    architectureSummary: 'A focused browser client uses a guarded serverless boundary to convert Riot match data into local progress.',
    architecture: [
      { label: 'React tracker', detail: 'Player lookup, champion grid, scans, and manual wins', role: 'interface' },
      { label: 'Vercel API proxy', detail: 'Region validation, rate limiting, and credential isolation', role: 'service' },
      { label: 'Local persistence', detail: 'Database-free scan results and manual progress', role: 'data' },
      { label: 'Riot + Data Dragon', detail: 'Match history and current champion metadata', role: 'external' },
    ],
    media: [
      {
        src: '/project-media/arena-tracker.webp',
        alt: 'Arena Tracker champion progress interface.',
        caption: 'The deployed League of Legends Arena companion.',
        width: 1440,
        height: 900,
      },
    ],
  },
} as const satisfies Record<ProjectId, ProjectEvidence>;

export const getProjectEvidence = (projectId: ProjectId): ProjectEvidence => projectEvidence[projectId];
