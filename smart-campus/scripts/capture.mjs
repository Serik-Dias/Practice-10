import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const [name, ...args] = process.argv.slice(2);
if (!name || !/^[\w-]+$/.test(name)) throw new Error('Provide a simple log name');
const dir = path.resolve('../evidence/logs');
mkdirSync(dir, { recursive: true });
const run = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--reporter=verbose', ...args], { encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' } });
// Do not publish local usernames or absolute paths in evidence logs.
const redact = value => (value || '').replaceAll(process.cwd(), '<project>/smart-campus');
const text = `Captured UTC: ${new Date().toISOString()}\nCommand: npx vitest run --reporter=verbose ${args.join(' ')}\nNode: ${process.version}\n\n${redact(run.stdout)}${redact(run.stderr)}\nEXIT_CODE=${run.status}\n`;
writeFileSync(path.join(dir, name + '.txt'), text);
console.log(text);
process.exitCode = run.status ?? 1;
