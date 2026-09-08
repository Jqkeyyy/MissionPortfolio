export const PROJECT_STATUSES = ['planned', 'in-development', 'live'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'Planned',
  'in-development': 'In development',
  live: 'Live',
};

export type ProjectLinkKind = 'repository' | 'live';

export interface ProjectLink {
  kind: ProjectLinkKind;
  label: string;
  href: string;
  external: boolean;
}

export interface ProjectMetric {
  value: string;
  label: string;
  detail?: string;
  source: 'resume' | 'repository';
}

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectMedia extends ProjectImage {
  caption: string;
}

export interface ProjectCaseStudy {
  problem: string;
  approach: readonly string[];
  outcome: string;
  engineeringHighlights: readonly string[];
  limitations?: readonly string[];
}

export interface PortfolioProject {
  id: string;
  name: string;
  oneLineSummary: string;
  status: ProjectStatus;
  technologies: readonly string[];
  links: readonly ProjectLink[];
  metrics: readonly ProjectMetric[];
  image?: ProjectImage;
  caseStudy: ProjectCaseStudy;
}
