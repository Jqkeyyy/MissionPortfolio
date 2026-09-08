import { useEffect, useMemo, useRef } from 'react';
import { Download, Printer, Rocket, X } from 'lucide-react';
import { ContactActions } from '@/components/portfolio/ContactActions';
import { ProjectCaseStudy } from '@/components/portfolio/ProjectCaseStudy';
import { primaryContactActions } from '@/data/contact';
import { getPlanetById } from '@/data/planets';
import { projects } from '@/data/projects';

interface QuickPortfolioProps {
  onClose: () => void;
  standalone?: boolean;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const portfolioSections = [
  { id: 'mercury', heading: 'Education' },
  { id: 'venus', heading: 'Technical toolkit' },
  { id: 'earth', heading: 'Experience' },
] as const;

export const QuickPortfolio = ({ onClose, standalone = false }: QuickPortfolioProps) => {
  const dialogRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const introduction = getPlanetById('sun')?.content[0];
  const resumeAction = primaryContactActions.find((action) => action.kind === 'resume');
  const directContactActions = useMemo(
    () => primaryContactActions.filter((action) => action.kind !== 'resume'),
    [],
  );

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    headingRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (standalone || event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('disabled'));
      if (!focusable.length) {
        event.preventDefault();
        headingRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
      if (activeIndex === -1) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [onClose, standalone]);

  return (
    <section
      ref={dialogRef}
      role={standalone ? undefined : 'dialog'}
      aria-modal={standalone ? undefined : 'true'}
      aria-labelledby="quick-portfolio-title"
      className="quick-portfolio-overlay fixed inset-0 z-[1000] overflow-y-auto bg-[#02070d] text-white"
    >
      <div aria-hidden="true" className="stars-bg pointer-events-none fixed inset-0 opacity-20" />
      <header className="quick-portfolio-toolbar sticky top-0 z-20 border-b border-white/10 bg-[#02070d]/95 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-200/75">
            Quick Portfolio
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Print Quick Portfolio"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-3 text-xs text-white/75 hover:border-cyan-200/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={standalone ? 'Return to Mission Portfolio home' : 'Close Quick Portfolio and return to exploration'}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-3 text-xs text-white/75 hover:border-orange-200/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{standalone ? 'Home' : 'Close'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
        <section aria-labelledby="quick-portfolio-title" className="border-b border-white/10 pb-10 sm:pb-14">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-orange-300">Recruiter overview</p>
          <h1
            ref={headingRef}
            id="quick-portfolio-title"
            tabIndex={-1}
            className="mt-3 max-w-4xl font-heading text-4xl tracking-[0.06em] text-white outline-none sm:text-6xl"
          >
            Jake Sass
          </h1>
          {introduction && (
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              {introduction.content}
            </p>
          )}
          <div className="quick-portfolio-actions mt-7 flex flex-wrap gap-3">
            {resumeAction && (
              <a
                href={resumeAction.href}
                download={resumeAction.download}
                aria-label={resumeAction.accessibleLabel}
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-orange-400 px-4 font-heading text-xs tracking-[0.1em] text-slate-950 hover:bg-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {resumeAction.label}
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-cyan-200/35 px-4 font-heading text-xs tracking-[0.1em] text-cyan-100 hover:bg-cyan-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            >
              <Rocket className="h-4 w-4" aria-hidden="true" />
              Return to exploration
            </button>
          </div>
        </section>

        <div className="grid gap-8 border-b border-white/10 py-10 lg:grid-cols-3 sm:py-14">
          {portfolioSections.map(({ id, heading }) => {
            const planet = getPlanetById(id);
            if (!planet) return null;
            return (
              <section key={id} aria-labelledby={`quick-${id}-heading`}>
                <h2 id={`quick-${id}-heading`} className="font-heading text-xl tracking-[0.1em] text-cyan-100">
                  {heading}
                </h2>
                <div className="mt-5 space-y-5">
                  {planet.content.map((item) => (
                    <article key={item.id}>
                      <h3 className="text-sm font-semibold tracking-wide text-white/90">{item.title}</h3>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-white/60">{item.content}</p>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section aria-labelledby="quick-projects-heading" className="border-b border-white/10 py-10 sm:py-14">
          <h2 id="quick-projects-heading" className="font-heading text-2xl tracking-[0.1em] text-white sm:text-3xl">
            Selected projects
          </h2>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <ProjectCaseStudy key={project.id} project={project} variant="compact" />
            ))}
          </div>
        </section>

        <section aria-labelledby="quick-contact-heading" className="py-10 sm:py-14">
          <h2 id="quick-contact-heading" className="font-heading text-2xl tracking-[0.1em] text-white sm:text-3xl">
            Contact
          </h2>
          <ContactActions actions={directContactActions} className="mt-6 max-w-2xl" />
          <p className="mt-6 max-w-2xl text-xs leading-5 text-white/45">
            Privacy: exploration progress and sound preferences stay in this browser. Optional aggregate telemetry is disabled by default, honors browser privacy signals, and never includes identifiers, contact details, or free-form input.
          </p>
        </section>
      </main>
    </section>
  );
};
