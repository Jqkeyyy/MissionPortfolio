import { ExternalLink, Github, Rocket } from 'lucide-react';
import type { ProjectLink } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface ProjectLinksProps {
  links: readonly ProjectLink[];
  projectName: string;
  compact?: boolean;
  className?: string;
}

const isSafeProjectLink = (link: ProjectLink) => {
  try {
    const url = new URL(link.href);
    return url.protocol === 'https:' && url.username === '' && url.password === '';
  } catch {
    return false;
  }
};

export const ProjectLinks = ({
  links,
  projectName,
  compact = false,
  className,
}: ProjectLinksProps) => {
  const safeLinks = links.filter(isSafeProjectLink);

  if (safeLinks.length === 0) return null;

  return (
    <div
      aria-label={`${projectName} links`}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {safeLinks.map((link) => {
        const Icon = link.kind === 'repository' ? Github : Rocket;

        return (
          <a
            key={`${link.kind}:${link.href}`}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            aria-label={`${link.label} for ${projectName}${link.external ? ' (opens in a new tab)' : ''}`}
            className={cn(
              'group inline-flex min-h-11 items-center justify-center gap-2 rounded-md border font-mono uppercase tracking-[0.12em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              link.kind === 'live'
                ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20'
                : 'border-white/20 bg-white/[0.055] text-white/80 hover:border-white/35 hover:bg-white/10 hover:text-white',
              compact ? 'px-3 py-2 text-[0.65rem]' : 'px-4 py-2.5 text-xs',
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{link.label}</span>
            {link.external && (
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-55 transition-opacity group-hover:opacity-100" />
            )}
          </a>
        );
      })}
    </div>
  );
};
