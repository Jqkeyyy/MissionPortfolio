import { useEffect, useMemo } from 'react';
import { ArrowLeft, FileUser, RadioTower } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ProjectCaseStudy } from '@/components/portfolio/ProjectCaseStudy';
import { ProjectEvidence } from '@/components/portfolio/ProjectEvidence';
import { ContactActions } from '@/components/portfolio/ContactActions';
import { getProjectById, type ProjectId } from '@/data/projects';
import { getProjectEvidence } from '@/data/projectEvidence';
import { primaryContactActions } from '@/data/contact';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { telemetryClient } from '@/observability/telemetryClient';
import { SITE_URL } from '@/config/site';

const ProjectPage = () => {
  const { projectId = '' } = useParams();
  const project = getProjectById(projectId);
  const directContactActions = useMemo(
    () => primaryContactActions.filter((action) => action.kind !== 'resume'),
    [],
  );
  const structuredData = useMemo(() => project ? ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.name,
    description: project.oneLineSummary,
    url: `${SITE_URL}/projects/${project.id}`,
    codeRepository: project.links.find((link) => link.kind === 'repository')?.href,
    programmingLanguage: project.technologies,
    author: {
      '@type': 'Person',
      name: 'Jacob Sass',
      url: `${SITE_URL}/`,
    },
  }) : undefined, [project]);

  const evidence = project ? getProjectEvidence(project.id as ProjectId) : undefined;

  useDocumentMetadata({
    title: project ? `${project.name} — Jake Sass` : 'Project not found — Jake Sass',
    description: project?.oneLineSummary ?? 'The requested portfolio project could not be found.',
    path: project ? `/projects/${project.id}` : `/projects/${projectId}`,
    structuredData,
    image: evidence?.media[0],
  });

  useEffect(() => {
    if (project) telemetryClient.track({ type: 'project_action', project: project.id as ProjectId, action: 'case-study' });
  }, [project]);

  if (!project) return <Navigate to="/not-found" replace />;
  const projectEvidence = getProjectEvidence(project.id as ProjectId);

  return (
    <div className="fixed inset-0 overflow-y-auto bg-[#02070d] text-white">
      <div aria-hidden="true" className="stars-bg pointer-events-none fixed inset-0 opacity-20" />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#02070d]/95 px-4 py-3 backdrop-blur-xl sm:px-8">
        <nav aria-label="Project navigation" className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link to="/portfolio" className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-xs text-cyan-100 hover:bg-cyan-200/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            All projects
          </Link>
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 font-mono text-xs uppercase tracking-[0.15em] text-white/65 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <RadioTower aria-hidden="true" className="h-4 w-4" />
            Mission home
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-orange-300">Project dossier</p>
          <h1 className="mt-3 font-heading text-3xl tracking-[0.08em] text-white sm:text-5xl">{project.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
            Verified project context, engineering decisions, system boundaries, and delivery evidence.
          </p>
        </div>
        <ProjectCaseStudy project={project} />
        <div className="mt-8">
          <ProjectEvidence evidence={projectEvidence} projectName={project.name} />
        </div>

        <section aria-labelledby="project-contact-heading" className="mt-10 rounded-xl border border-orange-300/20 bg-orange-300/[0.045] p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <FileUser aria-hidden="true" className="h-5 w-5 text-orange-300" />
            <h2 id="project-contact-heading" className="font-heading text-xl tracking-[0.1em]">Discuss this work</h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
            Ask about the architecture, tradeoffs, testing strategy, or how the same approach could apply to your team.
          </p>
          <ContactActions actions={directContactActions} className="mt-5 max-w-2xl" />
        </section>
      </main>
    </div>
  );
};

export default ProjectPage;
