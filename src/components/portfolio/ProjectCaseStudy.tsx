import { AlertTriangle, CheckCircle2, Gauge, Layers3, Target } from 'lucide-react';
import { PROJECT_STATUS_LABELS, type PortfolioProject, type ProjectStatus } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { ProjectLinks } from './ProjectLinks';

interface ProjectCaseStudyProps {
  project: PortfolioProject;
  variant?: 'full' | 'compact';
  className?: string;
}

const statusStyles: Record<ProjectStatus, string> = {
  planned: 'border-amber-300/35 bg-amber-300/10 text-amber-100',
  'in-development': 'border-violet-300/35 bg-violet-300/10 text-violet-100',
  live: 'border-emerald-300/35 bg-emerald-300/10 text-emerald-100',
};

const SectionHeading = ({ children }: { children: string }) => (
  <h3 className="mb-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
    {children}
  </h3>
);

export const ProjectCaseStudy = ({
  project,
  variant = 'full',
  className,
}: ProjectCaseStudyProps) => {
  const compact = variant === 'compact';
  const headingId = `project-${project.id}-title`;

  return (
    <article
      aria-labelledby={headingId}
      data-variant={variant}
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/15 bg-[#06111a]/95 text-white shadow-[0_18px_55px_rgba(0,0,0,0.35)]',
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-7 lg:p-8',
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />

      <header className={cn('relative flex gap-4', compact ? 'flex-col' : 'flex-col sm:flex-row sm:items-start sm:justify-between')}>
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em]',
                statusStyles[project.status],
              )}
            >
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
          </div>
          <h2 id={headingId} className={cn('font-heading tracking-[0.08em] text-white', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}>
            {project.name}
          </h2>
          <p className={cn('mt-3 max-w-3xl leading-relaxed text-white/70', compact ? 'text-sm' : 'text-sm sm:text-base')}>
            {project.oneLineSummary}
          </p>
        </div>

        {!compact && (
          <ProjectLinks
            className="shrink-0 sm:max-w-[18rem] sm:justify-end"
            links={project.links}
            projectName={project.name}
            projectId={project.id as import('@/data/projects').ProjectId}
          />
        )}
      </header>

      {project.image && (
        <figure className={cn('relative overflow-hidden rounded-lg border border-white/10 bg-black/30', compact ? 'mt-4' : 'mt-6')}>
          <img
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-cover"
          />
        </figure>
      )}

      {project.metrics.length > 0 && (
        <dl className={cn('grid gap-2', compact ? 'mt-4 grid-cols-2' : 'mt-6 grid-cols-2 lg:grid-cols-4')}>
          {project.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <dt className="text-[0.68rem] uppercase tracking-[0.12em] text-white/45">{metric.label}</dt>
              <dd className={cn('mt-1 font-heading text-cyan-100', compact ? 'text-lg' : 'text-xl')} title={metric.detail}>
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className={cn('flex flex-wrap gap-2', compact ? 'mt-4' : 'mt-6')} aria-label={`${project.name} technologies`}>
        {project.technologies.map((technology) => (
          <span
            key={technology}
            className="rounded-full border border-cyan-200/15 bg-cyan-200/[0.055] px-2.5 py-1 font-mono text-[0.65rem] text-cyan-50/75"
          >
            {technology}
          </span>
        ))}
      </div>

      {compact ? (
        <ProjectLinks
          compact
          className="mt-5"
          links={project.links}
          projectName={project.name}
          projectId={project.id as import('@/data/projects').ProjectId}
        />
      ) : (
        <div className="mt-7 grid gap-6 border-t border-white/10 pt-7 lg:grid-cols-2">
          <section>
            <SectionHeading>Problem</SectionHeading>
            <div className="flex gap-3">
              <Target aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
              <p className="text-sm leading-relaxed text-white/72">{project.caseStudy.problem}</p>
            </div>
          </section>

          <section>
            <SectionHeading>Outcome</SectionHeading>
            <div className="flex gap-3">
              <Gauge aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <p className="text-sm leading-relaxed text-white/72">{project.caseStudy.outcome}</p>
            </div>
          </section>

          <section>
            <SectionHeading>Approach</SectionHeading>
            <ol className="space-y-3">
              {project.caseStudy.approach.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-relaxed text-white/72">
                  <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-300/30 bg-violet-300/10 font-mono text-[0.65rem] text-violet-100">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <SectionHeading>Engineering highlights</SectionHeading>
            <ul className="space-y-3">
              {project.caseStudy.engineeringHighlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-white/72">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>

          {project.caseStudy.limitations && project.caseStudy.limitations.length > 0 && (
            <section className="rounded-lg border border-amber-300/15 bg-amber-300/[0.035] p-4 lg:col-span-2">
              <div className="flex items-center gap-2">
                <AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber-300" />
                <SectionHeading>Limitations and next steps</SectionHeading>
              </div>
              <ul className="mt-1 grid gap-2 sm:grid-cols-2">
                {project.caseStudy.limitations.map((limitation) => (
                  <li key={limitation} className="flex gap-2 text-sm leading-relaxed text-amber-50/65">
                    <Layers3 aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </article>
  );
};
