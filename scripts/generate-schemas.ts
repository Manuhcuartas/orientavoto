/**
 * Generates `schemas/<file>.schema.json` from the Zod schemas in
 * `src/data/schema.ts`. Output is deterministic: running it twice yields no diff.
 *
 * Usage: npm run schemas
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as z from 'zod';
import { fileSchemas } from '../src/data/schema';

const outDir = fileURLToPath(new URL('../schemas/', import.meta.url));
mkdirSync(outDir, { recursive: true });

for (const [name, schema] of Object.entries(fileSchemas)) {
  // draft-07: the draft best supported by VS Code's JSON language service.
  const jsonSchema = z.toJSONSchema(schema, { target: 'draft-07', io: 'input' });
  const file = `${name}.schema.json`;
  writeFileSync(`${outDir}${file}`, `${JSON.stringify(jsonSchema, null, 2)}\n`);
  console.log(`schemas/${file}`);
}
