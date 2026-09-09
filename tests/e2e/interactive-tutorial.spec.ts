import { expect, test } from '@playwright/test';

test('tutorial points through the Sun, base camp, computer, and mission files', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The hands-on WebGL tutorial is covered in Chromium.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await page.getByRole('button', { name: 'Start tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Start with the Sun' })).toBeVisible();
  await expect(page.locator('[data-tutorial-target="sun"]')).toBeVisible({ timeout: 15_000 });

  const destinations = page.getByRole('navigation', { name: 'Solar system destinations' });
  await destinations.getByRole('button', { name: /Intro (Visited|Not visited)$/ }).click();
  await expect(page.getByRole('heading', { name: 'Enter the base camp' })).toBeVisible({ timeout: 10_000 });

  await page.locator('[data-tutorial-target="base-camp"]').click();
  await expect(page.getByRole('heading', { name: 'Sit at the computer' })).toBeVisible();
  await page.locator('[data-tutorial-target="sit-computer"]').click();

  await expect(page.getByRole('heading', { name: 'Open Mission Archive' })).toBeVisible();
  await page.locator('[data-tutorial-target="mission-archive"]').click({ timeout: 10_000 });
  await page.locator('[data-tutorial-target="file-intro-1"]').click();
  await page.locator('[data-tutorial-target="close-mission-file"]').click();
  await page.locator('[data-tutorial-target="file-intro-2"]').click();

  await expect(page.getByRole('heading', { name: 'You are ready to explore' })).toBeVisible();
});
