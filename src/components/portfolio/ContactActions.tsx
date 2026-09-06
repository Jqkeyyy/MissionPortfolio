import type { ComponentType, SVGProps } from 'react';
import {
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  RadioTower,
  Rocket,
} from 'lucide-react';
import { contactActions, type ContactAction } from '@/data/contact';
import { cn } from '@/lib/utils';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const actionIcons: Record<ContactAction['kind'], IconComponent> = {
  email: Mail,
  github: Github,
  linkedin: Linkedin,
  website: RadioTower,
  resume: Download,
  'live-project': Rocket,
};

export interface ContactActionsProps {
  actions?: readonly ContactAction[];
  variant?: 'full' | 'compact';
  className?: string;
}

export const ContactActions = ({
  actions = contactActions,
  variant = 'full',
  className,
}: ContactActionsProps) => (
  <ul
    className={cn(
      'grid list-none gap-2 p-0',
      variant === 'full' ? 'sm:grid-cols-2' : 'grid-cols-1',
      className,
    )}
    aria-label="Contact and project links"
  >
    {actions.map((action) => {
      const Icon = actionIcons[action.kind];
      const opensNewWindow = action.external;

      return (
        <li key={action.id}>
          <a
            className={cn(
              'group flex min-h-11 w-full items-center gap-2 rounded-md border border-border/60',
              'bg-card/70 px-3 py-2 font-heading text-xs tracking-wide text-foreground',
              'transition-colors hover:border-primary/70 hover:bg-primary/10 hover:text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'focus-visible:ring-offset-background',
              variant === 'compact' && 'min-h-10 px-2.5 py-1.5 text-[11px]',
            )}
            href={action.href}
            aria-label={action.accessibleLabel}
            target={opensNewWindow ? '_blank' : undefined}
            rel={opensNewWindow ? 'noopener noreferrer' : undefined}
            download={action.download}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{action.label}</span>
            {opensNewWindow && (
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
            )}
          </a>
        </li>
      );
    })}
  </ul>
);
