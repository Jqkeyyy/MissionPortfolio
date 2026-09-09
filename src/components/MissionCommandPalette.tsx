import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Download, FileUser, Gauge, Home, Mail, Orbit, RadioTower, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { planets } from '@/data/planets';
import { projects } from '@/data/projects';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { primaryContactActions } from '@/data/contact';
import { useGraphicsSettings, type GraphicsPreference } from '@/hooks/useGraphicsSettings';

export const MissionCommandPalette = ({ className, initialOpen = false }: { className?: string; initialOpen?: boolean }) => {
  const [open, setOpen] = useState(initialOpen);
  const navigate = useNavigate();
  const setGraphicsPreference = useGraphicsSettings((state) => state.setPreference);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const openAction = (href: string, external: boolean) => {
    setOpen(false);
    if (external) window.open(href, '_blank', 'noopener,noreferrer');
    else window.location.assign(href);
  };

  const setGraphics = (preference: GraphicsPreference) => {
    setGraphicsPreference(preference);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('fixed bottom-4 left-4 z-[1100] hidden min-h-11 items-center gap-2 rounded-md border border-cyan-200/25 bg-[#06111a]/95 px-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-cyan-100 shadow-xl backdrop-blur hover:border-cyan-200/55 hover:bg-cyan-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 sm:inline-flex', className)}
        aria-label="Open mission command palette"
      >
        <RadioTower aria-hidden="true" className="h-4 w-4" />
        Navigate
        <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-white/45">Ctrl K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Mission navigation</DialogTitle>
        <DialogDescription className="sr-only">Search projects, planets, and portfolio destinations.</DialogDescription>
        <CommandInput placeholder="Search missions, projects, or actions..." aria-label="Search mission navigation" />
        <CommandList>
          <CommandEmpty>No matching mission found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => go('/')}><Home aria-hidden="true" /> Mission home <CommandShortcut>Home</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => go('/portfolio')}><FileUser aria-hidden="true" /> Quick Portfolio</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            {primaryContactActions.map((action) => (
              <CommandItem key={action.id} value={`action ${action.label} ${action.kind}`} onSelect={() => openAction(action.href, action.external)}>
                {action.kind === 'resume' ? <Download aria-hidden="true" /> : <Mail aria-hidden="true" />}
                <span>{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem key={project.id} value={`project ${project.name} ${project.technologies.join(' ')}`} onSelect={() => go(`/projects/${project.id}`)}>
                <BriefcaseBusiness aria-hidden="true" />
                <span className="truncate">{project.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Explore planets">
            {planets.map((planet) => (
              <CommandItem key={planet.id} value={`planet ${planet.displayName} ${planet.description}`} onSelect={() => go(`/explore/${planet.id}`)}>
                {planet.id === 'sun' ? <Rocket aria-hidden="true" /> : <Orbit aria-hidden="true" />}
                <span>{planet.displayName}</span>
                <CommandShortcut>{planet.description}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Graphics quality">
            {(['auto', 'low', 'balanced', 'high'] as const).map((preference) => (
              <CommandItem key={preference} value={`graphics quality ${preference}`} onSelect={() => setGraphics(preference)}>
                <Gauge aria-hidden="true" />
                <span>Use {preference} graphics</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
