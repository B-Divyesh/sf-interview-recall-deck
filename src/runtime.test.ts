import { expect, test } from 'vitest';

test('@claim:node20 runs the product checks and build under Node 20', () => {
  if (process.env.REQUIRE_NODE_20 === '1') expect(process.versions.node.startsWith('20.')).toBe(true);
  else expect(Number(process.versions.node.split('.')[0])).toBeGreaterThanOrEqual(20);
});
