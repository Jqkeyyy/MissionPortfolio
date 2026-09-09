import { expect, test } from '@playwright/test';

test('project routes expose evidence, metadata, and prerendered HTML', async ({ page, request }) => {
  const rawResponse = await request.get('/projects/mission-portfolio/index.html');
  expect(rawResponse.ok()).toBe(true);
  const rawHtml = await rawResponse.text();
  expect(rawHtml).toContain('data-prerendered-route="/projects/mission-portfolio"');
  expect(rawHtml).toContain('Mission Portfolio architecture');

  await page.goto('/projects/mission-portfolio');
  await expect(page).toHaveTitle('Mission Portfolio — Jake Sass');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/projects\/mission-portfolio$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Mission Portfolio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mission Portfolio architecture' })).toBeVisible();
  await expect(page.getByAltText(/Mission Portfolio route selection/i)).toBeVisible();
});

test('command palette navigates without initializing WebGL', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Choose your route' })).toBeVisible();
  await page.keyboard.press('Control+K');
  await expect(page.getByRole('dialog', { name: 'Mission navigation' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Search mission navigation' }).fill('QuizClone');
  await page.getByRole('option', { name: /QuizClone/ }).click();
  await expect(page).toHaveURL(/\/projects\/quizclone$/);
  await expect(page.getByRole('heading', { level: 1, name: 'QuizClone' })).toBeVisible();
});

test('returning from a shared planet URL resumes the mission map', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Direct WebGL destination hydration is exercised in Chromium.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Choose your route' })).toBeVisible();
  await page.keyboard.press('Control+K');
  await page.getByRole('combobox', { name: 'Search mission navigation' }).fill('planet Mars');
  await page.getByRole('option', { name: /Mars/ }).click();
  await expect(page.getByRole('heading', { name: 'Mars planet surface' })).toBeAttached({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Return to Space' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('navigation', { name: 'Solar system destinations' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Choose your route' })).not.toBeAttached();
});
