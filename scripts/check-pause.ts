/**
 * Builds the site as it would be during the reflection-day pause and checks that no
 * page carries anything about the parties: only the neutral notice, no quiz island,
 * no party names or acronyms from the content folder.
 *
 * Usage: npm run check:pausa   (uses data/, or ORIENTAVOTO_DATA)
 */
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = join(root, 'dist-pausa');
const dataDir = resolve(root, process.env.ORIENTAVOTO_DATA ?? 'data');
const NOTICE = 'Orientavoto está en pausa';
const IN_WINDOW = '2026-11-28T12:00:00+01:00';

rmSync(outDir, { recursive: true, force: true });
execSync(`npx astro build --outDir ${outDir}`, {
  cwd: root,
  stdio: 'ignore',
  env: { ...process.env, ORIENTAVOTO_NOW: IN_WINDOW },
});

const readJson = <T>(file: string): T => JSON.parse(readFileSync(join(dataDir, file), 'utf8')) as T;
type Named = { nombre: { es: string }; siglas: string };
const forbidden = [...readJson<Named[]>('partidos.json'), ...readJson<Named[]>('coaliciones.json')].flatMap((e) => [
  e.nombre.es,
  e.siglas,
]);

const problems: string[] = [];
const pages = readdirSync(outDir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.html'));
for (const page of pages) {
  const html = readFileSync(join(outDir, page), 'utf8');
  if (!html.includes(NOTICE)) problems.push(`${page}: falta el aviso de pausa`);
  if (html.includes('astro-island')) problems.push(`${page}: incluye una isla (y sus datos)`);
  // Whole-word match so short acronyms do not match inside ordinary words.
  for (const text of forbidden) {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`(^|[^\\p{L}])${escaped}([^\\p{L}]|$)`, 'u').test(html)) problems.push(`${page}: menciona «${text}»`);
  }
}

rmSync(outDir, { recursive: true, force: true });
for (const p of problems) console.error(`✖ ${p}`);
if (pages.length === 0) problems.push('no se generó ninguna página');
console.log(
  problems.length === 0
    ? `✔ Pausa correcta: ${pages.length} páginas solo con el aviso, sin partidos ni islas`
    : `✖ ${problems.length} problemas en la versión en pausa`,
);
if (problems.length > 0) process.exitCode = 1;
