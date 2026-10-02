import type { ProjectId } from './projects';
import type { PlanetThemeId } from './planetThemes';

export type PlanetSurface = 'cratered' | 'banded' | 'earthlike' | 'venusAtmo';

export interface PlanetRingSystem {
  innerRadiusMultiplier: number;
  outerRadiusMultiplier: number;
  colorA: string;
  colorB: string;
  opacity: number;
}

export interface PlanetData {
  id: PlanetThemeId;
  name: string;
  displayName: string;
  color: string;
  surface: PlanetSurface;
  size: number;
  orbitRadius: number;
  orbitalPeriodDays: number;
  orbitalEccentricity: number;
  orbitInclinationDeg: number;
  rotationPeriodHours: number;
  axialTiltDeg: number;
  orbitParentId?: PlanetThemeId;
  rings?: PlanetRingSystem;
  description: string;
  content: ContentSign[];
}

export interface ContentSign {
  id: string;
  title: string;
  content: string;
  type: 'sign' | 'tablet' | 'console' | 'crate';
  projectId?: ProjectId;
}

export const planets: PlanetData[] = [
  {
    id: 'sun',
    name: 'sun',
    displayName: 'The Sun',
    color: '#FDB813',
    surface: 'cratered',
    size: 2.5,
    orbitRadius: 0,
    orbitalPeriodDays: 0,
    orbitalEccentricity: 0,
    orbitInclinationDeg: 0,
    rotationPeriodHours: 609.12,
    axialTiltDeg: 7.25,
    description: 'Identity / Introduction',
    content: [
      {
        id: 'intro-1',
        title: 'Welcome, Pilot',
        content: "I'm Jake Sass, a B.S. / M.S. computer science student focused on artificial intelligence at UW-Whitewater, an undergraduate AI alignment researcher, and a developer based in Janesville, Wisconsin. I build full-stack products, machine-learning tools, and automation.",
        type: 'console',
      },
      {
        id: 'intro-2',
        title: 'Mission Brief',
        content: 'Visit each planet to explore my technical toolkit, engineering approach, flagship applications, experiments, and ways to connect. Choose any world to begin.',
        type: 'tablet',
      },
    ],
  },
  {
    id: 'mercury',
    name: 'mercury',
    displayName: 'Mercury',
    color: '#8C7853',
    surface: 'cratered',
    size: 0.4,
    orbitRadius: 8,
    orbitalPeriodDays: 88,
    orbitalEccentricity: 0.2056,
    orbitInclinationDeg: 7.005,
    rotationPeriodHours: 1407.6,
    axialTiltDeg: 2,
    description: 'Education',
    content: [
      {
        id: 'edu-1',
        title: 'UW-Whitewater',
        content: 'University of Wisconsin-Whitewater | B.S. / M.S. in Computer Science - Artificial Intelligence Emphasis | Expected May 2028 | GPA: 3.8',
        type: 'sign',
      },
      {
        id: 'edu-2',
        title: "Dean's List",
        content: "Named to the Dean's List for six semesters while pairing coursework with freelance work, an IT internship, and independently developed software products.",
        type: 'tablet',
      },
      {
        id: 'edu-3',
        title: 'Relevant Coursework',
        content: 'Machine Learning (PyTorch/TensorFlow classifiers) • Software Engineering • Advanced Databases • Data Science • Cloud Computing • Linear Algebra',
        type: 'crate',
      },
    ],
  },
  {
    id: 'venus',
    name: 'venus',
    displayName: 'Venus',
    color: '#E6C68A',
    surface: 'venusAtmo',
    size: 0.9,
    orbitRadius: 12,
    orbitalPeriodDays: 225,
    orbitalEccentricity: 0.0068,
    orbitInclinationDeg: 3.394,
    rotationPeriodHours: -5832,
    axialTiltDeg: 177.36,
    description: 'Skills',
    content: [
      {
        id: 'skills-1',
        title: 'Languages',
        content: 'Python • Java • C • C# • TypeScript • JavaScript • SQL • R • PowerShell • HTML/CSS',
        type: 'console',
      },
      {
        id: 'skills-2',
        title: 'Frameworks & ML',
        content: 'React • React Native • Node.js • .NET • Vite • Tailwind CSS • Streamlit • Polars • pandas • NumPy • scikit-learn • LightGBM • PyTorch • TensorFlow',
        type: 'tablet',
      },
      {
        id: 'skills-3',
        title: 'AI & LLM',
        content: 'Anthropic/Claude API • MCP • Vapi • n8n • LLM agent workflows',
        type: 'sign',
      },
      {
        id: 'skills-4',
        title: 'Data & Tools',
        content: 'PostgreSQL • Supabase • Firebase • REST APIs • Git/GitHub • Docker • Vercel • Linux • Jupyter • pytest • Twilio • Figma • Postman • Active Directory',
        type: 'crate',
      },
    ],
  },
  {
    id: 'earth',
    name: 'earth',
    displayName: 'Earth',
    color: '#4B7BE5',
    surface: 'earthlike',
    size: 1,
    orbitRadius: 16,
    orbitalPeriodDays: 365.25,
    orbitalEccentricity: 0.0167,
    orbitInclinationDeg: 0,
    rotationPeriodHours: 23.9,
    axialTiltDeg: 23.4,
    description: 'Experience',
    content: [
      {
        id: 'research-1',
        title: 'AI Alignment Research',
        content: 'Undergraduate Researcher | University of Wisconsin-Whitewater | September 2026-Present\nAdvised by Dr. Hairi. Researching personalized preference optimization (DPO) for AI alignment, modeling varied individual driver preferences in autonomous-driving scenarios. Presenting the Direct Preference Optimization paper (Rafailov et al.) and RLHF background in weekly meetings, and designing a simulated preference-data approach.',
        type: 'console',
      },
      {
        id: 'exp-1',
        title: 'Rock County Information Technology',
        content: 'IT Deskside Support Intern | July 2026-Present\nSupport 500+ county users across 28 departments through Active Directory account and permission management and BitLocker recovery; helped image and deploy 100+ workstations. Built a PowerShell script that copies required user directories to cloud storage in about 30 seconds, replacing manual folder-by-folder transfers.',
        type: 'console',
      },
      {
        id: 'exp-2',
        title: 'Sass Web Design',
        content: 'Freelance Web Developer | April 2024-Present\nGenerated $5K+ across five clients, with two production websites and five projects in active development. Build full-stack React/Tailwind applications with databases and custom admin panels, owning design through deployment and client communication. Built fitness assessment and contact forms generating 20+ submissions in month one for mycorestrong.com.',
        type: 'tablet',
      },
      {
        id: 'exp-3',
        title: 'Summit Moving & Junk Removal LLC',
        content: 'Co-Founder & Software Engineer | June 2025-July 2026\nCo-founded a moving and junk-removal company generating $100K+ in gross revenue; built software to coordinate 200+ jobs across Wisconsin. Developed a React and Supabase/PostgreSQL logistics platform for a five-person team and an AI-assisted call and lead pipeline.',
        type: 'sign',
      },
    ],
  },
  {
    id: 'moon',
    name: 'moon',
    displayName: 'The Moon',
    color: '#C4C4C4',
    surface: 'cratered',
    size: 0.27,
    orbitRadius: 2.2,
    orbitalPeriodDays: 27.322,
    orbitalEccentricity: 0.0549,
    orbitInclinationDeg: 5.145,
    rotationPeriodHours: 655.728,
    axialTiltDeg: 6.68,
    orbitParentId: 'earth',
    description: 'Engineering Principles',
    content: [
      {
        id: 'ref-1',
        title: 'Security Is Architecture',
        content: 'Authorization belongs at the data boundary. My full-stack projects use server-only secrets, restricted APIs, secure session patterns, and database policies instead of trusting the browser.',
        type: 'tablet',
      },
      {
        id: 'ref-2',
        title: 'Evidence Over Assumptions',
        content: 'Tests, validation, provenance, and measurable behavior guide decisions. When reliable information is unavailable, I prefer an explicit unknown over fabricated precision.',
        type: 'sign',
      },
      {
        id: 'ref-3',
        title: 'Clarity Scales',
        content: 'Clear names, focused modules, useful documentation, and understandable interfaces make software easier to operate, improve, and hand to the next person.',
        type: 'console',
      },
    ],
  },
  {
    id: 'mars',
    name: 'mars',
    displayName: 'Mars',
    color: '#E27B58',
    surface: 'cratered',
    size: 0.53,
    orbitRadius: 22,
    orbitalPeriodDays: 687,
    orbitalEccentricity: 0.0934,
    orbitInclinationDeg: 1.85,
    rotationPeriodHours: 24.6,
    axialTiltDeg: 25.2,
    description: 'About Me',
    content: [
      {
        id: 'about-1',
        title: 'Builder at Heart',
        content: 'I enjoy taking an everyday need and turning it into a focused tool: a better way to study, understand a fantasy league, share a calendar, browse a campus marketplace, or explore a portfolio.',
        type: 'sign',
      },
      {
        id: 'about-2',
        title: 'What I Value',
        content: 'Useful software should feel intentional. I care about clear workflows, thoughtful visual details, honest technical decisions, strong security boundaries, and products people can understand.',
        type: 'console',
      },
      {
        id: 'about-3',
        title: 'Favorite Territories',
        content: 'AI alignment • Personalized preference optimization • Interactive experiences • Sports analytics • Learning tools • Community products • Data-informed decisions • Space-inspired design',
        type: 'crate',
      },
    ],
  },
  {
    id: 'jupiter',
    name: 'jupiter',
    displayName: 'Jupiter',
    color: '#D4A574',
    surface: 'banded',
    size: 2,
    orbitRadius: 30,
    orbitalPeriodDays: 4333,
    orbitalEccentricity: 0.0489,
    orbitInclinationDeg: 1.303,
    rotationPeriodHours: 9.9,
    axialTiltDeg: 3.13,
    rings: {
      innerRadiusMultiplier: 1.18,
      outerRadiusMultiplier: 1.48,
      colorA: '#4f4638',
      colorB: '#8c7657',
      opacity: 0.16,
    },
    description: 'Summit Moving',
    content: [
      {
        id: 'summit-1',
        title: 'Summit Moving & Junk Removal LLC',
        content: 'Co-founded Summit Moving & Junk Removal and helped grow the operation to $100K+ in gross revenue while coordinating 200+ jobs across Wisconsin.',
        type: 'console',
      },
      {
        id: 'summit-2',
        title: 'Operations Platform',
        content: 'Built a React and Supabase/PostgreSQL scheduling and logistics platform used by a five-person team for job assignments, pricing, equipment tracking, booking, quoting, and automated email workflows.',
        type: 'tablet',
      },
      {
        id: 'summit-3',
        title: 'Lead Automation',
        content: 'Developed an AI-assisted call and lead pipeline with n8n, Twilio, Vapi, and the Anthropic API for call transcription, SMS follow-ups, and centralized lead tracking, plus a MapTiler route planner.',
        type: 'sign',
      },
    ],
  },
  {
    id: 'saturn',
    name: 'saturn',
    displayName: 'Saturn',
    color: '#E8D4A8',
    surface: 'banded',
    size: 1.7,
    orbitRadius: 38,
    orbitalPeriodDays: 10756,
    orbitalEccentricity: 0.0565,
    orbitInclinationDeg: 2.489,
    rotationPeriodHours: 10.7,
    axialTiltDeg: 26.73,
    rings: {
      innerRadiusMultiplier: 1.32,
      outerRadiusMultiplier: 2.34,
      colorA: '#B79B6B',
      colorB: '#E8D4A8',
      opacity: 0.92,
    },
    description: 'Flagship Projects',
    content: [
      {
        id: 'proj-1',
        title: 'Fantasy Football Platform',
        content: 'A Python decision system built on 740K+ historical records, with leakage-safe ML, roughly 50 features, five-season walk-forward validation, up to 20K matchup simulations, 3K season paths, PuLP/CBC lineup optimization, and 1,265 pytest tests across 85 modules.',
        type: 'console',
        projectId: 'fantasy-football',
      },
      {
        id: 'proj-2',
        title: 'QuizClone',
        content: 'A React and TypeScript study platform with flashcards, adaptive Leitner review, configurable tests, progress history, set sharing, portable backups, and Supabase Row Level Security.',
        type: 'tablet',
        projectId: 'quizclone',
      },
      {
        id: 'proj-3',
        title: 'Campus Marketplace',
        content: 'A full-stack marketplace for the UWW campus community with verified accounts, listings and image uploads, search and filters, favorites, buyer-seller messaging, and administration tools.',
        type: 'sign',
        projectId: 'campus-marketplace',
      },
    ],
  },
  {
    id: 'uranus',
    name: 'uranus',
    displayName: 'Uranus',
    color: '#7FDBDA',
    surface: 'banded',
    size: 1.3,
    orbitRadius: 46,
    orbitalPeriodDays: 30687,
    orbitalEccentricity: 0.0457,
    orbitInclinationDeg: 0.773,
    rotationPeriodHours: -17.2,
    axialTiltDeg: 97.77,
    rings: {
      innerRadiusMultiplier: 1.38,
      outerRadiusMultiplier: 1.92,
      colorA: '#4f7778',
      colorB: '#92c9c8',
      opacity: 0.34,
    },
    description: 'Experiments & Tools',
    content: [
      {
        id: 'side-1',
        title: 'Mission Portfolio',
        content: 'This interactive React and Three.js portfolio replaces a conventional scrolling page with an orbiting solar system, animated travel, explorable planet surfaces, and a sci-fi desktop interface.',
        type: 'crate',
        projectId: 'mission-portfolio',
      },
      {
        id: 'side-2',
        title: "What's Jake Doing?",
        content: 'A cosmic availability and calendar app with live free/busy status, day/week/month views, recurring events, an ICS feed, and a protected admin workflow backed by Supabase and Vercel Functions.',
        type: 'tablet',
        projectId: 'whats-jake-doing',
      },
      {
        id: 'side-3',
        title: 'Arena Tracker',
        content: 'A League of Legends Arena companion that scans supported queues, tracks champion wins locally, and protects the Riot API key behind a validated, rate-limited serverless endpoint.',
        type: 'console',
        projectId: 'arena-tracker',
      },
    ],
  },
  {
    id: 'neptune',
    name: 'neptune',
    displayName: 'Neptune',
    color: '#4B70DD',
    surface: 'banded',
    size: 1.2,
    orbitRadius: 54,
    orbitalPeriodDays: 60190,
    orbitalEccentricity: 0.0113,
    orbitInclinationDeg: 1.77,
    rotationPeriodHours: 16.1,
    axialTiltDeg: 28.32,
    rings: {
      innerRadiusMultiplier: 1.4,
      outerRadiusMultiplier: 1.78,
      colorA: '#26395f',
      colorB: '#5875a6',
      opacity: 0.22,
    },
    description: 'Contact / Hire Me',
    content: [
      {
        id: 'contact-1',
        title: 'Get In Touch',
        content: "Have a practical problem, product idea, or interesting technical challenge? I'm always glad to hear the context, the people it should help, and what a successful result would look like.",
        type: 'console',
      },
      {
        id: 'contact-2',
        title: 'Contact & Profiles',
        content: 'Janesville, WI\nEmail: jacobsass.dev@gmail.com\nPhone: 608-289-8826\nGitHub: github.com/Jqkeyyy\nLinkedIn: linkedin.com/in/jacob-sass\nPortfolio: www.jacobsass.dev\nWeb: sasswebdesign.dev',
        type: 'tablet',
      },
      {
        id: 'contact-3',
        title: 'Live Projects',
        content: 'Campus Marketplace: campus-marketplace-beta.vercel.app\nArena Tracker: arena-tracker-plum.vercel.app\nCalendar: whats-jake-doing.vercel.app',
        type: 'sign',
      },
    ],
  },
];

export const getPlanetById = (id: string): PlanetData | undefined => {
  return planets.find((p) => p.id === id);
};
