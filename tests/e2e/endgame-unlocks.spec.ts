import { expect, test } from '@playwright/test';

const completedProgress = {
  version: 1,
  visitedPlanetIds: ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
  completionDismissed: true,
};

test('completed explorers can use every anomaly experiment', async ({ page, browserName }) => {
  test.setTimeout(120_000);
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
  await page.keyboard.press('Escape');

  await consoleButton.click();
  await page.getByRole('button', { name: 'Open Signal Receiver' }).click();
  await expect(page.getByRole('dialog', { name: 'Alien Signal Hunt' })).toBeVisible();
  await page.getByRole('button', { name: 'Start Triangulation' }).click();
  await expect(page.getByRole('progressbar', { name: 'Signal fragments recovered' })).toHaveAttribute('aria-valuenow', '0');
  await page.keyboard.press('Escape');

  await consoleButton.click();
  await page.getByRole('button', { name: 'Track Rogue Planet' }).click();
  await expect(page.getByRole('dialog', { name: 'Rogue Planet Encounter' })).toBeVisible();
  await page.getByRole('button', { name: 'Catch the Rogue Planet' }).click();
  await expect(page.getByRole('heading', { name: 'Prototype Zero: The Page That Became a Place' })).toBeVisible();
  await page.getByRole('button', { name: 'Release and return' }).click();

  await consoleButton.click();
  await page.getByRole('button', { name: 'Start Orbit Replay' }).click();
  await expect(page.getByRole('dialog', { name: 'Mission Orbit Replay' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Portfolio mission statistics' })).toContainText('10');
  await page.getByRole('button', { name: 'Next destination' }).click();
  await page.getByRole('button', { name: 'Exit replay' }).click();

  await consoleButton.click();
  await page.getByRole('button', { name: 'Access HAB Terminal' }).click();
  await expect(page.getByRole('dialog', { name: 'Secret HAB Terminal' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Enter terminal command' }).fill('coffee');
  await page.getByRole('button', { name: 'Execute' }).click();
  await expect(page.getByLabel('Terminal output')).toContainText('competent TypeScript');
  await page.keyboard.press('Escape');

  await consoleButton.click();
  await page.getByRole('button', { name: 'Open Fusion Chamber' }).click();
  await expect(page.getByRole('dialog', { name: 'Planet Fusion' })).toBeVisible();
  await page.getByRole('button', { name: 'Fuse into Marsurn' }).click();
  await expect(page.getByRole('button', { name: 'Release Marsurn' })).toBeVisible();
  await page.keyboard.press('Escape');

  await consoleButton.click();
  await page.getByRole('button', { name: 'Equip Gravity Gun' }).click();
  await expect(page.getByRole('dialog', { name: 'Gravity Gun' })).toBeVisible();
  await page.getByRole('button', { name: /Push right/ }).click();
  await page.getByRole('button', { name: /Push right/ }).click();
  await page.getByRole('button', { name: 'Restore all orbits' }).click();
  await page.getByRole('button', { name: 'Close Gravity Gun' }).click();

  await consoleButton.click();
  await page.getByRole('button', { name: 'Deploy M-0' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Interact with maintenance companion M-0' })).toBeVisible();
  await page.getByRole('button', { name: 'Interact with maintenance companion M-0' }).click({ force: true });

  await consoleButton.click();
  await page.getByRole('button', { name: 'Enter Rhythm Lock' }).click();
  await expect(page.getByRole('dialog', { name: 'Disco Sun' })).toBeVisible();
  await page.getByRole('button', { name: 'Use accessible activation' }).click();
  await expect(page.getByRole('button', { name: 'Restore quiet Sun' })).toBeVisible();
  await page.keyboard.press('Escape');

  await consoleButton.click();
  await page.getByRole('button', { name: 'Inspect Classified Challenge' }).click();
  await expect(page.getByRole('dialog', { name: 'The Impossible Achievement' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'REALITY WARRANTY VOIDED' })).toBeVisible();
  await page.keyboard.press('Escape');

  await consoleButton.click();
  await page.getByRole('button', { name: 'Arm Supernova' }).click();
  await expect(page.getByRole('dialog', { name: 'Supernova protocol' })).toBeVisible();
  await page.getByRole('button', { name: 'Initiate supernova' }).click();
  await page.getByRole('button', { name: 'Enter New Game+' }).click({ timeout: 5_000 });
  await consoleButton.click();
  await page.getByRole('button', { name: 'Restore Original Timeline' }).click();
});
