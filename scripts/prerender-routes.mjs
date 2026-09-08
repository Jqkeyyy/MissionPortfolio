import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTypescriptModule } from './load-typescript-data.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectRoot, 'dist');
const templatePath = path.join(distDirectory, 'index.html');
if (!fs.existsSync(templatePath)) throw new Error('Run Vite before prerendering routes.');

const defaultSiteUrl = 'https://mission-portfolio-amber.vercel.app';
const siteUrl = (process.env.VITE_SITE_URL ?? defaultSiteUrl).replace(/\/$/, '');
const template = fs.readFileSync(templatePath, 'utf8').replaceAll(defaultSiteUrl, siteUrl);
fs.writeFileSync(templatePath, template);
const { projects } = loadTypescriptModule(path.join(projectRoot, 'src/data/projects.ts'));
const { projectEvidence } = loadTypescriptModule(path.join(projectRoot, 'src/data/projectEvidence.ts'));
const { planets } = loadTypescriptModule(path.join(projectRoot, 'src/data/planets.ts'));
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const replaceMeta = (html, { title, description, routePath, structuredData, image, robots }) => {
  const url = new URL(routePath, siteUrl).toString();
  let output = html
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/s, `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/?>)/s, `$1${url}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`);
  if (image) {
    const imageUrl = new URL(image.src, siteUrl).toString();
    output = output
      .replace(/(<meta\s+property="og:image"\s+content=")[^"]*("\s*\/?>)/s, `$1${imageUrl}$2`)
      .replace(/(<meta\s+property="og:image:type"\s+content=")[^"]*("\s*\/?>)/s, `$1${image.src.endsWith('.webp') ? 'image/webp' : 'image/png'}$2`)
      .replace(/(<meta\s+property="og:image:width"\s+content=")[^"]*("\s*\/?>)/s, `$1${image.width}$2`)
      .replace(/(<meta\s+property="og:image:height"\s+content=")[^"]*("\s*\/?>)/s, `$1${image.height}$2`)
      .replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(image.alt)}$2`)
      .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*("\s*\/?>)/s, `$1${imageUrl}$2`)
      .replace(/(<meta\s+name="twitter:image:alt"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(image.alt)}$2`);
  }
  if (structuredData) {
    const json = JSON.stringify(structuredData).replaceAll('<', '\\u003c');
    output = output.replace('</head>', `    <script id="route-prerendered-json-ld" type="application/ld+json">${json}</script>\n  </head>`);
  }
  if (robots) output = output.replace('</head>', `    <meta name="robots" content="${escapeHtml(robots)}" />\n  </head>`);
  return output;
};

const writeRoute = (routePath, metadata, body) => {
  const directory = path.join(distDirectory, routePath.replace(/^\//, ''));
  fs.mkdirSync(directory, { recursive: true });
  const prerenderedBody = `<main data-prerendered-route="${escapeHtml(routePath)}" style="min-height:100vh;background:#02070d;color:#f8fafc;padding:3rem;font-family:system-ui"><div style="max-width:72rem;margin:auto">${body}</div></main>`;
  const html = replaceMeta(template, metadata).replace('<div id="root"></div>', `<div id="root">${prerenderedBody}</div>`);
  fs.writeFileSync(path.join(directory, 'index.html'), html);
};

writeRoute('/portfolio', {
  title: 'Software Developer Portfolio — Jake Sass',
  description: 'Projects, engineering case studies, experience, technical skills, résumé, and contact details for software developer Jake Sass.',
  routePath: '/portfolio',
  structuredData: { '@context': 'https://schema.org', '@type': 'ProfilePage', name: 'Jake Sass — Software Developer Portfolio', url: `${siteUrl}/portfolio` },
}, `<p>Recruiter overview</p><h1>Jake Sass — Software Developer</h1><p>Full-stack products, data tools, machine learning, and interactive experiences.</p><h2>Selected projects</h2><ul>${projects.map((project) => `<li><a href="/projects/${escapeHtml(project.id)}" style="color:#67e8f9">${escapeHtml(project.name)}</a> — ${escapeHtml(project.oneLineSummary)}</li>`).join('')}</ul>`);

for (const project of projects) {
  const evidence = projectEvidence[project.id];
  writeRoute(`/projects/${project.id}`, {
    title: `${project.name} — Jake Sass`,
    description: project.oneLineSummary,
    routePath: `/projects/${project.id}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: project.name,
      description: project.oneLineSummary,
      url: `${siteUrl}/projects/${project.id}`,
      codeRepository: project.links.find((link) => link.kind === 'repository')?.href,
      programmingLanguage: project.technologies,
    },
    image: evidence.media[0],
  }, `<p>Project dossier</p><h1>${escapeHtml(project.name)}</h1><p>${escapeHtml(project.oneLineSummary)}</p><h2>Problem</h2><p>${escapeHtml(project.caseStudy.problem)}</p><h2>Outcome</h2><p>${escapeHtml(project.caseStudy.outcome)}</p><h2>${escapeHtml(project.name)} architecture</h2><p>${escapeHtml(evidence.architectureSummary)}</p><ol>${evidence.architecture.map((node) => `<li><strong>${escapeHtml(node.label)}</strong>: ${escapeHtml(node.detail)}</li>`).join('')}</ol>`);
}

for (const planet of planets) {
  writeRoute(`/explore/${planet.id}`, {
    title: `${planet.displayName} Mission — Jake Sass`,
    description: `Explore ${planet.displayName}, the ${planet.description.toLowerCase()} destination in Jake Sass's Mission Portfolio.`,
    routePath: `/explore/${planet.id}`,
  }, `<p>Mission destination</p><h1>${escapeHtml(planet.displayName)} — ${escapeHtml(planet.description)}</h1>${planet.content.map((item) => `<section><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.content)}</p></section>`).join('')}`);
}

writeRoute('/mission-analytics', {
  title: 'Mission Analytics — Jake Sass',
  description: 'Private aggregate mission analytics dashboard.',
  routePath: '/mission-analytics',
  robots: 'noindex,nofollow',
}, '<p>Private mission system</p><h1>Mission analytics</h1><p>Authentication is required. No visitor identifiers are collected.</p>');

const sitemapRoutes = ['/', '/portfolio', ...projects.map((project) => `/projects/${project.id}`), ...planets.map((planet) => `/explore/${planet.id}`)];
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes.map((route) => `  <url><loc>${new URL(route, siteUrl)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(distDirectory, 'sitemap.xml'), sitemap);
const robotsPath = path.join(distDirectory, 'robots.txt');
if (fs.existsSync(robotsPath)) fs.writeFileSync(robotsPath, fs.readFileSync(robotsPath, 'utf8').replaceAll(defaultSiteUrl, siteUrl));
console.log(`Prerendered ${2 + projects.length + planets.length} portfolio routes.`);
