import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates, persists, rehearses, and opens a recall sheet offline', async ({ page, context }) => {
  const consoleErrors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByRole('link', { name: 'Add your first example' }).first().click();
  await page.getByLabel('Project or moment').fill('Checkout reliability');
  await page.getByLabel('Your role').fill('Lead engineer');
  await page.getByLabel('Competencies').fill('Ownership, Debugging');
  await page.getByLabel('Situation').fill('Retries were hiding payment failures before launch.');
  await page.getByLabel('Your action').fill('I traced the timeout and coordinated a safe rollback.');
  await page.getByLabel('Result or learning').fill('Failed payments fell by 30 percent.');
  await page.getByLabel('Recall cue').fill('Friday rollback');
  await page.getByRole('button', { name: 'Save example' }).click();
  await expect(page.getByRole('heading', { name: 'Checkout reliability' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Checkout reliability' })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.waitForFunction(async () => {
    const script = document.querySelector<HTMLScriptElement>('script[type="module"]')?.src;
    return Boolean(script && await caches.match(script));
  });
  await context.setOffline(true);
  await expect(page.getByText('Offline — your saved deck still works here.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Checkout reliability' })).toBeVisible();
  await page.getByRole('link', { name: /Rehearse Checkout reliability/ }).click();
  await page.getByRole('button', { name: /Begin 90-second round/ }).click();
  await expect(page.getByRole('heading', { name: 'Friday rollback' })).toBeVisible();
  await page.getByRole('button', { name: 'Reveal my evidence' }).click();
  await expect(page.getByText('Failed payments fell by 30 percent.')).toBeVisible();
  await page.getByRole('button', { name: 'Yes, I recalled it' }).click();
  await expect(page.getByRole('heading', { name: 'You found your way back' })).toBeVisible();
  await context.setOffline(false);
  await page.getByRole('link', { name: 'Recall sheet', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ownership' })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('legal pages have one main heading and a main landmark', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});

test('home has no serious or critical automated accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});
