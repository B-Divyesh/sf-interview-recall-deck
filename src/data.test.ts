import { describe, expect, it } from 'vitest';
import { competencyMap, decryptExport, encryptExport, makeExport, makePrompt, toCsv } from './data';
import { defaultPreferences, type Example } from './types';

const example: Example = { id: 'one', title: 'Checkout launch', role: 'Engineer', situation: 'Payments failed.', action: 'I traced the timeout.', result: 'Failures fell 30%.', competencies: ['Debugging', 'Ownership'], cue: 'Friday rollback', createdAt: '2026-01-01', updatedAt: '2026-01-01' };

describe('recall data helpers', () => {
  it('builds a truthful cue from stored user fields', () => expect(makePrompt(example)).toBe('Friday rollback — how does Checkout launch show Debugging and Ownership?'));
  it('groups examples by competency', () => expect(competencyMap([example]).get('Ownership')).toEqual([example]));
  it('escapes readable CSV data', () => expect(toCsv([{ ...example, result: 'Saved "30%", safely' }])).toContain('"Saved ""30%"", safely"'));
  it('round trips an encrypted backup and rejects a wrong passphrase', async () => {
    const exported = makeExport([example], [], defaultPreferences);
    const encrypted = await encryptExport(exported, 'correct horse');
    await expect(decryptExport(encrypted, 'correct horse')).resolves.toMatchObject({ examples: [{ title: 'Checkout launch' }] });
    await expect(decryptExport(encrypted, 'wrong horse')).rejects.toThrow('did not work');
  });
  it('requires a useful export passphrase', async () => await expect(encryptExport(makeExport([], [], defaultPreferences), 'short')).rejects.toThrow('8 characters'));
});
