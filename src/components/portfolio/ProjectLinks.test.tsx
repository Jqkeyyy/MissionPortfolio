import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProjectLink } from '@/types/portfolio';
import { ProjectLinks } from './ProjectLinks';

const links: ProjectLink[] = [
  {
    kind: 'repository',
    label: 'View repository',
    href: 'https://github.com/Jqkeyyy/example',
    external: true,
  },
  {
    kind: 'live',
    label: 'Open live project',
    href: 'https://example.vercel.app',
    external: true,
  },
];

describe('ProjectLinks', () => {
  it('renders repository and live actions with descriptive names', () => {
    render(<ProjectLinks links={links} projectName="Example Project" />);

    expect(screen.getByRole('link', { name: /view repository for example project/i })).toHaveAttribute(
      'href',
      links[0].href,
    );
    expect(screen.getByRole('link', { name: /open live project for example project/i })).toHaveAttribute(
      'href',
      links[1].href,
    );
  });

  it('protects new-tab links against opener access', () => {
    render(<ProjectLinks links={links} projectName="Example Project" />);

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')?.split(' ')).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
    }
  });

  it('omits unsafe or credential-bearing destinations', () => {
    const unsafeLinks: ProjectLink[] = [
      { kind: 'live', label: 'Unsafe script', href: 'javascript:alert(1)', external: true },
      { kind: 'repository', label: 'Credential URL', href: 'https://user:pass@example.com', external: true },
    ];

    const { container } = render(<ProjectLinks links={unsafeLinks} projectName="Unsafe Project" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not force same-context links into a new tab', () => {
    render(
      <ProjectLinks
        projectName="Same Context"
        links={[{ kind: 'live', label: 'Open project', href: 'https://example.com', external: false }]}
      />,
    );

    const link = screen.getByRole('link', { name: /open project for same context/i });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});
