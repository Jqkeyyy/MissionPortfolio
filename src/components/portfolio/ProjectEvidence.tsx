import { ArrowRight, Database, Globe2, Layers3, Monitor, ServerCog } from 'lucide-react';
import type { ArchitectureNode, ProjectEvidence as ProjectEvidenceData } from '@/data/projectEvidence';

const roleIcons = {
  interface: Monitor,
  service: ServerCog,
  data: Database,
  external: Globe2,
} as const;

const ArchitectureCard = ({ node, showArrow }: { node: ArchitectureNode; showArrow: boolean }) => {
  const Icon = roleIcons[node.role];
  return (
    <li className="relative min-w-0 flex-1 rounded-lg border border-cyan-200/15 bg-cyan-200/[0.045] p-4">
      <Icon aria-hidden="true" className="h-5 w-5 text-cyan-300" />
      <h3 className="mt-3 text-sm font-semibold normal-case tracking-normal text-white">{node.label}</h3>
      <p className="mt-2 text-xs leading-5 text-white/58">{node.detail}</p>
      {showArrow && (
        <ArrowRight aria-hidden="true" className="absolute -bottom-5 left-1/2 h-5 w-5 -translate-x-1/2 rotate-90 text-orange-300/70 lg:-right-6 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:rotate-0" />
      )}
    </li>
  );
};

export const ProjectEvidence = ({ evidence, projectName }: { evidence: ProjectEvidenceData; projectName: string }) => (
  <div className="space-y-8">
    {evidence.media.length > 0 && (
      <section aria-labelledby="project-media-heading">
        <div className="flex items-center gap-2">
          <Layers3 aria-hidden="true" className="h-5 w-5 text-orange-300" />
          <h2 id="project-media-heading" className="font-heading text-xl tracking-[0.1em] text-white sm:text-2xl">
            Product evidence
          </h2>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {evidence.media.map((media) => (
            <figure key={media.src} className="overflow-hidden rounded-xl border border-white/12 bg-[#06111a] shadow-2xl">
              <img
                src={media.src}
                alt={media.alt}
                width={media.width}
                height={media.height}
                loading="lazy"
                decoding="async"
                className="aspect-video w-full object-cover object-top"
              />
              <figcaption className="border-t border-white/10 px-4 py-3 text-xs leading-5 text-white/58">
                {media.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    )}

    <section aria-labelledby="project-architecture-heading" className="rounded-xl border border-white/12 bg-[#06111a]/92 p-5 sm:p-7">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-cyan-300/75">System map</p>
      <h2 id="project-architecture-heading" className="mt-2 font-heading text-xl tracking-[0.1em] text-white sm:text-2xl">
        {projectName} architecture
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">{evidence.architectureSummary}</p>
      <ol className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-stretch" aria-label={`${projectName} system flow`}>
        {evidence.architecture.map((node, index) => (
          <ArchitectureCard key={node.label} node={node} showArrow={index < evidence.architecture.length - 1} />
        ))}
      </ol>
    </section>
  </div>
);
