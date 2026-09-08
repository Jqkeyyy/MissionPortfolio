import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { loadTypescriptModule } from './load-typescript-data.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { projects } = loadTypescriptModule(path.join(projectRoot, 'src/data/projects.ts'));
const { projectEvidence } = loadTypescriptModule(path.join(projectRoot, 'src/data/projectEvidence.ts'));
const errors = [];
const seenIds = new Set();

for (const project of projects) {
  if (!/^[a-z0-9-]+$/.test(project.id)) errors.push(`${project.id}: project id is not URL-safe.`);
  if (seenIds.has(project.id)) errors.push(`${project.id}: duplicate project id.`);
  seenIds.add(project.id);
  if (!project.oneLineSummary || project.oneLineSummary.length > 180) errors.push(`${project.id}: summary must contain 1–180 characters.`);
  if (!project.caseStudy?.problem || !project.caseStudy?.outcome || project.caseStudy.approach.length < 2) errors.push(`${project.id}: incomplete case study.`);
  if (project.metrics.length === 0) errors.push(`${project.id}: at least one evidence metric is required.`);
  if (project.status === 'live' && !project.links.some((link) => link.kind === 'live')) errors.push(`${project.id}: live project has no live link.`);
  for (const link of project.links) {
    try {
      const url = new URL(link.href);
      if (url.protocol !== 'https:' || url.username || url.password) errors.push(`${project.id}: unsafe link ${link.href}.`);
    } catch {
      errors.push(`${project.id}: invalid link ${link.href}.`);
    }
  }
  const serialized = JSON.stringify(project);
  for (const stalePhrase of ['active roadmap items', 'does not currently publish a verified live-project URL', 'TBD', 'TODO']) {
    if (serialized.toLowerCase().includes(stalePhrase.toLowerCase())) errors.push(`${project.id}: contains stale placeholder text “${stalePhrase}”.`);
  }

  const evidence = projectEvidence[project.id];
  if (!evidence || evidence.architecture.length < 3) errors.push(`${project.id}: architecture evidence is incomplete.`);
  for (const media of evidence?.media ?? []) {
    const mediaPath = path.join(projectRoot, 'public', media.src.replace(/^\//, ''));
    if (!fs.existsSync(mediaPath)) errors.push(`${project.id}: missing media file ${media.src}.`);
    if (!media.alt || !media.caption || !media.width || !media.height) errors.push(`${project.id}: media metadata is incomplete for ${media.src}.`);
  }
}

for (const evidenceId of Object.keys(projectEvidence)) {
  if (!seenIds.has(evidenceId)) errors.push(`${evidenceId}: evidence exists without a matching project.`);
}

for (const requiredFile of ['public/Jacob-Sass-Resume.pdf', 'public/robots.txt', 'public/site.webmanifest']) {
  if (!fs.existsSync(path.join(projectRoot, requiredFile))) errors.push(`Missing required public file: ${requiredFile}.`);
}

if (process.argv.includes('--network')) {
  const urls = [...new Set(projects.flatMap((project) => project.links.map((link) => link.href)))];
  const results = await Promise.all(urls.map(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10_000) });
      return response.ok || [401, 403, 405, 429].includes(response.status) ? null : `${url}: returned HTTP ${response.status}.`;
    } catch (error) {
      return `${url}: ${error instanceof Error ? error.message : 'network check failed'}.`;
    }
  }));
  errors.push(...results.filter(Boolean));
}

if (errors.length > 0) {
  console.error(`Content validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Content validation passed for ${projects.length} projects and ${Object.keys(projectEvidence).length} evidence records.`);
}
