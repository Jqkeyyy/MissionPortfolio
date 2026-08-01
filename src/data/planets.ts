export interface PlanetData {
  id: string;
  name: string;
  displayName: string;
  color: string;
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
}

export const planets: PlanetData[] = [
  {
    id: 'sun',
    name: 'sun',
    displayName: 'The Sun',
    color: '#FDB813',
    size: 2.5,
    orbitRadius: 0,
    orbitSpeed: 0,
    description: 'Identity / Introduction',
    content: [
      {
        id: 'intro-1',
        title: 'Welcome, Pilot',
        content: "I'm Jake Sass — a developer, creator, and explorer of digital frontiers. This solar system is my portfolio. Each planet holds a piece of my journey.",
        type: 'console',
      },
      {
        id: 'intro-2',
        title: 'Mission Brief',
        content: 'Navigate through the cosmos to discover my education, skills, experience, and projects. Click any planet to begin your journey.',
        type: 'tablet',
      },
    ],
  },
  {
    id: 'mercury',
    name: 'mercury',
    displayName: 'Mercury',
    color: '#8C7853',
    size: 0.4,
    orbitRadius: 8,
    orbitSpeed: 4.7,
    description: 'Education',
    content: [
      {
        id: 'edu-1',
        title: 'Academic Foundation',
        content: "Bachelor's Degree in Computer Science — Graduated with honors. Specialized in software engineering and human-computer interaction.",
        type: 'sign',
      },
      {
        id: 'edu-2',
        title: 'Certifications',
        content: 'AWS Certified Developer | Google Cloud Professional | React Advanced Patterns',
        type: 'tablet',
      },
      {
        id: 'edu-3',
        title: 'Continuous Learning',
        content: 'Always expanding my knowledge through courses, workshops, and hands-on experimentation with emerging technologies.',
        type: 'crate',
      },
    ],
  },
  {
    id: 'venus',
    name: 'venus',
    displayName: 'Venus',
    color: '#E6C68A',
    size: 0.9,
    orbitRadius: 12,
    orbitSpeed: 3.5,
    description: 'Skills',
    content: [
      {
        id: 'skills-1',
        title: 'Frontend Mastery',
        content: 'React • TypeScript • Next.js • Tailwind CSS • Three.js • Framer Motion',
        type: 'console',
      },
      {
        id: 'skills-2',
        title: 'Backend & Infrastructure',
        content: 'Node.js • Python • PostgreSQL • AWS • Docker • Kubernetes',
        type: 'tablet',
      },
      {
        id: 'skills-3',
        title: 'Design & UX',
        content: 'Figma • Adobe Creative Suite • User Research • Prototyping • Design Systems',
        type: 'sign',
      },
    ],
  },
  {
    id: 'earth',
    name: 'earth',
    displayName: 'Earth',
    color: '#4B7BE5',
    size: 1,
    orbitRadius: 16,
    orbitSpeed: 3,
    description: 'Experience / Job History',
    content: [
      {
        id: 'exp-1',
        title: 'Senior Developer',
        content: 'TechCorp Inc. (2022-Present) — Leading frontend architecture for enterprise applications. Managing team of 5 developers.',
        type: 'console',
      },
      {
        id: 'exp-2',
        title: 'Full Stack Developer',
        content: 'StartupXYZ (2020-2022) — Built MVP from ground up. Scaled platform to 100k+ users.',
        type: 'tablet',
      },
      {
        id: 'exp-3',
        title: 'Junior Developer',
        content: 'Digital Agency (2018-2020) — Client-facing projects. Learned agile methodology and collaborative development.',
        type: 'sign',
      },
    ],
  },
  {
    id: 'moon',
    name: 'moon',
    displayName: 'The Moon',
    color: '#C4C4C4',
    size: 0.27,
    orbitRadius: 18,
    orbitSpeed: 2.8,
    description: 'References / Testimonials',
    content: [
      {
        id: 'ref-1',
        title: 'John Smith, CTO',
        content: '"Jake is an exceptional developer with a keen eye for detail. His work on our platform was transformative."',
        type: 'tablet',
      },
      {
        id: 'ref-2',
        title: 'Sarah Johnson, PM',
        content: '"Working with Jake was a pleasure. He communicates clearly and delivers consistently high-quality code."',
        type: 'sign',
      },
    ],
  },
  {
    id: 'mars',
    name: 'mars',
    displayName: 'Mars',
    color: '#E27B58',
    size: 0.53,
    orbitRadius: 22,
    orbitSpeed: 2.4,
    description: 'About Me',
    content: [
      {
        id: 'about-1',
        title: 'The Human Behind the Code',
        content: "When I'm not coding, you'll find me hiking mountain trails, experimenting with photography, or diving deep into sci-fi novels.",
        type: 'sign',
      },
      {
        id: 'about-2',
        title: 'Philosophy',
        content: 'I believe in building technology that enhances human connection, not replaces it. Every line of code should serve a purpose.',
        type: 'console',
      },
      {
        id: 'about-3',
        title: 'Fun Facts',
        content: '☕ Coffee enthusiast • 🎮 Retro gaming collector • 🌍 Visited 15 countries • 🚀 Space exploration advocate',
        type: 'crate',
      },
    ],
  },
  {
    id: 'jupiter',
    name: 'jupiter',
    displayName: 'Jupiter',
    color: '#D4A574',
    size: 2,
    orbitRadius: 30,
    orbitSpeed: 1.3,
    description: 'Summit Moving',
    content: [
      {
        id: 'summit-1',
        title: 'Summit Moving Co.',
        content: 'Founded and developed the complete digital infrastructure for a moving company. From booking system to customer management.',
        type: 'console',
      },
      {
        id: 'summit-2',
        title: 'Tech Stack',
        content: 'Next.js • Supabase • Stripe Integration • Real-time Tracking • Admin Dashboard',
        type: 'tablet',
      },
      {
        id: 'summit-3',
        title: 'Impact',
        content: '200% increase in online bookings. Streamlined operations saving 15 hours/week in admin tasks.',
        type: 'sign',
      },
    ],
  },
  {
    id: 'saturn',
    name: 'saturn',
    displayName: 'Saturn',
    color: '#E8D4A8',
    size: 1.7,
    orbitRadius: 38,
    orbitSpeed: 0.97,
    description: 'Major Projects',
    content: [
      {
        id: 'proj-1',
        title: 'E-Commerce Platform',
        content: 'Full-featured online store with inventory management, payment processing, and analytics dashboard.',
        type: 'console',
      },
      {
        id: 'proj-2',
        title: 'Healthcare App',
        content: 'Patient management system with HIPAA compliance. Appointment scheduling and telemedicine integration.',
        type: 'tablet',
      },
      {
        id: 'proj-3',
        title: 'Real Estate Portal',
        content: 'Property listing platform with advanced search, virtual tours, and agent CRM functionality.',
        type: 'sign',
      },
    ],
  },
  {
    id: 'uranus',
    name: 'uranus',
    displayName: 'Uranus',
    color: '#7FDBDA',
    size: 1.3,
    orbitRadius: 46,
    orbitSpeed: 0.68,
    description: 'Side Projects',
    content: [
      {
        id: 'side-1',
        title: 'Open Source CLI',
        content: 'Developer tool for scaffolding projects. 2k+ GitHub stars and active community.',
        type: 'crate',
      },
      {
        id: 'side-2',
        title: 'Generative Art',
        content: 'Algorithmic art experiments using p5.js and WebGL. NFT collection exploration.',
        type: 'tablet',
      },
    ],
  },
  {
    id: 'neptune',
    name: 'neptune',
    displayName: 'Neptune',
    color: '#4B70DD',
    size: 1.2,
    orbitRadius: 54,
    orbitSpeed: 0.54,
    description: 'Contact / Hire Me',
    content: [
      {
        id: 'contact-1',
        title: 'Get In Touch',
        content: 'Ready to collaborate? Reach out and let\'s build something amazing together.',
        type: 'console',
      },
      {
        id: 'contact-2',
        title: 'Connect',
        content: '📧 jake@example.com\n💼 linkedin.com/in/jakesass\n🐙 github.com/jakesass',
        type: 'tablet',
      },
      {
        id: 'contact-3',
        title: 'Availability',
        content: "Currently open to: Full-time positions • Contract work • Consulting • Interesting collaborations",
        type: 'sign',
      },
    ],
  },
];

export const getPlanetById = (id: string): PlanetData | undefined => {
  return planets.find((p) => p.id === id);
};
