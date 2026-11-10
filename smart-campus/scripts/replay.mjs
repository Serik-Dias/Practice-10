// Reproduce recorded controlled defects in a disposable directory, never in src/.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, cpSync, symlinkSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(project, 'replay-output');
const temp = path.join(output, 'trial');
mkdirSync(output, { recursive: true });
rmSync(temp, { recursive: true, force: true });
mkdirSync(temp);
cpSync(path.join(project, 'src'), path.join(temp, 'src'), { recursive: true });
cpSync(path.join(project, 'vite.config.js'), path.join(temp, 'vite.config.js'));
cpSync(path.join(project, 'package.json'), path.join(temp, 'package.json'));
symlinkSync(path.join(project, 'node_modules'), path.join(temp, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
const clean = readFileSync(path.join(project, 'src/booking.js'), 'utf8');
const trials = [
  ['clean-baseline', clean, [], 0],
  ['bug-a-failing', clean.replace('start < booking.end && end > booking.start', 'start <= booking.end && end >= booking.start'), ['src/booking.test.js'], 1],
  ['bug-a-fixed-target', clean, ['src/booking.test.js', '-t', 'T01|T08'], 0],
  ['bug-a-fixed-full', clean, [], 0],
  ['bug-b-failing', clean.replace('  if (bookings.some', '  bookings.sort((a, b) => a.start - b.start);\n  if (bookings.some'), ['src/booking.test.js'], 1],
  ['bug-b-fixed-target', clean, ['src/booking.test.js', '-t', 'T15|T25'], 0],
  ['bug-b-fixed-full', clean, [], 0],
];
let mismatch = false;
try {
  for (const [name, source, args, expected] of trials) {
    writeFileSync(path.join(temp, 'src/booking.js'), source);
    const result = spawnSync(process.execPath, [path.join(project, 'node_modules/vitest/vitest.mjs'), 'run', '--reporter=verbose', ...args], { cwd: temp, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' } });
    const log = `Replay UTC: ${new Date().toISOString()}\nCommand: npx vitest run --reporter=verbose ${args.join(' ')}\n\n${result.stdout || ''}${result.stderr || ''}\nEXIT_CODE=${result.status}\n`;
    writeFileSync(path.join(output, name + '.txt'), log);
    // An assertion mismatch is necessary; import/syntax errors do not count as detection.
    const detected = expected === 0 || /AssertionError/.test(log);
    const valid = result.status === expected && detected;
    mismatch ||= !valid;
    console.log(`${name}: exit ${result.status}, expected ${expected}; ${valid ? 'verified' : 'UNEXPECTED — inspect log'}`);
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
console.log('Original source was never modified. Replay logs: replay-output/');
process.exitCode = mismatch ? 1 : 0;
