import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function createExample(page: import('@playwright/test').Page, title = 'Checkout reliability'): Promise<void> {
  await page.goto('/edit');
  await page.getByLabel('Project or moment').fill(title);
  await page.getByLabel('Your role').fill('Lead engineer');
  await page.getByLabel('Interview skills').fill('Ownership, Debugging');
  await page.getByLabel('Situation').fill('Retries were hiding payment failures before launch.');
  await page.getByLabel('Your action').fill('I traced the timeout and coordinated a safe rollback.');
  await page.getByLabel('Result or learning').fill('Failed payments fell by 30 percent.');
  await page.getByLabel('Recall cue').fill('Friday rollback');
  await page.getByRole('button', { name: 'Save example' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

test('creates, persists, rehearses, and opens a recall sheet offline', async ({ page, context }) => {
  const consoleErrors: string[] = [];
  const outboundRequests: string[] = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outboundRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await createExample(page);
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
  expect(outboundRequests).toEqual([]);
});

test('legal pages have one main heading and a main landmark', async ({ page }) => {
  for (const path of ['/privacy', '/terms']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});

test('real routes set metadata, focus headings, support history, and return a real 404', async ({ page, request }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Deck', exact: true }).click();
  await expect(page).toHaveURL('/deck');
  await expect(page).toHaveTitle('Deck — Interview Recall Deck');
  await expect(page.locator('h1')).toBeFocused();
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('http://127.0.0.1:4173/deck');
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toBeFocused();
  const missing = await request.get('/does-not-exist');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('This page is not in your deck');
});

test('every route uses the shared legal links and route-specific title', async ({ page }) => {
  const routes = ['/', '/demo', '/deck', '/edit', '/rehearse', '/sheet', '/settings', '/privacy', '/terms'];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toBeVisible();
    if (route === '/') await expect(page).toHaveTitle('Interview Recall Deck — rehearse work examples');
    else await expect(page).not.toHaveTitle('Interview Recall Deck — rehearse work examples');
  }
  const response = await page.goto('/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Deck', exact: true })).toBeVisible();
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' })).toBeVisible();
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toBeVisible();
});

test('every app route has no serious or critical automated accessibility violations', async ({ page }) => {
  for (const route of ['/', '/demo', '/deck', '/edit', '/rehearse', '/sheet', '/settings', '/privacy', '/terms', '/does-not-exist']) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? '')), route).toEqual([]);
  }
});

test('downloads and restores an encrypted deck backup with named form controls', async ({ page }) => {
  await createExample(page, 'Encrypted export proof');
  await page.goto('/settings');
  await page.getByLabel('Export passphrase').fill('correct horse battery staple');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^recall-deck-backup-\d{4}-\d{2}-\d{2}\.json$/);
  const downloadedPath = await download.path();
  expect(downloadedPath).not.toBeNull();
  const encrypted = await readFile(downloadedPath!);
  expect(JSON.parse(encrypted.toString())).toMatchObject({ format: 'recall-deck-encrypted', version: 1 });
  expect(encrypted.toString()).not.toContain('Encrypted export proof');
  await expect(page.getByText('Encrypted backup downloaded.')).toBeVisible();

  await page.getByLabel('Encrypted backup file').setInputFiles({
    name: download.suggestedFilename(),
    mimeType: 'application/json',
    buffer: encrypted
  });
  await page.getByLabel('Backup passphrase').fill('correct horse battery staple');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Replace deck from backup' }).click();
  await expect(page).toHaveURL(/\/deck$/);
  await expect(page.getByRole('heading', { name: 'Encrypted export proof' })).toBeVisible();
});

test('restores a pasted license with its named form control', async ({ page }) => {
  const token = 'restored-license-token';
  await page.route('https://pilot-api.sociobot.in/api/v1/products/interview-recall-deck/verify?license=restored-license-token', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok' })
  }));
  await page.goto('/settings');
  await page.getByLabel('Already bought it? Paste your license').fill(token);
  await page.getByRole('button', { name: 'Verify and restore' }).click();
  await expect(page.getByRole('heading', { name: 'Unlimited is active' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sb_license:interview-recall-deck'))).toBe(token);
});

test('keeps the skip link and reduced-motion control keyboard operable without overflow', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.goto('/settings');
  const reduceMotion = page.getByLabel('Reduce motion');
  await reduceMotion.focus();
  await page.keyboard.press('Space');
  await expect(reduceMotion).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
