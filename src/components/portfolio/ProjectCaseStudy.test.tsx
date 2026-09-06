import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PortfolioProject } from '@/types/portfolio';
import { ProjectCaseStudy } from './ProjectCaseStudy';

const project: PortfolioProject = {
  id: 'test-project',
  name: 'Test Mission',
  oneLineSummary: 'A detailed test mission that proves the reusable project presentation works.',
  status: 'live',
  technologies: ['React', 'TypeScript', 'Vitest'],
  links: [
    {
      kind: 'repository',
      label: 'View repository',
      href: 'https://github.com/Jqkeyyy/test-project',
      external: true,
    },
    {
      kind: 'live',
      label: 'Open live project',
      href: 'https://test-project.example.com',
      external: true,
    },
  ],
  metrics: [
    { value: '42', label: 'verified checks', detail: 'A useful metric detail.', source: 'repository' },
    { value: '3', label: 'delivery modes', source: 'repository' },
  ],
  image: {
    src: '/projects/test-project.webp',
    alt: 'Test Mission dashboard showing its primary workflow',
    width: 1280,
    height: 720,
  },
  caseStudy: {
    problem: 'Visitors needed a concise way to understand the engineering problem and its constraints.',
    approach: [
      'Create a typed content contract shared by every presentation.',
      'Render responsive semantic sections from the same project record.',
    ],
    outcome: 'The finished component presents the project evidence consistently in multiple contexts.',
    engineeringHighlights: [
      'Semantic article and section structure',
      'Safe external project actions',
    ],
    limitations: ['The sample screenshot is only a fixture and is not requested by the test runner.'],
  },
};

describe('ProjectCaseStudy', () => {
  it('renders the complete case study in full mode', () => {
    render(<ProjectCaseStudy project={project} />);

    const article = screen.getByRole('article', { name: 'Test Mission' });
    expect(article).toHaveAttribute('data-variant', 'full');
    expect(within(article).getByText('Live')).toBeInTheDocument();
    expect(within(article).getByRole('heading', { name: 'Problem' })).toBeInTheDocument();
    expect(within(article).getByRole('heading', { name: 'Approach' })).toBeInTheDocument();
    expect(within(article).getByRole('heading', { name: 'Outcome' })).toBeInTheDocument();
    expect(within(article).getByRole('heading', { name: 'Engineering highlights' })).toBeInTheDocument();
    expect(within(article).getByRole('heading', { name: 'Limitations and next steps' })).toBeInTheDocument();
    expect(within(article).getByText(project.caseStudy.problem)).toBeInTheDocument();
    expect(within(article).getByText(project.caseStudy.outcome)).toBeInTheDocument();
  });

  it('renders metrics, technology tags, and project actions', () => {
    render(<ProjectCaseStudy project={project} />);

    expect(screen.getByText('42')).toHaveAttribute('title', 'A useful metric detail.');
    expect(screen.getByText('verified checks')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view repository for test mission/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open live project for test mission/i })).toBeInTheDocument();
  });

  it('renders an intrinsic, lazy-loaded project image with meaningful alt text', () => {
    render(<ProjectCaseStudy project={project} />);

    const image = screen.getByRole('img', { name: project.image?.alt });
    expect(image).toHaveAttribute('src', project.image?.src);
    expect(image).toHaveAttribute('width', '1280');
    expect(image).toHaveAttribute('height', '720');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('uses a concise presentation in compact mode', () => {
    render(<ProjectCaseStudy project={project} variant="compact" />);

    const article = screen.getByRole('article', { name: 'Test Mission' });
    expect(article).toHaveAttribute('data-variant', 'compact');
    expect(within(article).getByText(project.oneLineSummary)).toBeInTheDocument();
    expect(within(article).getByRole('link', { name: /view repository for test mission/i })).toBeInTheDocument();
    expect(within(article).queryByRole('heading', { name: 'Problem' })).not.toBeInTheDocument();
    expect(within(article).queryByText(project.caseStudy.problem)).not.toBeInTheDocument();
  });

  it('does not reserve empty media space when a project has no image', () => {
    const projectWithoutImage = { ...project, image: undefined };
    render(<ProjectCaseStudy project={projectWithoutImage} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
