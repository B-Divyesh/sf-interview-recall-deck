import { expect, test, type Page } from '@playwright/test';
import { readFile, stat } from 'node:fs/promises';

async function createExample(page: Page, title: string): Promise<void> {
  await page.goto('/edit');
  await page.getByLabel('Project or moment').fill(title);
  await page.getByLabel('Your role').fill('Lead engineer');
  await page.getByLabel('Interview skills').fill('Ownership, Debugging');
  await page.getByLabel('Situation').fill('Retries hid payment failures before launch.');
  await page.getByLabel('Your action').fill('I traced the timeout and coordinated a safe rollback.');
  await page.getByLabel('Result or learning').fill('Failed payments fell by 30 percent.');
  await page.getByLabel('Recall cue').fill('Friday rollback');
  await page.getByRole('button', { name: 'Save example' }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

async function databaseNames(page: Page): Promise<string[]> {
  return page.evaluate(async () => (await indexedDB.databases()).map(item => item.name ?? ''));
}

async function storedExamples(page: Page, name: string): Promise<unknown[]> {
  return page.evaluate(async databaseName => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction('examples');
    const rows = await new Promise<unknown[]>((resolve, reject) => {
      const request = transaction.objectStore('examples').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return rows;
  }, name);
}

test('@claim:example-cards preserves exact evidence and never generates an answer', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Try three interview examples' })).toBeVisible();
  await expect(page.getByText('Payment retries hid failures two weeks before launch.')).toHaveCount(0);
  await page.getByRole('link', { name: /Edit sample Checkout reliability launch/ }).click();
  await expect(page.getByLabel('Situation')).toHaveValue('Payment retries hid failures two weeks before launch.');
  await expect(page.getByLabel('Your action')).toHaveValue('I traced the timeout, paired with support, and led a staged rollback.');
  await expect(page.getByLabel('Result or learning')).toHaveValue('Failed payments fell from 4.2% to 0.8% before launch.');
  await expect(page.getByText('The app does not invent experience.')).toBeVisible();
});

test('@claim:rehearsal-controls supports both free durations and all round states', async ({ page }) => {
  await page.goto('/settings?demo=1');
  await page.getByLabel('Time per example').selectOption('60');
  await page.getByRole('button', { name: 'Save comfort settings' }).click();
  await page.goto('/rehearse?id=demo-checkout&demo=1');
  await page.getByRole('button', { name: 'Begin 60-second round' }).click();
  await expect(page.locator('#timer-value')).toHaveText('1:00');
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await page.getByRole('button', { name: 'Reveal my evidence' }).click();
  await page.getByRole('button', { name: 'Yes, I recalled it' }).click();
  await expect(page.getByRole('heading', { name: 'You found your way back' })).toBeVisible();
  await page.goto('/settings?demo=1');
  await page.getByLabel('Time per example').selectOption('90');
  await page.getByRole('button', { name: 'Save comfort settings' }).click();
  await page.goto('/rehearse?id=demo-checkout&demo=1');
  await expect(page.getByRole('button', { name: 'Begin 90-second round' })).toBeVisible();
});

test('@claim:sample-deck starts with three work examples and Reset demo restores them', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Checkout reliability launch' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'New-starter onboarding' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'At-risk customer renewal' })).toBeVisible();
  await page.getByRole('link', { name: /Edit sample Checkout reliability launch/ }).click();
  await page.getByLabel('Project or moment').fill('Changed sample title');
  await page.getByRole('button', { name: 'Save example' }).click();
  await expect(page.getByRole('heading', { name: 'Changed sample title' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page).toHaveURL(/\/demo(?:\?demo=1)?$/);
  await expect(page.getByRole('heading', { name: 'Checkout reliability launch' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Changed sample title' })).toHaveCount(0);
  await expect(page.locator('.memory-card')).toHaveCount(3);
});

test('@claim:local-private keeps demo data separate through history and legal routes', async ({ page }) => {
  const outbound: string[] = [];
  page.on('request', request => { if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') outbound.push(request.url()); });
  await createExample(page, 'Real marker');
  const realBefore = await storedExamples(page, 'interview-recall-deck');
  await page.goto('/demo');
  expect(await databaseNames(page)).toContain('demo:interview-recall-deck');
  await expect(page.getByText('Demo — sample data, nothing is saved to your deck')).toBeVisible();
  await page.getByRole('link', { name: /Edit sample Checkout reliability launch/ }).click();
  await page.getByLabel('Project or moment').fill('Edited only in demo');
  await page.getByRole('button', { name: 'Save example' }).click();
  await expect(page).toHaveURL('/deck?demo=1');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Edited only in demo' })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/edit\?id=demo-checkout&demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved to your deck')).toBeVisible();
  await page.getByRole('link', { name: 'Cancel' }).click();
  await expect(page).toHaveURL('/deck?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved to your deck')).toBeVisible();
  await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL('/privacy?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved to your deck')).toBeVisible();
  await page.getByRole('contentinfo').getByRole('link', { name: 'Terms' }).click();
  await expect(page).toHaveURL('/terms?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved to your deck')).toBeVisible();
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Deck', exact: true }).click();
  await expect(page).toHaveURL('/deck?demo=1');
  await expect(page.getByRole('heading', { name: 'Edited only in demo' })).toBeVisible();
  expect(await storedExamples(page, 'interview-recall-deck')).toEqual(realBefore);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.snapshot dd').first()).toHaveText('1');
  await expect(page.getByText('Demo — sample data, nothing is saved to your deck')).toHaveCount(0);
  await page.goto('/deck');
  await expect(page.getByRole('heading', { name: 'Real marker' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Edited only in demo' })).toHaveCount(0);
  expect(await storedExamples(page, 'interview-recall-deck')).toEqual(realBefore);
  expect(await databaseNames(page)).not.toContain('demo:interview-recall-deck');
  expect(outbound).toEqual([]);
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
});

test('@claim:offline-reload reloads and uses the sample deck offline', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const failed = await page.evaluate(async () => {
    const cache = await caches.keys();
    return cache.length === 0;
  });
  expect(failed).toBe(false);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Offline — your saved deck still works here.')).toBeVisible();
  await page.getByRole('link', { name: /Rehearse Checkout reliability launch/ }).click();
  await expect(page.getByRole('button', { name: 'Begin 90-second round' })).toBeVisible();
});

test('@claim:recall-sheet groups sample cards and invokes print', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'print', { value: () => { document.body.dataset.printed = 'yes'; } }); });
  await page.goto('/sheet?demo=1');
  await expect(page.getByRole('heading', { name: 'Ownership' })).toBeVisible();
  await expect(page.getByText('Checkout reliability launch').first()).toBeVisible();
  await page.getByRole('button', { name: 'Print or save PDF' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-printed', 'yes');
  expect(await page.locator('.recall-sheet').evaluate(el => getComputedStyle(el).getPropertyValue('max-width'))).toBeTruthy();
});

test('@claim:speech-actions starts speech services only after their buttons', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { speechCalls: string[] }).speechCalls = [];
    Object.defineProperty(window, 'speechSynthesis', { value: { cancel: () => {}, speak: () => (window as unknown as { speechCalls: string[] }).speechCalls.push('speak') } });
    class Recognition { continuous = false; interimResults = false; onresult = () => {}; onerror = () => {}; onend = () => {}; start() { (window as unknown as { speechCalls: string[] }).speechCalls.push('dictate'); } }
    Object.defineProperty(window, 'SpeechRecognition', { value: Recognition });
  });
  await page.goto('/rehearse?id=demo-checkout&demo=1');
  await page.getByRole('button', { name: /Begin 90-second round/ }).click();
  expect(await page.evaluate(() => (window as unknown as { speechCalls: string[] }).speechCalls)).toEqual([]);
  await page.getByRole('button', { name: 'Read prompt' }).click();
  await page.getByRole('button', { name: 'Start dictation' }).click();
  expect(await page.evaluate(() => (window as unknown as { speechCalls: string[] }).speechCalls)).toEqual(['speak', 'dictate']);
});

