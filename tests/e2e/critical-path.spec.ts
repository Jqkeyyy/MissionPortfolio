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

test('exploration reaches a themed planet, base camp, and HAB desktop', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The immersive WebGL journey is covered in Chromium; recruiter paths run in every browser.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Launch exploration' }).click();

  const destinationNav = page.getByRole('navigation', { name: 'Solar system destinations' });
  await expect(destinationNav).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Immersive exploration is unavailable on this device.')).not.toBeVisible();

  const titleOffset = await page.getByTestId('space-title-overlay').evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return Math.abs(bounds.left + bounds.width / 2 - window.innerWidth / 2);
  });
  expect(titleOffset).toBeLessThanOrEqual(1);

  await destinationNav.getByRole('button', { name: /^Earth (Visited|Not visited)$/ }).click();
  await expect(page.getByRole('heading', { name: 'Earth planet surface' })).toBeAttached({ timeout: 10_000 });

  const baseCampAlignment = await page.evaluate(() => {
    const center = (testId: string) => {
      const bounds = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!.getBoundingClientRect();
      return bounds.left + bounds.width / 2;
    };
    const doorCenter = center('base-camp-door-anchor');
    return {
      enterPrompt: Math.abs(center('base-camp-enter-prompt') - doorCenter),
      status: Math.abs(center('base-camp-status') - doorCenter),
    };
  });
  expect(baseCampAlignment.enterPrompt).toBeLessThanOrEqual(1);
  expect(baseCampAlignment.status).toBeLessThanOrEqual(1);

  const baseCampVisual = await page.getByTestId('base-camp-visual').boundingBox();
  expect(baseCampVisual).not.toBeNull();
  expect(Math.abs(baseCampVisual!.x + baseCampVisual!.width / 2 - page.viewportSize()!.width * 0.7))
    .toBeLessThanOrEqual(1);

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

test('simulation controls and science console work without starting travel', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The immersive WebGL journey is covered in Chromium; recruiter paths run in every browser.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Launch exploration' }).click();

  const destinationNav = page.getByRole('navigation', { name: 'Solar system destinations' });
  await expect(destinationNav).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'Real Time', exact: true }).click();
  await expect(page.getByText('ORBIT_SCALE: 1Y / 1 EARTH YEAR')).toBeVisible();
  await page.getByRole('button', { name: '100x', exact: true }).click();
  await expect(page.getByText('TIME_STATE: 100X')).toBeVisible();
  await page.getByRole('button', { name: 'Super Fast', exact: true }).click();
  await expect(page.getByText('ORBIT_SCALE: 1Y / 15S')).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByText('TIME_STATE: PAUSED')).toBeVisible();

  await destinationNav.getByRole('button', { name: 'Open science data for Saturn' }).click();
  await expect(page.getByRole('dialog')).toContainText('Ring system');
  await expect(page.getByRole('heading', { name: 'Saturn' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /planet surface/i })).not.toBeAttached();
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
