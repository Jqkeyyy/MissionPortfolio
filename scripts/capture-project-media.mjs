import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const outputDirectory = path.resolve('public/project-media');
await fs.mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });

const captures = [
  { name: 'mission-portfolio', url: 'https://mission-portfolio-amber.vercel.app/' },
  {
    name: 'campus-marketplace',
    url: 'https://campus-marketplace-beta.vercel.app/',
    prepare: async () => {
      const register = page.getByRole('link', { name: 'Register' }).or(page.getByRole('button', { name: 'Register' }));
      if (await register.count()) await register.first().click();
    },
  },
  { name: 'whats-jake-doing', url: 'https://whats-jake-doing.vercel.app/' },
  { name: 'arena-tracker', url: 'https://arena-tracker-plum.vercel.app/' },
];

try {
  for (const capture of captures) {
    await page.goto(capture.url, { waitUntil: 'networkidle', timeout: 30_000 });
    await capture.prepare?.();
    await page.waitForTimeout(1_000);
    await page.screenshot({
      path: path.join(outputDirectory, `${capture.name}.webp`),
      type: 'webp',
      quality: 84,
      animations: 'disabled',
    });
    console.log(`Captured ${capture.name}.`);
  }
} finally {
  await browser.close();
}
