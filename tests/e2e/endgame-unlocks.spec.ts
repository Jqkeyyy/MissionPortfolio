import { expect, test } from '@playwright/test';

const completedProgress = {
  version: 1,
  visitedPlanetIds: ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
  completionDismissed: true,
};

test('completed explorers can use every anomaly experiment', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The endgame WebGL experiments are covered in Chromium.');
  await page.addInitScript((progress) => {
    localStorage.setItem('mission-portfolio:exploration-progress:v1', JSON.stringify(progress));
  }, completedProgress);
  await page.goto('/explore/earth');
  await expect(page.getByRole('heading', { name: 'Earth planet surface' })).toBeAttached({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Return to Space' }).click();
  await expect(page.getByRole('heading', { name: 'Mission Portfolio' })).toBeVisible({ timeout: 10_000 });

  const consoleButton = page.getByRole('button', { name: 'ANOMALY CONSOLE' });
  await expect(consoleButton).toBeVisible();
  await consoleButton.click();
  await page.getByRole('button', { name: 'Land on Developer Moon' }).click();
  await expect(page.getByRole('dialog', { name: 'The Build Behind the Mission' })).toBeVisible();
  await page.getByRole('button', { name: /next log/i }).click();
  await expect(page.getByRole('heading', { name: 'Every idea needed somewhere to land' })).toBeVisible();
  await page.keyboard.press('Escape');

  await consoleButton.click();
  await page.getByRole('button', { name: 'Enable Chaos Mode' }).click();
  await expect(page.getByRole('button', { name: 'Restore Stable Universe' })).toBeVisible();
  await page.keyboard.press('Escape');

  await consoleButton.click();
  await page.getByRole('button', { name: 'Reveal the Event Horizon' }).click();
  const eventHorizon = page.getByRole('button', { name: 'Enter the event horizon' });
  await expect(eventHorizon).toBeVisible({ timeout: 10_000 });
  await eventHorizon.click();
  await expect(page.getByRole('dialog', { name: 'NULL SECTOR' })).toBeVisible();
  await page.getByRole('button', { name: /return through wormhole/i }).click();

  await consoleButton.click();
  await page.getByRole('button', { name: 'Open Cosmic Architect' }).click();
  await expect(page.getByRole('dialog', { name: 'Cosmic Architect' })).toBeVisible();
  await page.getByRole('combobox', { name: 'World' }).selectOption('earth');
  await page.getByRole('slider', { name: 'World size' }).fill('1.75');
  await page.getByRole('button', { name: 'Retrograde' }).click();
  await expect(page.getByRole('button', { name: 'Retrograde' })).toHaveAttribute('aria-pressed', 'true');
});
