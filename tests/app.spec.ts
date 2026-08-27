import { expect, test } from '@playwright/test';

test('creates, persists, rehearses, and opens a recall sheet offline', async ({ page, context }) => {
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
  await context.setOffline(true);
  await page.getByRole('link', { name: /Rehearse Checkout reliability/ }).click();
  await page.getByRole('button', { name: /Begin 90-second round/ }).click();
  await expect(page.getByRole('heading', { name: 'Friday rollback' })).toBeVisible();
  await page.getByRole('button', { name: 'Reveal my evidence' }).click();
  await expect(page.getByText('Failed payments fell by 30 percent.')).toBeVisible();
  await page.getByRole('button', { name: 'Yes, I recalled it' }).click();
  await expect(page.getByRole('heading', { name: 'You found your way back' })).toBeVisible();
  await context.setOffline(false);
  await page.getByRole('link', { name: 'Recall sheet' }).click();
  await expect(page.getByRole('heading', { name: 'Ownership' })).toBeVisible();
});

test('legal pages have one main heading and a main landmark', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});
