const SLUG = 'interview-recall-deck';
const KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${KEY}:verdict`;
const DAY = 86_400_000;

type Verdict = { valid: boolean; checkedAt: number };

function baseUrl(): string {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'https://pilot-api.sociobot.in'
    : 'https://api.sociobot.in';
}

export function checkoutUrl(): string {
  return `${baseUrl()}/api/v1/products/${SLUG}/checkout`;
}

export function captureLicense(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(KEY, token);
  localStorage.removeItem(VERDICT_KEY);
  url.searchParams.delete('license');
  history.replaceState({}, '', url.pathname + url.search + url.hash);
}

export function storeLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function isOptimisticallyUnlocked(): boolean {
  const token = localStorage.getItem(KEY);
  if (!token) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Verdict;
    return verdict.valid;
  } catch {
    return false;
  }
}

export function hasLicenseToken(): boolean {
  return Boolean(localStorage.getItem(KEY));
}

export async function verifyLicense(force = false): Promise<boolean> {
  const token = localStorage.getItem(KEY);
  if (!token) return false;
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as Verdict;
    if (!force && Date.now() - cached.checkedAt < DAY) return cached.valid;
  } catch { /* verify below */ }
  const response = await fetch(`${baseUrl()}/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('License service unavailable');
  const result = await response.json() as { valid: boolean };
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() } satisfies Verdict));
  return result.valid;
}
