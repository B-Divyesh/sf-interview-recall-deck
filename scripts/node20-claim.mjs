import { spawn } from 'node:child_process';

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', env: { ...process.env, REQUIRE_NODE_20: '1' }, ...options });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
  });
}

if (!process.versions.node.startsWith('20.')) throw new Error(`Expected Node 20, received ${process.version}.`);

await run('npx', ['--yes', '--package=node@20', '--package=npm@10', 'npm', 'ci']);
await run(process.execPath, ['./node_modules/vitest/vitest.mjs', 'run', '-t', '@claim:node20']);
await run(process.execPath, ['./node_modules/typescript/bin/tsc', '--noEmit']);
await run(process.execPath, ['./scripts/generate-icons.mjs']);
await run(process.execPath, ['./node_modules/vite/bin/vite.js', 'build']);
await run(process.execPath, ['./scripts/generate-sw.mjs']);