test('@claim:encrypted-backup exports ciphertext and restores exact data', async ({ page }) => {
  await createExample(page, 'Encrypted export proof');
  await page.goto('/settings');
  await page.getByLabel('Export passphrase').fill('correct horse battery staple');
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const download = await waiting;
  const content = await readFile((await download.path())!);
  expect(JSON.parse(content.toString())).toMatchObject({ format: 'recall-deck-encrypted', version: 1 });
  expect(content.toString()).not.toContain('Encrypted export proof');
  await page.getByLabel('Encrypted backup file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: content });
  await page.getByLabel('Backup passphrase').fill('correct horse battery staple');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Replace deck from backup' }).click();
  await expect(page.getByRole('heading', { name: 'Encrypted export proof' })).toBeVisible();
});

test('@claim:csv-export exports one readable row per sample record', async ({ page }) => {
  await page.goto('/settings?demo=1');
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export readable CSV' }).click();
  const content = await readFile((await (await waiting).path())!, 'utf8');
  const rows = content.trim().split('\n');
  expect(rows).toHaveLength(4);
  expect(rows[0]).toContain('"Situation","Action","Result"');
  expect(content).toContain('"Checkout reliability launch"');
});

test('@claim:pwa-install registers a versioned complete app-shell cache', async ({ page, request }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const state = await page.evaluate(async () => ({ registrations: (await navigator.serviceWorker.getRegistrations()).length, keys: await caches.keys(), configCached: Boolean(await caches.match('/staticwebapp.config.json')) }));
  expect(state.registrations).toBe(1);
  expect(state.keys.some(key => /^recall-deck-/.test(key))).toBe(true);
  expect(state.configCached).toBe(false);
  expect((await request.get('/manifest.webmanifest')).ok()).toBe(true);
  expect((await request.get('/staticwebapp.config.json')).status()).toBe(404);
});

test('@claim:free-entitlements enforces six examples while keeping core tools free', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('interview-recall-deck', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction('examples', 'readwrite');
    for (let index = 1; index <= 6; index++) transaction.objectStore('examples').put({ id: `limit-${index}`, title: `Example ${index}`, role: 'Engineer', situation: 'A real situation.', action: 'I took a clear action.', result: 'The work had a result.', competencies: ['Ownership'], cue: `Cue ${index}`, createdAt: `2026-01-0${index}T00:00:00.000Z`, updatedAt: `2026-01-0${index}T00:00:00.000Z` });
    await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
    database.close();
  });
  await page.goto('/edit');
  await expect(page.getByRole('heading', { name: 'Your six examples are ready' })).toBeVisible();
  await page.goto('/rehearse');
  await expect(page.getByRole('button', { name: /Begin 90-second rounds/ })).toBeVisible();
  await page.goto('/sheet');
  await expect(page.getByRole('button', { name: 'Print or save PDF' })).toBeVisible();
  await page.goto('/settings');
  await expect(page.getByRole('button', { name: 'Download encrypted backup' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export readable CSV' })).toBeVisible();
  await expect(page.getByLabel('Reduce motion')).toBeVisible();
});

test('@claim:accessible-mobile supports keyboard, focus, reduced motion, targets, and 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  const outline = await page.getByRole('link', { name: 'Skip to main content' }).evaluate(el => getComputedStyle(el).outlineWidth);
  expect(parseFloat(outline)).toBeGreaterThanOrEqual(3);
  await page.goto('/settings');
  await page.getByLabel('Reduce motion').focus();
  await page.keyboard.press('Space');
  await expect(page.getByLabel('Reduce motion')).toBeChecked();
  for (const route of ['/settings', '/privacy', '/terms']) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const undersized = await page.locator('a:visible,button:visible,input:visible,select:visible').evaluateAll(nodes => nodes.filter(node => { const box = node.getBoundingClientRect(); return box.width < 44 || box.height < 44; }).map(node => `${node.tagName}:${node.textContent?.trim()}`));
    expect(undersized, route).toEqual([]);
  }
});

