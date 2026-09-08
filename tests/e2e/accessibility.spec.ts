import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const expectNoAxeViolations = async (page: Parameters<typeof AxeBuilder>[0]['page']) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
};

test('route chooser, portfolio, project, and command palette pass automated accessibility checks', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'The deterministic axe gate runs once in Chromium.');
  await page.goto('/');
  await expectNoAxeViolations(page);

  await page.goto('/portfolio');
  await expect(page.getByRole('heading', { name: 'Jake Sass' })).toBeVisible();
  await expectNoAxeViolations(page);

  await page.goto('/projects/mission-portfolio');
  await expect(page.getByRole('heading', { level: 1, name: 'Mission Portfolio' })).toBeVisible();
  await expectNoAxeViolations(page);

  await page.keyboard.press('Control+K');
  await expect(page.getByRole('dialog', { name: 'Mission navigation' })).toBeVisible();
  await expectNoAxeViolations(page);
});
