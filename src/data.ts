import type { Example, Preferences, Session } from './types';

export const FREE_EXAMPLE_LIMIT = 6;

export function makePrompt(example: Example): string {
  const focus = example.competencies.length ? example.competencies.join(' and ') : 'your contribution';
  return `${example.cue || 'Walk through'} — how does ${example.title} show ${focus}?`;
}

export function evidenceParts(example: Example): { label: string; value: string }[] {
  return [
    { label: 'Situation', value: example.situation },
    { label: 'Action', value: example.action },
    { label: 'Result', value: example.result }
  ];
}

export function competencyMap(examples: Example[]): Map<string, Example[]> {
  const map = new Map<string, Example[]>();
  for (const example of examples) {
    for (const competency of example.competencies) {
      const key = competency.trim();
      if (key) map.set(key, [...(map.get(key) ?? []), example]);
    }
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export function toCsv(examples: Example[]): string {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const header = ['Project', 'Role', 'Situation', 'Action', 'Result', 'Competencies', 'Recall cue'];
  const rows = examples.map(e => [e.title, e.role, e.situation, e.action, e.result, e.competencies.join('; '), e.cue]);
  return [header, ...rows].map(row => row.map(escape).join(',')).join('\n');
}

type ExportData = { version: 1; exportedAt: string; examples: Example[]; sessions: Session[]; preferences: Preferences };

function bytesToBase64(bytes: Uint8Array): string {
  let value = '';
  for (let i = 0; i < bytes.length; i += 0x8000) value += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(value);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 250_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptExport(data: ExportData, passphrase: string): Promise<string> {
  if (passphrase.length < 8) throw new Error('Use at least 8 characters for the export passphrase.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, new TextEncoder().encode(JSON.stringify(data)));
  return JSON.stringify({ format: 'recall-deck-encrypted', version: 1, salt: bytesToBase64(salt), iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(encrypted)) });
}

export async function decryptExport(source: string, passphrase: string): Promise<ExportData> {
  try {
    const packet = JSON.parse(source) as Record<string, unknown>;
    if (packet.format !== 'recall-deck-encrypted' || packet.version !== 1) throw new Error();
    const salt = base64ToBytes(String(packet.salt));
    const iv = base64ToBytes(String(packet.iv));
    const key = await deriveKey(passphrase, salt);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, base64ToBytes(String(packet.data)) as BufferSource);
    const result = JSON.parse(new TextDecoder().decode(decrypted)) as ExportData;
    const validExample = (item: Example) => typeof item?.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(item.id)
      && ['title', 'role', 'situation', 'action', 'result', 'cue', 'createdAt', 'updatedAt'].every(key => typeof item[key as keyof Example] === 'string')
      && Array.isArray(item.competencies) && item.competencies.every(value => typeof value === 'string');
    const validSession = (item: Session) => typeof item?.id === 'string' && Array.isArray(item.results);
    if (result.version !== 1 || !Array.isArray(result.examples) || !result.examples.every(validExample) || !Array.isArray(result.sessions) || !result.sessions.every(validSession) || typeof result.preferences !== 'object') throw new Error();
    return result;
  } catch {
    throw new Error('That file or passphrase did not work. Check both and try again.');
  }
}

export function makeExport(examples: Example[], sessions: Session[], preferences: Preferences): ExportData {
  return { version: 1, exportedAt: new Date().toISOString(), examples, sessions, preferences };
}
