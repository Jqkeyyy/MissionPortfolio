import { expect, test } from '@playwright/test';

const expectArrowCentered = async (page: import('@playwright/test').Page) => {
  const highlight = page.getByTestId('tutorial-highlight');
  const arrow = page.getByTestId('tutorial-arrow');
  await expect(highlight).toBeVisible();
  await expect(arrow).toBeVisible();
  const [highlightBox, arrowBox] = await Promise.all([highlight.boundingBox(), arrow.boundingBox()]);
  expect(highlightBox).not.toBeNull();
  expect(arrowBox).not.toBeNull();
  const highlightCenter = highlightBox!.x + highlightBox!.width / 2;
  const arrowCenter = arrowBox!.x + arrowBox!.width / 2;
  expect(Math.abs(highlightCenter - arrowCenter)).toBeLessThan(1);
};

test('tutorial points through the Sun, HAB workflow, and onward planet travel', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The hands-on WebGL tutorial is covered in Chromium.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await page.getByRole('button', { name: 'Start tutorial' }).click();
  await expect(page.getByRole('heading', { name: 'Start with the Sun' })).toBeVisible();
  const sunTarget = page.locator('[data-tutorial-target="sun"]');
  await expect(sunTarget).toBeVisible({ timeout: 15_000 });
  await expect(sunTarget).toHaveAttribute('data-tutorial-highlight', 'three-dimensional');
  await expect(page.getByTestId('tutorial-arrow')).toBeVisible();
  await expect(page.getByTestId('tutorial-highlight')).toHaveCount(0);

  const destinations = page.getByRole('navigation', { name: 'Solar system destinations' });
  await destinations.getByRole('button', { name: /Intro (Visited|Not visited)$/ }).click();
  await expect(page.getByRole('heading', { name: 'Enter the base camp' })).toBeVisible({ timeout: 10_000 });
  await expectArrowCentered(page);

  await page.locator('[data-tutorial-target="base-camp"]').click();
  await expect(page.getByRole('heading', { name: 'Sit at the computer' })).toBeVisible();
  await expectArrowCentered(page);
  await page.locator('[data-tutorial-target="sit-computer"]').click();

  await expect(page.getByRole('heading', { name: 'Open Mission Archive' })).toBeVisible();
  await expectArrowCentered(page);
  await page.locator('[data-tutorial-target="mission-archive"]').click({ timeout: 10_000 });
  await expect(page.getByRole('heading', { name: 'Open Welcome, Pilot' })).toBeVisible();
  await expectArrowCentered(page);
  await page.locator('[data-tutorial-target="file-intro-1"]').click();
  await expect(page.getByRole('heading', { name: 'Return to the archive' })).toBeVisible();
  await expectArrowCentered(page);
  await page.locator('[data-tutorial-target="close-mission-file"]').click();
  await expect(page.getByRole('heading', { name: 'Open Mission Brief' })).toBeVisible();
  await expectArrowCentered(page);
  await page.locator('[data-tutorial-target="file-intro-2"]').click();

  await expect(page.getByRole('heading', { name: 'Stand up from the computer' })).toBeVisible();
  await expectArrowCentered(page);
  await page.getByRole('button', { name: 'Stand up from the mission computer' }).click();
  await expect(page.getByRole('heading', { name: 'Return to the surface' })).toBeVisible();
  await expectArrowCentered(page);
  await page.getByRole('button', { name: 'Exit through the habitat airlock' }).click();
  await expect(page.getByRole('heading', { name: 'Choose another planet' })).toBeVisible();
  await expectArrowCentered(page);
  await page.getByRole('button', { name: 'Travel to next planet' }).click();
  await expect(page.getByRole('heading', { name: 'You are ready to explore' })).toBeVisible({ timeout: 10_000 });
});
