import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CONSTITUENCY_CODES,
  formatIssue,
  validateDataset,
  type Issue,
  type RawDataset,
} from '../../src/data/validate';

// Small fictitious dataset that passes every rule. Each test breaks one thing
// on a fresh copy and checks that exactly that problem is reported.

const STATEMENTS = ['a01', 'a02', 'a03', 'a04'];

const source = (url = 'https://example.org/ficticio/programa') => ({
  url,
  tipo: 'programa_electoral',
  titulo: 'Programa de ejemplo (ficticio)',
});

const position = (afirmacion: string, posicion = 'a_favor') => ({
  afirmacion,
  posicion,
  justificacion: { es: `Justificación de ejemplo (ficticia) para ${afirmacion}` },
  fuentes: [source()],
});

const fullPositions = (entidad: string) => ({ entidad, posiciones: STATEMENTS.map((id) => position(id)) });

function validDataset() {
  return {
    meta: {
      ficticio: true,
      eleccion: { es: 'Elecciones de ejemplo (ficticias)' },
      version: '0.0.1',
      actualizado: '2026-11-02',
      umbralAvisoCobertura: 0.75,
      umbralCoberturaMinima: 0.5,
      minimoRespuestas: 5,
      contactoCorrecciones: 'correcciones@example.org',
    },
    circunscripciones: CONSTITUENCY_CODES.map((codigo) => ({
      codigo,
      nombre: { es: `Provincia de ejemplo ${codigo}` },
      comunidad: 'comunidad-ejemplo',
    })),
    afirmaciones: STATEMENTS.map((id) => ({
      id,
      texto: { es: `Afirmación de ejemplo ${id} (ficticia)` },
      tema: { es: 'Tema 1' },
    })),
    partidos: [
      { id: 'partido-a', nombre: { es: 'Partido A (ficticio)' }, siglas: 'PFA', ambito: 'estatal' },
      { id: 'partido-b', nombre: { es: 'Partido B (ficticio)' }, siglas: 'PFB', ambito: 'estatal' },
      { id: 'partido-regional-x', nombre: { es: 'Partido Regional X (ficticio)' }, siglas: 'PRFX', ambito: 'autonomico' },
    ],
    coaliciones: [
      {
        id: 'coalicion-a-x',
        nombre: { es: 'Coalición de ejemplo A + X (ficticia)' },
        siglas: 'CFAX',
        partidoReferencia: 'partido-a',
        incluye: ['partido-a', 'partido-regional-x'],
      },
    ],
    candidaturas: Object.fromEntries(
      CONSTITUENCY_CODES.map((code) => [
        code,
        code === '22' ? [{ coalicion: 'coalicion-a-x' }, { partido: 'partido-b' }] : [{ partido: 'partido-a' }, { partido: 'partido-b' }],
      ]),
    ) as Record<string, ({ partido: string } | { coalicion: string })[]>,
    posiciones: {
      'partido-a': fullPositions('partido-a'),
      'partido-b': fullPositions('partido-b'),
      'coalicion-a-x': { entidad: 'coalicion-a-x', posiciones: [position('a03', 'en_contra')] },
    } as Record<string, ReturnType<typeof fullPositions>>,
  };
}

type Dataset = ReturnType<typeof validDataset>;

/** Unwraps an indexed fixture value; the fixture always has it. */
const at = <T,>(value: T | undefined): T => {
  if (value === undefined) throw new Error('missing fixture value');
  return value;
};

const run = (mutate: (d: Dataset) => void = () => {}, production = false) => {
  const d = validDataset();
  mutate(d);
  const { errors, warnings } = validateDataset(d as RawDataset, { production });
  return { errors: errors.map(formatIssue), warnings: warnings.map(formatIssue) };
};

const positionOf = (d: Dataset, entity: string, statement: string) => {
  const p = d.posiciones[entity]?.posiciones.find((x) => x.afirmacion === statement);
  if (!p) throw new Error(`no position ${entity}/${statement}`);
  return p;
};

