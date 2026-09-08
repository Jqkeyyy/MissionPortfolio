import type { PortfolioProject } from '@/types/portfolio';

const projectCatalog = [
  {
    id: 'fantasy-football',
    name: 'Fantasy Football Decision-Support Platform',
    oneLineSummary: 'A league-aware analytics system for draft, lineup, waiver, trade, and rest-of-season decisions.',
    status: 'in-development',
    technologies: ['Python', 'Streamlit', 'Polars', 'Parquet', 'LightGBM', 'scikit-learn', 'pytest'],
    links: [
      {
        kind: 'repository',
        label: 'View repository',
        href: 'https://github.com/Jqkeyyy/fantasyfootball',
        external: true,
      },
    ],
    metrics: [
      {
        value: '740K+',
        label: 'historical records',
        detail: 'Sleeper and nflverse records spanning the 2015-2025 seasons.',
        source: 'resume',
      },
      {
        value: '0.220 to 0.148',
        label: 'availability Brier score',
        detail: 'Five-season walk-forward validation result reported on the resume.',
        source: 'resume',
      },
      {
        value: '20K',
        label: 'matchup simulations',
        detail: 'Maximum Monte Carlo matchup simulations per analysis run.',
        source: 'resume',
      },
      {
        value: '1,265',
        label: 'pytest tests',
        detail: 'Test coverage reported across 85 modules.',
        source: 'resume',
      },
    ],
    caseStudy: {
      problem: 'Generic rankings do not account for a league\'s scoring, roster construction, keepers, waiver pool, or uncertainty.',
      approach: [
        'Normalize Sleeper, nflverse, and ranking-provider data into cached, provenance-aware tables.',
        'Guard model features against target-week leakage and evaluate with chronological walk-forward splits.',
        'Turn projections into league-aware VOR, tiers, lineup choices, and simulation-based decision support.',
      ],
      outcome: 'The project provides one offline-first workflow for draft preparation, weekly projections, roster decisions, and model evaluation.',
      engineeringHighlights: [
        'Point-in-time-safe feature registry and validation gates',
        'League-specific scoring and player identity resolution',
        'Reproducible CLI artifacts with Streamlit and static HTML views',
      ],
      limitations: [
        'A fresh clone must build or restore large local data artifacts before every dashboard view is available.',
        'The current configuration is a personal workflow rather than a hosted multi-user product.',
      ],
    },
  },
  {
    id: 'quizclone',
    name: 'QuizClone',
    oneLineSummary: 'A personal study platform with adaptive review, configurable tests, progress history, sharing, and portable backups.',
    status: 'in-development',
    technologies: ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS', 'Vitest'],
    links: [
      {
        kind: 'repository',
        label: 'View repository',
        href: 'https://github.com/Jqkeyyy/QuizClone',
        external: true,
      },
    ],
    metrics: [
      {
        value: '6',
        label: 'Leitner boxes',
        detail: 'Adaptive scheduling progresses cards through boxes 0 through 5.',
        source: 'repository',
      },
      {
        value: '4',
        label: 'test question formats',
        detail: 'Multiple-choice, written, true/false, and matching questions.',
        source: 'repository',
      },
    ],
    caseStudy: {
      problem: 'A useful study tool needs more than card flipping: learners need scheduling, varied recall practice, history, and control of their own data.',
      approach: [
        'Model adaptive review and per-card progress with a Leitner-based scheduler.',
        'Support flashcard, Learn, and configurable Test workflows over shared set data.',
        'Enforce ownership and sharing rules with PostgreSQL Row Level Security.',
      ],
      outcome: 'QuizClone combines set authoring, adaptive study, assessment history, controlled sharing, and versioned backup export in one application.',
      engineeringHighlights: [
        'Database-enforced authorization for owned and shared sets',
        'Versioned, validated set backup and restore format',
        'Keyboard-enabled flashcards and multiple assessment modes',
      ],
      limitations: [
        'The current sign-in flow is intended for existing Supabase accounts and does not offer public registration.',
        'Backup restoration recreates text and image references, but not image binaries or learning history.',
      ],
    },
  },
  {
    id: 'campus-marketplace',
    name: 'Campus Marketplace',
    oneLineSummary: 'A full-stack marketplace for verified UW-Whitewater students to list, discover, save, and discuss items.',
    status: 'live',
    technologies: ['React', 'Node.js', 'Express', 'PostgreSQL', 'JWT', 'Cloudinary', 'SendGrid'],
    links: [
      {
        kind: 'repository',
        label: 'View repository',
        href: 'https://github.com/Jqkeyyy/campus-marketplace',
        external: true,
      },
      {
        kind: 'live',
        label: 'Open live project',
        href: 'https://campus-marketplace-beta.vercel.app',
        external: true,
      },
    ],
    metrics: [
      {
        value: '5',
        label: 'images per listing',
        detail: 'The listing workflow validates and previews up to five uploaded images.',
        source: 'repository',
      },
      {
        value: '10',
        label: 'student-focused categories',
        detail: 'The initial catalog includes ten categories tailored to campus trading.',
        source: 'repository',
      },
    ],
    caseStudy: {
      problem: 'Campus communities need a focused trading space with trustworthy accounts and workflows designed for local student transactions.',
      approach: [
        'Separate the React interface, Express API, and PostgreSQL data layer behind REST endpoints.',
        'Verify UWW email ownership and keep sessions in secure HTTP-only cookies.',
        'Connect listings, multi-image uploads, favorites, conversations, filters, and administrator controls.',
      ],
      outcome: 'The deployed application supports the marketplace lifecycle from verified account access through listing discovery and buyer-seller communication.',
      engineeringHighlights: [
        'Short-lived hashed email-verification tokens',
        'Parameterized database access and server-side authorization checks',
        'Responsive listing, search, favorite, messaging, and moderation workflows',
      ],
      limitations: [
        'The repository documents additional production hardening for deployment-specific headers and same-site API hosting.',
      ],
    },
  },
  {
    id: 'mission-portfolio',
    name: 'Mission Portfolio',
    oneLineSummary: 'An interactive portfolio that turns professional content into a navigable solar-system and habitat experience.',
    status: 'live',
    technologies: ['React', 'TypeScript', 'Three.js', 'React Three Fiber', 'Zustand', 'Tailwind CSS', 'Vitest'],
    links: [
      {
        kind: 'repository',
        label: 'View repository',
        href: 'https://github.com/Jqkeyyy/MissionPortfolio',
        external: true,
      },
      {
        kind: 'live',
        label: 'Open live project',
        href: 'https://mission-portfolio-amber.vercel.app',
        external: true,
      },
    ],
    metrics: [
      {
        value: '10',
        label: 'portfolio destinations',
        detail: 'The Sun, Moon, and eight planets each map to a portfolio topic.',
        source: 'repository',
      },
      {
        value: '3',
        label: 'exploration states',
        detail: 'Space navigation, travel, and an interactive planet surface.',
        source: 'repository',
      },
    ],
    caseStudy: {
      problem: 'A conventional scrolling portfolio can communicate facts without demonstrating interaction design or creating a memorable sense of discovery.',
      approach: [
        'Map portfolio topics to celestial destinations in a React Three Fiber solar system.',
        'Connect selection, animated travel, surface exploration, and a sci-fi habitat desktop through shared navigation state.',
        'Keep the professional content in typed data while testing navigation and interaction components.',
      ],
      outcome: 'The site presents the same portfolio as a guided interactive mission with an explorable 3D entry point and detailed 2D interfaces.',
      engineeringHighlights: [
        'Three.js solar system with HTML mission controls',
        'State-driven space, travel, surface, HAB, and desktop transitions',
        'Reduced-motion-aware animation and component-level tests',
      ],
      limitations: [
        'The immersive Three.js route remains intentionally heavier than the recruiter-first entry path.',
        'A manual screen-reader journey remains a useful complement to the automated accessibility suite.',
      ],
    },
  },
  {
    id: 'whats-jake-doing',
    name: "What's Jake Doing?",
    oneLineSummary: 'A public availability and calendar app with recurring events, an ICS feed, and protected administration.',
    status: 'live',
    technologies: ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Vercel Functions', 'Vitest'],
    links: [
      {
        kind: 'repository',
        label: 'View repository',
        href: 'https://github.com/Jqkeyyy/whatsjakedoing',
        external: true,
      },
      {
        kind: 'live',
        label: 'Open live project',
        href: 'https://whats-jake-doing.vercel.app',
        external: true,
      },
    ],
    metrics: [
      {
        value: '3',
        label: 'calendar views',
        detail: 'Visitors can browse day, week, and month views.',
        source: 'repository',
      },
      {
        value: '2',
        label: 'recurrence patterns',
        detail: 'The application supports daily and weekly recurring events.',
        source: 'repository',
      },
    ],
    caseStudy: {
      problem: 'Sharing current availability needs a clear public view without exposing administrative credentials or direct browser write access.',
      approach: [
        'Derive public free/busy state from events and temporary overrides.',
        'Expose day, week, month, and ICS views over Supabase-backed calendar data.',
        'Route writes through authenticated Vercel Functions while limiting the browser to Row Level Security-protected reads.',
      ],
      outcome: 'The live site gives visitors a current calendar and subscription feed while keeping event management behind a protected admin workflow.',
      engineeringHighlights: [
        'HTTP-only administrator session with server-only database writes',
        'Public ICS subscription endpoint',
        'Responsive and reduced-motion-aware calendar views',
      ],
      limitations: [
        'Calendar titles, times, categories, locations, and the ICS feed are intentionally public and must not contain private appointments.',
      ],
    },
  },
  {
    id: 'arena-tracker',
    name: 'Arena Tracker',
    oneLineSummary: 'A League of Legends Arena companion that scans match history and tracks champion wins in the browser.',
    status: 'live',
    technologies: ['JavaScript', 'React', 'Vite', 'Vercel Functions', 'Riot API', 'Data Dragon'],
    links: [
      {
        kind: 'repository',
        label: 'View repository',
        href: 'https://github.com/Jqkeyyy/arena-tracker',
        external: true,
      },
      {
        kind: 'live',
        label: 'Open live project',
        href: 'https://arena-tracker-plum.vercel.app',
        external: true,
      },
    ],
    metrics: [
      {
        value: '2',
        label: 'supported Arena queues',
        detail: 'The server endpoint accepts Arena queues 1700 and 1710.',
        source: 'repository',
      },
    ],
    caseStudy: {
      problem: 'Arena players need a quick way to see which champions already have a win without manually reviewing their Riot match history.',
      approach: [
        'Load current champion metadata from Riot Data Dragon and scan only supported Arena queues.',
        'Proxy Riot requests through a validated and rate-limited serverless endpoint so the API key never reaches the browser.',
        'Store scan results and manual wins locally, avoiding a user database for this focused tool.',
      ],
      outcome: 'The deployed companion turns Riot match data into a simple champion-win checklist while keeping the visitor\'s progress browser-local.',
      engineeringHighlights: [
        'Strict server-side validation of actions, regions, queues, and identifiers',
        'Server-only Riot credential handling',
        'Database-free local persistence for scan results and manual changes',
      ],
      limitations: [
        'Riot development keys expire every 24 hours until a production key is approved.',
        'The included in-memory rate limiter should be replaced with shared storage at higher traffic levels.',
      ],
    },
  },
] as const satisfies readonly PortfolioProject[];

export const projects: readonly PortfolioProject[] = projectCatalog;

export type ProjectId = (typeof projectCatalog)[number]['id'];

export const getProjectById = (id: string): PortfolioProject | undefined => (
  projects.find((project) => project.id === id)
);
