import type { ProjectId } from './projects';
import type { PlanetThemeId } from './planetThemes';

export type PlanetSurface = 'cratered' | 'banded' | 'earthlike' | 'venusAtmo';

export interface PlanetData {
  id: PlanetThemeId;
  name: string;
  displayName: string;
  color: string;
  surface: PlanetSurface;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
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
    orbitSpeed: 0,
    description: 'Identity / Introduction',
    content: [
      {
        id: 'intro-1',
        title: 'Welcome, Pilot',
        content: "I'm Jake Sass, a computer science student, freelance developer, and IT professional who turns practical ideas into polished web products, data tools, and interactive experiences.",
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
    orbitSpeed: 4.7,
    description: 'Education',
    content: [
      {
        id: 'edu-1',
        title: 'UW-Whitewater',
        content: 'University of Wisconsin-Whitewater | B.S. in Computer Science | Expected May 2027 | GPA: 3.8',
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
        content: 'Machine Learning • Software Engineering • Advanced Databases • Data Science • Cloud Computing • Linear Algebra',
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
    orbitSpeed: 3.5,
    description: 'Skills',
    content: [
      {
        id: 'skills-1',
        title: 'Languages & UI',
        content: 'Python • Java • TypeScript • JavaScript • SQL • R • PowerShell • HTML/CSS • React • React Native • Tailwind CSS',
        type: 'console',
      },
      {
        id: 'skills-2',
        title: 'Data & Full Stack',
        content: 'Node.js • PostgreSQL • Supabase • Firebase • REST APIs • Streamlit • Polars • pandas • NumPy • Parquet • Docker',
        type: 'tablet',
      },
      {
        id: 'skills-3',
        title: 'ML & Automation',
        content: 'scikit-learn • LightGBM • PyTorch • TensorFlow • Jupyter • pytest • mypy • Ruff • n8n • Twilio • Vapi',
        type: 'sign',
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
    orbitSpeed: 3,
    description: 'Experience',
    content: [
      {
        id: 'exp-1',
        title: 'Rock County IT',
        content: 'IT Deskside Support Intern | July 2026-Present\nSupport 500+ county users through Active Directory, BitLocker recovery, workstation imaging, and deployment. Built a PowerShell migration tool that reduced user-directory transfers to about 30 seconds.',
        type: 'console',
      },
      {
        id: 'exp-2',
        title: 'Sass Web Design',
        content: 'Freelance Web Developer | April 2024-Present\nEarned $5K+ across five clients, delivering full-stack React/Tailwind applications, databases, custom admin panels, deployment, and client communication.',
        type: 'tablet',
      },
      {
        id: 'exp-3',
        title: 'Summit Moving',
        content: 'Co-Founder & Software Engineer | June 2025-July 2026\nCo-founded a moving and junk-removal company that generated $100K+ in gross revenue and coordinated more than 200 jobs across Wisconsin.',
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
    orbitRadius: 18,
    orbitSpeed: 2.8,
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
    orbitSpeed: 2.4,
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
        content: 'Interactive experiences • Sports analytics • Learning tools • Community products • Data-informed decisions • Space-inspired design',
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
    orbitSpeed: 1.3,
    description: 'Summit Moving',
    content: [
      {
        id: 'summit-1',
        title: 'Summit Moving',
        content: 'Co-founded Summit Moving & Junk Removal and helped grow the operation to $100K+ in gross revenue while coordinating more than 200 jobs across Wisconsin.',
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
    orbitSpeed: 0.97,
    description: 'Flagship Projects',
    content: [
      {
        id: 'proj-1',
        title: 'Fantasy Football Platform',
        content: 'A Python decision system built on 740K+ historical records, with league-aware projections, draft and waiver analysis, leakage-safe ML, up to 20K matchup simulations, and 1,265 pytest tests.',
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
    orbitSpeed: 0.68,
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
    orbitSpeed: 0.54,
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
        content: 'Email: jacobwork1129@gmail.com\nGitHub: github.com/Jqkeyyy\nLinkedIn: linkedin.com/in/jacob-sass\nWeb: sasswebdesign.dev',
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
