/**
 * Validates `data/` and prints one line per problem plus a summary.
 * Exits with code 1 if there are errors.
 *
 * Usage: npm run validate                      (DEPLOY_ENV=production also blocks fictitious data)
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  dataFile,
  formatIssue,
  positionsFile,
  validateDataset,
  type Issue,
  type RawDataset,
} from '../src/data/validate';

const dataDir = fileURLToPath(new URL('../data/', import.meta.url));
const readErrors: Issue[] = [];

/** Reads and parses a JSON file; a missing or malformed file becomes an error. */
function readJson(rel: string, file: string): unknown {
  try {
    return JSON.parse(readFileSync(`${dataDir}${rel}`, 'utf8'));
  } catch (e) {
    const message = (e as NodeJS.ErrnoException).code === 'ENOENT' ? 'no existe' : `JSON inválido: ${(e as Error).message}`;
    readErrors.push({ file, path: [], message });
    return undefined;
  }
}

const topLevel = ['meta', 'circunscripciones', 'afirmaciones', 'partidos', 'coaliciones', 'candidaturas'] as const;
const raw = { posiciones: {} } as RawDataset;
for (const name of topLevel) raw[name] = readJson(`${name}.json`, dataFile(name));

const positionNames = readdirSync(`${dataDir}posiciones`)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -'.json'.length))
  .sort();
for (const name of positionNames) raw.posiciones[name] = readJson(`posiciones/${name}.json`, positionsFile(name));

const production = process.env.DEPLOY_ENV === 'production';
const result = validateDataset(raw, { production });
const errors = [...readErrors, ...result.errors];
const { warnings } = result;

for (const issue of errors) console.error(`✖ ${formatIssue(issue)}`);
for (const issue of warnings) console.warn(`⚠ ${formatIssue(issue)}`);

if (errors.length === 0) {
  console.log(`✔ Datos válidos (0 errores, ${warnings.length} avisos)${production ? ' [producción]' : ''}`);
} else {
  console.error(`✖ ${errors.length} errores, ${warnings.length} avisos${production ? ' [producción]' : ''}`);
  process.exitCode = 1;
}
