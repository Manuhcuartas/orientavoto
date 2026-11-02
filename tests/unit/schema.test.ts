import { describe, expect, it } from 'vitest';
import {
  candidaciesSchema,
  coalitionsSchema,
  constituenciesSchema,
  metaSchema,
  partiesSchema,
  positionsFileSchema,
  statementsSchema,
} from '../../src/data/schema';

// Minimal valid example of each data file. All content is fictitious.
// Builders take overrides so each test changes one thing on a fresh copy.

const meta = (over: Record<string, unknown> = {}) => ({
  ficticio: true,
  eleccion: { es: 'Elecciones de ejemplo (ficticias)' },
  version: '0.1.0',
  actualizado: '2026-11-02',
  umbralAvisoCobertura: 0.75,
  umbralCoberturaMinima: 0.5,
  minimoRespuestas: 5,
  contactoCorrecciones: 'correcciones@example.org',
  ...over,
});

const constituencies = () => [
  { codigo: '01', nombre: { es: 'Provincia de ejemplo 1' }, comunidad: 'comunidad-ejemplo' },
  { codigo: '52', nombre: { es: 'Provincia de ejemplo 52' }, comunidad: 'comunidad-ejemplo-2' },
];

const statement = (over: Record<string, unknown> = {}) => ({
  id: 'a01',
  texto: { es: 'Afirmación de ejemplo 1 (ficticia)' },
  tema: { es: 'Tema 1' },
  explicacion: { es: 'Explicación de ejemplo (ficticia)' },
  ...over,
});

const party = (over: Record<string, unknown> = {}) => ({
  id: 'partido-a',
  nombre: { es: 'Partido A (ficticio)' },
  siglas: 'PA',
  ambito: 'estatal',
  color: '#123ABC',
  logo: 'logos/partido-a.svg',
  web: 'https://example.org/ficticio/partido-a',
  ...over,
});

const minimalParty = { id: 'partido-regional-x', nombre: { es: 'Partido Regional X (ficticio)' }, siglas: 'PRX', ambito: 'autonomico' };

const coalitions = () => [
  {
    id: 'coalicion-a-x',
    nombre: { es: 'Coalición A + X (ficticia)' },
    siglas: 'A+X',
    partidoReferencia: 'partido-a',
    incluye: ['partido-a', 'partido-regional-x'],
  },
];

const candidacies = () => ({
  '01': [{ partido: 'partido-a' }],
  '02': [{ coalicion: 'coalicion-a-x' }, { partido: 'partido-b' }],
});

const source = (over: Record<string, unknown> = {}) => ({
  url: 'https://example.org/ficticio/programa-a',
  tipo: 'programa_electoral',
  titulo: 'Programa de ejemplo (ficticio)',
  fecha: '2026-10-15',
  ...over,
});

const position = (over: Record<string, unknown> = {}) => ({
  afirmacion: 'a01',
  posicion: 'a_favor',
  justificacion: { es: 'Justificación de ejemplo (ficticia)' },
  fuentes: [source()],
  ...over,
});

const positionsFile = (over: Record<string, unknown> = {}) => ({
  entidad: 'partido-a',
  posiciones: [position(), position({ afirmacion: 'a02', posicion: 'sin_posicion', justificacion: { es: '' } })],
  ...over,
});

/** Positions file whose only position has the given overrides. */
const withPosition = (over: Record<string, unknown>) => positionsFile({ posiciones: [position(over)] });

const ok = (schema: { safeParse(v: unknown): { success: boolean } }, value: unknown) => schema.safeParse(value).success;

describe('valid examples', () => {
  it.each([
    ['meta.json', metaSchema, meta()],
    ['circunscripciones.json', constituenciesSchema, constituencies()],
    ['afirmaciones.json', statementsSchema, [statement(), statement({ id: 'a02', explicacion: undefined })]],
    ['partidos.json', partiesSchema, [party(), minimalParty]],
    ['coaliciones.json', coalitionsSchema, coalitions()],
    ['candidaturas.json', candidaciesSchema, candidacies()],
    ['posiciones/partido-a.json', positionsFileSchema, positionsFile()],
  ] as const)('accepts %s', (_name, schema, example) => {
    const result = schema.safeParse(example);
    expect(result.error?.issues).toBeUndefined();
  });

  it('accepts every stance and source type, and a source without date', () => {
    for (const posicion of ['a_favor', 'neutral', 'en_contra', 'sin_posicion']) {
      for (const tipo of ['programa_electoral', 'votacion_congreso', 'declaracion_publica', 'otro']) {
        expect(ok(positionsFileSchema, withPosition({ posicion, fuentes: [source({ tipo })] }))).toBe(true);
      }
    }
    const undated: Record<string, unknown> = source();
    delete undated.fecha;
    expect(ok(positionsFileSchema, withPosition({ fuentes: [undated] }))).toBe(true);
  });
});

describe('rejections', () => {
  it('rejects an id with uppercase letters', () => {
    expect(ok(partiesSchema, [party({ id: 'Partido-A' })])).toBe(false);
    expect(ok(positionsFileSchema, positionsFile({ entidad: 'partidoA' }))).toBe(false);
  });

  it.each(['partido_a', 'partido a', '-partido', 'partido--a', ''])('rejects the malformed id %j', (id) => {
    expect(ok(partiesSchema, [party({ id })])).toBe(false);
  });

  it('rejects an http: URL', () => {
    const http = 'http://example.org/ficticio/programa-a';
    expect(ok(positionsFileSchema, withPosition({ fuentes: [source({ url: http })] }))).toBe(false);
    expect(ok(partiesSchema, [party({ web: http })])).toBe(false);
  });

  it('rejects an invalid stance', () => {
    expect(ok(positionsFileSchema, withPosition({ posicion: 'de_acuerdo' }))).toBe(false);
  });

  it('rejects empty sources', () => {
    expect(ok(positionsFileSchema, withPosition({ fuentes: [] }))).toBe(false);
  });

  it('rejects a localized text without es', () => {
    expect(ok(statementsSchema, [statement({ texto: {} })])).toBe(false);
    expect(ok(statementsSchema, [statement({ texto: { ca: 'Text' } })])).toBe(false);
    expect(ok(metaSchema, meta({ eleccion: {} }))).toBe(false);
    expect(ok(positionsFileSchema, withPosition({ justificacion: {} }))).toBe(false);
  });

  it('rejects an empty es in content texts', () => {
    expect(ok(statementsSchema, [statement({ texto: { es: '   ' } })])).toBe(false);
  });

  it('rejects unknown keys (typos in hand-edited JSON)', () => {
    expect(ok(metaSchema, meta({ fictico: true }))).toBe(false);
  });

  it('rejects malformed codes, colors, dates and ratios', () => {
    expect(ok(candidaciesSchema, { '53': [] })).toBe(false);
    expect(ok(candidaciesSchema, { '1': [] })).toBe(false);
    expect(ok(candidaciesSchema, { '01': [{ partido: 'partido-a', coalicion: 'coalicion-a-x' }] })).toBe(false);
    expect(ok(partiesSchema, [party({ color: 'red' })])).toBe(false);
    expect(ok(partiesSchema, [party({ ambito: 'local' })])).toBe(false);
    expect(ok(metaSchema, meta({ actualizado: '02/11/2026' }))).toBe(false);
    expect(ok(metaSchema, meta({ umbralAvisoCobertura: 75 }))).toBe(false);
    expect(ok(statementsSchema, [statement({ id: 'a1' })])).toBe(false);
  });
});
