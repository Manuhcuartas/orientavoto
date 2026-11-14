import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fileSchemas, type LocalizedText } from '../../src/data/schema';

// Quick check that every file of the fictitious fixtures (tests/fixtures/data/, the
// dataset unit tests and e2e run on) matches its Zod schema and is marked as fictitious.
// The real content in data/ is checked by `npm run validate` in CI.

const dataDir = new URL('../fixtures/data/', import.meta.url);
const readJson = (rel: string): unknown => JSON.parse(readFileSync(new URL(rel, dataDir), 'utf8'));

const topLevelFiles = ['meta', 'circunscripciones', 'afirmaciones', 'partidos', 'coaliciones', 'candidaturas'] as const;
const positionFiles = readdirSync(new URL('posiciones/', dataDir)).filter((f) => f.endsWith('.json'));

describe('fixture files match their schema', () => {
  it.each(topLevelFiles)('%s.json', (name) => {
    const result = fileSchemas[name].safeParse(readJson(`${name}.json`));
    expect(result.error?.issues).toBeUndefined();
  });

  it.each(positionFiles)('posiciones/%s', (file) => {
    const result = fileSchemas.posiciones.safeParse(readJson(`posiciones/${file}`));
    expect(result.error?.issues).toBeUndefined();
    expect(result.data?.entidad).toBe(file.replace(/\.json$/, ''));
  });
});

describe('fictitious dataset', () => {
  const meta = fileSchemas.meta.parse(readJson('meta.json'));
  const fictitious = /fictici[oa]s?|ejemplo/i;
  const expectFictitious = (texts: (LocalizedText | undefined)[]) => {
    for (const text of texts) if (text) expect(text.es).toMatch(fictitious);
  };

  it.runIf(meta.ficticio)('marks every name and text as fictitious or example', () => {
    expectFictitious([meta.eleccion]);
    for (const s of fileSchemas.afirmaciones.parse(readJson('afirmaciones.json'))) {
      expectFictitious([s.texto, s.explicacion]);
    }
    for (const p of fileSchemas.partidos.parse(readJson('partidos.json'))) expectFictitious([p.nombre]);
    for (const c of fileSchemas.coaliciones.parse(readJson('coaliciones.json'))) expectFictitious([c.nombre]);
    for (const file of positionFiles) {
      for (const p of fileSchemas.posiciones.parse(readJson(`posiciones/${file}`)).posiciones) {
        expectFictitious([p.justificacion]);
        for (const f of p.fuentes) {
          expect(f.titulo).toMatch(fictitious);
          expect(f.url).toMatch(/^https:\/\/example\.org\/ficticio\//);
        }
      }
    }
  });
});
