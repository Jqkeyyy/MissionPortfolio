export const CONTACT_ACTION_KINDS = [
  'email',
  'github',
  'linkedin',
  'website',
  'resume',
  'live-project',
] as const;

export type ContactActionKind = (typeof CONTACT_ACTION_KINDS)[number];

export type ContactActionGroup = 'contact' | 'live-projects';

export interface ContactAction {
  id: string;
  label: string;
  accessibleLabel: string;
  href: string;
  kind: ContactActionKind;
  group: ContactActionGroup;
  external: boolean;
  download?: string;
}

export const contactActions = [
  {
    id: 'email',
    label: 'Email Jake',
    accessibleLabel: 'Email Jake Sass',
    href: 'mailto:jacobwork1129@gmail.com?subject=Portfolio%20inquiry',
    kind: 'email',
    group: 'contact',
    external: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    accessibleLabel: 'View Jake Sass on GitHub',
    href: 'https://github.com/Jqkeyyy',
    kind: 'github',
    group: 'contact',
    external: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    accessibleLabel: 'View Jake Sass on LinkedIn',
    href: 'https://www.linkedin.com/in/jacob-sass',
    kind: 'linkedin',
    group: 'contact',
    external: true,
  },
  {
    id: 'sass-web-design',
    label: 'Sass Web Design',
    accessibleLabel: 'Visit Sass Web Design',
    href: 'https://sasswebdesign.dev',
    kind: 'website',
    group: 'contact',
    external: true,
  },
  {
    id: 'resume',
    label: 'Download resume',
    accessibleLabel: 'Download Jacob Sass resume as a PDF',
    href: '/Jacob-Sass-Resume.pdf',
    kind: 'resume',
    group: 'contact',
    external: false,
    download: 'Jacob-Sass-Resume.pdf',
  },
  {
    id: 'campus-marketplace',
    label: 'Campus Marketplace',
    accessibleLabel: 'Open the live Campus Marketplace project',
    href: 'https://campus-marketplace-beta.vercel.app',
    kind: 'live-project',
    group: 'live-projects',
    external: true,
  },
  {
    id: 'whats-jake-doing',
    label: "What's Jake Doing?",
    accessibleLabel: "Open the live What's Jake Doing? project",
    href: 'https://whats-jake-doing.vercel.app',
    kind: 'live-project',
    group: 'live-projects',
    external: true,
  },
  {
    id: 'arena-tracker',
    label: 'Arena Tracker',
    accessibleLabel: 'Open the live Arena Tracker project',
    href: 'https://arena-tracker-plum.vercel.app',
    kind: 'live-project',
    group: 'live-projects',
    external: true,
  },
] as const satisfies readonly ContactAction[];

export const primaryContactActions = contactActions.filter(
  (action) => action.group === 'contact',
);

export const liveProjectActions = contactActions.filter(
  (action) => action.group === 'live-projects',
);
