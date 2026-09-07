import { expect, test } from '@playwright/test';

const PRODUCTION_URL = 'https://mission-portfolio-amber.vercel.app/';

test('Quick Portfolio is complete and returns to route selection', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Choose your route' })).toBeVisible();
  await expect(page).toHaveTitle(/Mission Portfolio.*Jake Sass/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', PRODUCTION_URL);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Jake Sass/i);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', PRODUCTION_URL);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    `${PRODUCTION_URL}brand/og-mission-portfolio.png`,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    'content',
    `${PRODUCTION_URL}brand/og-mission-portfolio.png`,
  );
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');

  const structuredData = JSON.parse(
    await page.locator('script[type="application/ld+json"]').textContent() ?? '{}',
  ) as { '@graph'?: Array<{ '@type'?: string; name?: string }> };
  expect(structuredData['@graph']).toEqual(expect.arrayContaining([
    expect.objectContaining({ '@type': 'Person', name: 'Jacob Sass' }),
    expect.objectContaining({ '@type': 'SoftwareSourceCode', name: 'Mission Portfolio' }),
  ]));

  await page.getByRole('button', { name: 'View Quick Portfolio' }).click();
  await expect(page.getByRole('dialog', { name: 'Jake Sass' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Selected projects' })).toBeVisible();
  await expect(page.getByRole('link', { name: /download.*resume/i })).toHaveAttribute(
    'href',
    '/Jacob-Sass-Resume.pdf',
  );

  await page.getByRole('button', { name: /close quick portfolio/i }).click();
  await expect(page.getByRole('heading', { name: 'Choose your route' })).toBeVisible();
});

test('deployment serves discovery files and the SPA not-found route', async ({ page, request }) => {
  const [robots, sitemap] = await Promise.all([
    request.get('/robots.txt'),
    request.get('/sitemap.xml'),
  ]);

  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(`Sitemap: ${PRODUCTION_URL}sitemap.xml`);
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain(`<loc>${PRODUCTION_URL}</loc>`);

  const response = await page.goto('/not-a-real-page');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Home' })).toHaveAttribute('href', '/');
});

test('exploration reaches a themed planet, base camp, and HAB desktop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Launch exploration' }).click();

  const destinationNav = page.getByRole('navigation', { name: 'Solar system destinations' });
  await expect(destinationNav).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Immersive exploration is unavailable on this device.')).not.toBeVisible();

  await destinationNav.getByRole('button', { name: 'Earth' }).click();
  await expect(page.getByRole('heading', { name: 'Earth planet surface' })).toBeAttached({ timeout: 10_000 });
  await expect(page.locator('[data-planet-theme="earth"]')).toHaveAttribute(
    'data-habitat-family',
    'terrestrial-research',
  );
  await expect(page.getByText('SURFACE TEMP: 15°C')).toBeVisible();

  await page.getByRole('button', { name: 'Enter the base camp on Earth' }).click();
  await expect(page.getByRole('region', { name: 'Earth base camp interior' })).toHaveAttribute(
    'data-habitat-family',
    'terrestrial-research',
  );
  await page.getByRole('button', { name: 'Sit down at the mission computer' }).click();
  await expect(page.getByTestId('desktop-archive')).toBeVisible({ timeout: 10_000 });
});

test('route selection and Quick Portfolio fit a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Choose your route' })).toBeVisible();
  await page.getByRole('button', { name: 'View Quick Portfolio' }).click();
  await expect(page.getByRole('dialog', { name: 'Jake Sass' })).toBeVisible();

  const pageWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client);
  await expect(page.getByRole('link', { name: /download.*resume/i })).toBeVisible();
});
