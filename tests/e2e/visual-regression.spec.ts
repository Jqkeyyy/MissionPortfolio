import { expect, test } from '@playwright/test';

test('recruiter entry and flagship project retain their visual layout', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Visual baselines are intentionally generated from one stable browser engine.');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Choose your route' })).toBeVisible();
  await expect(page).toHaveScreenshot('route-selection.png');

  await page.goto('/projects/mission-portfolio');
  await expect(page.getByRole('heading', { level: 1, name: 'Mission Portfolio' })).toBeVisible();
  await expect(page).toHaveScreenshot('mission-portfolio-project.png', { fullPage: true });
});
