import { describe, expect, it } from 'vitest';
import { PROJECT_STATUSES } from '@/types/portfolio';
import { getProjectById, projects } from './projects';

const EXPECTED_PROJECT_IDS = [
  'fantasy-football',
  'quizclone',
  'campus-marketplace',
  'mission-portfolio',
  'whats-jake-doing',
  'arena-tracker',
];

const isSafeHttpsUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === '';
  } catch {
    return false;
  }
};

describe('projects data', () => {
  it('contains each expected project exactly once', () => {
    expect(projects.map((project) => project.id)).toEqual(EXPECTED_PROJECT_IDS);
    expect(new Set(projects.map((project) => project.id)).size).toBe(projects.length);
  });

  it('provides substantive copy and technology tags for every project', () => {
    for (const project of projects) {
      expect(project.name.trim().length).toBeGreaterThanOrEqual(3);
      expect(project.oneLineSummary.trim().length).toBeGreaterThanOrEqual(30);
      expect(project.caseStudy.problem.trim().length).toBeGreaterThanOrEqual(30);
      expect(project.caseStudy.outcome.trim().length).toBeGreaterThanOrEqual(30);
      expect(project.caseStudy.approach.length).toBeGreaterThanOrEqual(2);
      expect(project.caseStudy.engineeringHighlights.length).toBeGreaterThanOrEqual(2);
      expect(project.technologies.length).toBeGreaterThanOrEqual(3);

      for (const statement of [
        ...project.caseStudy.approach,
        ...project.caseStudy.engineeringHighlights,
        ...(project.caseStudy.limitations ?? []),
      ]) {
        expect(statement.trim().length).toBeGreaterThanOrEqual(12);
      }
    }
  });

  it('uses supported statuses and pairs live status with a live URL', () => {
    for (const project of projects) {
      expect(PROJECT_STATUSES).toContain(project.status);
      const liveLinks = project.links.filter((link) => link.kind === 'live');

      if (project.status === 'live') {
        expect(liveLinks).toHaveLength(1);
      } else {
        expect(liveLinks).toHaveLength(0);
      }
    }
  });

  it('gives every project a verified GitHub repository and safe link metadata', () => {
    for (const project of projects) {
      const repositoryLinks = project.links.filter((link) => link.kind === 'repository');
      expect(repositoryLinks).toHaveLength(1);

      for (const link of project.links) {
        expect(link.label.trim()).not.toBe('');
        expect(link.external).toBe(true);
        expect(isSafeHttpsUrl(link.href)).toBe(true);
      }

      const repositoryUrl = new URL(repositoryLinks[0].href);
      expect(repositoryUrl.hostname).toBe('github.com');
      expect(repositoryUrl.pathname.toLowerCase()).toMatch(/^\/jqkeyyy\/[a-z0-9-]+\/?$/);
    }
  });

  it('uses meaningful, unique metric labels and identifies each metric source', () => {
    for (const project of projects) {
      expect(project.metrics.length).toBeGreaterThan(0);
      expect(new Set(project.metrics.map((metric) => metric.label)).size).toBe(project.metrics.length);

      for (const metric of project.metrics) {
        expect(metric.value.trim()).not.toBe('');
        expect(metric.label.trim().length).toBeGreaterThanOrEqual(3);
        expect(['resume', 'repository']).toContain(metric.source);
      }
    }
  });

  it('requires complete alt text and dimensions whenever an image is provided', () => {
    for (const project of projects) {
      if (!project.image) continue;

      expect(project.image.src).toMatch(/^\/(?!\/).+\.(avif|png|webp)$/i);
      expect(project.image.alt.trim().length).toBeGreaterThanOrEqual(12);
      expect(project.image.alt.toLowerCase()).not.toMatch(/^(image|photo|screenshot)( of)?$/);
      expect(project.image.width).toBeGreaterThan(0);
      expect(project.image.height).toBeGreaterThan(0);
    }
  });

  it('finds known projects and returns undefined for unknown ids', () => {
    expect(getProjectById('quizclone')?.name).toBe('QuizClone');
    expect(getProjectById('not-a-project')).toBeUndefined();
  });

  it('does not ship placeholder claims', () => {
    const copy = JSON.stringify(projects);
    for (const placeholder of ['Lorem ipsum', 'example.com', 'TBD', 'TODO', 'Coming soon']) {
      expect(copy).not.toContain(placeholder);
    }
  });
});