describe('validateDataset', () => {
  it('accepts a valid dataset with no errors or warnings', () => {
    expect(run()).toEqual({ errors: [], warnings: [] });
  });

  it('formats issues as «file › path: message»', () => {
    const issue: Issue = { file: 'data/posiciones/partido-a.json', path: ['a07', 'fuentes'], message: 'vacío' };
    expect(formatIssue(issue)).toBe('data/posiciones/partido-a.json › a07 › fuentes: vacío');
  });

  describe('errors', () => {
    it('schema failure, located by element id', () => {
      const { errors } = run((d) => {
        (d.partidos[1] as Record<string, unknown>).siglas = '';
      });
      expect(errors).toEqual(['data/partidos.json › partido-b › siglas: No puede estar vacío']);
    });

    it('position without sources, located by statement id', () => {
      const { errors } = run((d) => {
        positionOf(d, 'partido-a', 'a02').fuentes = [];
      });
      expect(errors).toEqual(['data/posiciones/partido-a.json › a02 › fuentes: Hace falta al menos una fuente']);
    });

    it('positions file whose entidad does not match the file name', () => {
      const { errors } = run((d) => {
        at(d.posiciones['partido-b']).entidad = 'partido-c';
      });
      expect(errors).toContain(
        'data/posiciones/partido-b.json › entidad: «partido-c» no coincide con el nombre del fichero («partido-b»)',
      );
    });

    it.each([
      ['afirmaciones', (d: Dataset) => d.afirmaciones.push({ ...at(d.afirmaciones[0]) }), 'data/afirmaciones.json › a01: id duplicado'],
      ['partidos', (d: Dataset) => d.partidos.push({ ...at(d.partidos[0]) }), 'data/partidos.json › partido-a: id duplicado'],
      ['coaliciones', (d: Dataset) => d.coaliciones.push({ ...at(d.coaliciones[0]) }), 'data/coaliciones.json › coalicion-a-x: id duplicado'],
      [
        'circunscripciones',
        (d: Dataset) => d.circunscripciones.push({ ...at(d.circunscripciones[0]) }),
        'data/circunscripciones.json › 01: código duplicado',
      ],
      [
        'party vs coalition',
        (d: Dataset) => d.coaliciones.push({ ...at(d.coaliciones[0]), id: 'partido-b' }),
        'data/coaliciones.json › partido-b: ya existe un partido con ese id',
      ],
      [
        'statement inside a positions file',
        (d: Dataset) => at(d.posiciones['partido-a']).posiciones.push(position('a01')),
        'data/posiciones/partido-a.json › a01: afirmación repetida',
      ],
      [
        'candidacy inside a constituency',
        (d: Dataset) => at(d.candidaturas['01']).push({ partido: 'partido-a' }),
        'data/candidaturas.json › 01: candidatura repetida «partido-a»',
      ],
    ])('duplicate id: %s', (_, mutate, expected) => {
      expect(run(mutate).errors).toEqual([expected]);
    });

    it('missing party × statement for a party with its own candidacy', () => {
      const { errors } = run((d) => {
        at(d.posiciones['partido-b']).posiciones = at(d.posiciones['partido-b']).posiciones.filter((p) => p.afirmacion !== 'a04');
      });
      expect(errors).toEqual(['data/posiciones/partido-b.json › a04: falta la posición']);
    });

    it('missing party × statement for a coalition reference party with no candidacy of its own', () => {
      const { errors } = run((d) => {
        for (const code of CONSTITUENCY_CODES) d.candidaturas[code] = [{ coalicion: 'coalicion-a-x' }, { partido: 'partido-b' }];
        at(d.posiciones['partido-a']).posiciones.pop();
      });
      expect(errors).toEqual(['data/posiciones/partido-a.json › a04: falta la posición']);
    });

    it('missing positions file for a required party', () => {
      const { errors } = run((d) => {
        delete d.posiciones['partido-b'];
      });
      expect(errors).toEqual(['data/posiciones/partido-b.json: falta el fichero de posiciones']);
    });

    it('does not require positions from a party that only runs inside a coalition', () => {
      expect(run().errors).toEqual([]); // partido-regional-x has no file in the valid dataset
    });

    it('coalition override on a nonexistent statement', () => {
      const { errors } = run((d) => {
        at(d.posiciones['coalicion-a-x']).posiciones.push(position('a99'));
      });
      expect(errors).toEqual(['data/posiciones/coalicion-a-x.json › a99: afirmación inexistente']);
    });

    it('positions file for an unknown entity', () => {
      const { errors } = run((d) => {
        d.posiciones['partido-z'] = fullPositions('partido-z');
      });
      expect(errors).toEqual(['data/posiciones/partido-z.json: «partido-z» no es un partido ni una coalición']);
    });

    it.each([
      [(d: Dataset) => at(d.candidaturas['05']).push({ partido: 'partido-z' }), 'data/candidaturas.json › 05: partido inexistente «partido-z»'],
      [(d: Dataset) => at(d.candidaturas['05']).push({ coalicion: 'coalicion-z' }), 'data/candidaturas.json › 05: coalición inexistente «coalicion-z»'],
      [
        (d: Dataset) => (at(d.coaliciones[0]).partidoReferencia = 'partido-z'),
        'data/coaliciones.json › coalicion-a-x › partidoReferencia: partido inexistente «partido-z»',
      ],
      [
        (d: Dataset) => at(d.coaliciones[0]).incluye.push('partido-z'),
        'data/coaliciones.json › coalicion-a-x › incluye: partido inexistente «partido-z»',
      ],
    ])('unknown id in candidaturas or coaliciones (%#)', (mutate, expected) => {
      expect(run(mutate).errors).toEqual([expected]);
    });

    it('missing constituency in candidaturas', () => {
      const { errors } = run((d) => {
        delete d.candidaturas['52'];
      });
      expect(errors).toEqual(['data/candidaturas.json › 52: falta la circunscripción']);
    });

    it('empty candidacy list', () => {
      const { errors } = run((d) => {
        d.candidaturas['51'] = [];
      });
      expect(errors).toEqual(['data/candidaturas.json › 51: la lista de candidaturas está vacía']);
    });

    it('missing constituency in circunscripciones', () => {
      const { errors } = run((d) => {
        d.circunscripciones = d.circunscripciones.filter((c) => c.codigo !== '51');
      });
      expect(errors).toEqual(['data/circunscripciones.json › 51: falta la circunscripción']);
    });

    it('fictitious data in production', () => {
      expect(run(undefined, true).errors).toEqual([
        'data/meta.json › ficticio: los datos son FICTICIOS y no se pueden publicar en producción',
      ]);
      expect(run((d) => (d.meta.ficticio = false), true).errors).toEqual([]);
    });
  });

  describe('warnings', () => {
    it('duplicate source URL in one position', () => {
      const { errors, warnings } = run((d) => {
        positionOf(d, 'partido-a', 'a01').fuentes.push(source());
      });
      expect(errors).toEqual([]);
      expect(warnings).toEqual([
        'data/posiciones/partido-a.json › a01 › fuentes: URL repetida https://example.org/ficticio/programa',
      ]);
    });

    it('empty justification', () => {
      const { errors, warnings } = run((d) => {
        positionOf(d, 'partido-a', 'a01').justificacion.es = '  ';
      });
      expect(errors).toEqual([]);
      expect(warnings).toEqual(['data/posiciones/partido-a.json › a01 › justificacion: vacía']);
    });

    it('justification over 400 characters', () => {
      const ok = run((d) => {
        positionOf(d, 'partido-a', 'a01').justificacion.es = 'x'.repeat(400);
      });
      expect(ok.warnings).toEqual([]);
      const { warnings } = run((d) => {
        positionOf(d, 'partido-a', 'a01').justificacion.es = 'x'.repeat(401);
      });
      expect(warnings).toEqual([
        'data/posiciones/partido-a.json › a01 › justificacion: 401 caracteres (máximo recomendado 400)',
      ]);
    });

    it('coverage below the warning threshold (3 of 4 = 75 % is not below)', () => {
      const atThreshold = run((d) => {
        positionOf(d, 'partido-b', 'a01').posicion = 'sin_posicion';
      });
      expect(atThreshold.warnings).toEqual([]);
      const { errors, warnings } = run((d) => {
        positionOf(d, 'partido-b', 'a01').posicion = 'sin_posicion';
        positionOf(d, 'partido-b', 'a02').posicion = 'sin_posicion';
      });
      expect(errors).toEqual([]);
      expect(warnings).toEqual([
        'data/posiciones/partido-b.json: cobertura del 50 % (2 de 4), por debajo del umbral de aviso (75 %)',
      ]);
    });

    it('coalition coverage uses its overrides on top of the reference party', () => {
      const { warnings } = run((d) => {
        positionOf(d, 'partido-a', 'a01').posicion = 'sin_posicion';
        positionOf(d, 'partido-a', 'a02').posicion = 'sin_posicion';
        // The coalition overrides a01 with a known stance: 3 of 4 (75 %), so only A warns.
        at(d.posiciones['coalicion-a-x']).posiciones.push(position('a01'));
      });
      expect(warnings).toEqual([
        'data/posiciones/partido-a.json: cobertura del 50 % (2 de 4), por debajo del umbral de aviso (75 %)',
      ]);
    });
  });
});

describe('real data/', () => {
  const dataDir = new URL('../../data/', import.meta.url);
  const readJson = (rel: string): unknown => JSON.parse(readFileSync(new URL(rel, dataDir), 'utf8'));
  const raw: RawDataset = {
    meta: readJson('meta.json'),
    circunscripciones: readJson('circunscripciones.json'),
    afirmaciones: readJson('afirmaciones.json'),
    partidos: readJson('partidos.json'),
    coaliciones: readJson('coaliciones.json'),
    candidaturas: readJson('candidaturas.json'),
    posiciones: Object.fromEntries(
      readdirSync(new URL('posiciones/', dataDir))
        .filter((f) => f.endsWith('.json'))
        .map((f) => [f.slice(0, -'.json'.length), readJson(`posiciones/${f}`)]),
    ),
  };

  it('has no errors', () => {
    expect(validateDataset(raw, { production: false }).errors.map(formatIssue)).toEqual([]);
  });
});