test('@claim:passphrase-private never stores a passphrase and rejects a wrong one', async ({ page }) => {
  await createExample(page, 'Passphrase privacy');
  await page.goto('/settings');
  const passphrase = 'private phrase 8675309';
  await page.getByLabel('Export passphrase').fill(passphrase);
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const content = await readFile((await (await waiting).path())!);
  expect(content.toString()).not.toContain(passphrase);
  expect(await page.evaluate(key => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }).includes(key), passphrase)).toBe(false);
  await page.getByLabel('Encrypted backup file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: content });
  await page.getByLabel('Backup passphrase').fill('definitely wrong');
  await page.getByRole('button', { name: 'Replace deck from backup' }).click();
  await expect(page.getByText('That file or passphrase did not work. Check both and try again.')).toBeVisible();
});

test('@claim:license-restore verifies an existing Sociobot license without provider secrets', async ({ page }) => {
  await page.route('https://pilot-api.sociobot.in/api/v1/products/interview-recall-deck/verify?license=existing-token', route => route.fulfill({ contentType: 'application/json', body: '{"valid":true,"reason":"ok"}' }));
  await page.goto('/settings');
  await expect(page.getByRole('link', { name: /Buy/ })).toHaveCount(0);
  await page.getByLabel('Already bought it? Paste your license').fill('existing-token');
  await page.getByRole('button', { name: 'Verify and restore' }).click();
  await expect(page.getByRole('heading', { name: 'Unlimited is active' })).toBeVisible();
  const source = await readFile('src/license.ts', 'utf8');
  expect(source).not.toMatch(/dodo.*secret|sk_(live|test)_/i);
});

test('@claim:purchase-unavailable shows no checkout action for new licenses', async ({ page }) => {
  const checkoutRequests: string[] = [];
  page.on('request', request => { if (request.url().includes('/checkout')) checkoutRequests.push(request.url()); });
  await page.goto('/settings?demo=1');
  await expect(page.getByRole('heading', { name: 'Purchases are paused' })).toBeVisible();
  await expect(page.getByText('New $9 licenses are currently unavailable.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Buy|Checkout|Purchase/ })).toHaveCount(0);
  expect(checkoutRequests).toEqual([]);
});

test('@claim:static-deploy serves real routes and sends malformed routes to the shared 404', async ({ request, page }) => {
  await expect(stat('dist/index.html')).resolves.toBeTruthy();
  for (const route of ['/deck', '/edit?id=example_123', '/rehearse?id=example_123', '/privacy', '/terms']) expect((await request.get(route)).status(), route).toBe(200);
  for (const route of ['/does-not-exist', '/deck/junk', '/privacy/junk', '/edit/not-a-real-id/extra', '/rehearse/example_123/extra']) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toBeVisible();
  }
});
