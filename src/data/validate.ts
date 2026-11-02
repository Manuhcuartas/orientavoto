/**
 * Cross-file validation of `data/`. Pure: takes the raw (already JSON-parsed)
 * files and returns the problems found, without touching the file system.
 * `scripts/validate.ts` is the CLI that reads `data/` and prints the result.
 *
 * Errors block the build; warnings are only reported. Messages are in Spanish
 * because whoever edits the JSON by hand reads them.
 */
import type * as z from 'zod';
import {
  candidaciesSchema,
  coalitionsSchema,
  constituenciesSchema,
  metaSchema,
  partiesSchema,
  positionsFileSchema,
  statementsSchema,
  type Candidacies,
  type Coalition,
  type Constituency,
  type Meta,
  type Party,
  type PositionsFile,
  type Statement,
} from './schema';

/** Raw contents of `data/`. `posiciones` is keyed by file name without `.json`. */
export interface RawDataset {
  meta: unknown;
  circunscripciones: unknown;
  afirmaciones: unknown;
  partidos: unknown;
  coaliciones: unknown;
  candidaturas: unknown;
  posiciones: Record<string, unknown>;
}

export interface Issue {
  /** Path relative to the project root, e.g. `data/posiciones/partido-a.json`. */
  file: string;
  /** Location inside the file, e.g. `['a07', 'fuentes']`. */
  path: string[];
  message: string;
}

export interface ValidationResult {
  errors: Issue[];
  warnings: Issue[];
}

export interface ValidateOptions {
  production: boolean;
}

export const CONSTITUENCY_CODES: readonly string[] = Array.from({ length: 52 }, (_, i) =>
  String(i + 1).padStart(2, '0'),
);

export const MAX_JUSTIFICATION_LENGTH = 400;

export const dataFile = (name: Exclude<keyof RawDataset, 'posiciones'>) => `data/${name}.json`;
export const positionsFile = (entity: string) => `data/posiciones/${entity}.json`;

/** `data/posiciones/partido-a.json › a07 › fuentes: vacío` */
export const formatIssue = ({ file, path, message }: Issue): string =>
  `${[file, ...path].join(' › ')}: ${message}`;

export function validateDataset(raw: RawDataset, { production }: ValidateOptions): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const error = (file: string, path: string[], message: string) => errors.push({ file, path, message });
  const warn = (file: string, path: string[], message: string) => warnings.push({ file, path, message });

  // --- Schemas ---------------------------------------------------------------

  /** Parses one file; on failure records every issue and returns undefined. */
  function parse<T>(schema: z.ZodType<T>, value: unknown, file: string): T | undefined {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    for (const issue of result.error.issues) error(file, readablePath(value, issue.path), issue.message);
    return undefined;
  }

  const meta: Meta | undefined = parse(metaSchema, raw.meta, dataFile('meta'));
  const constituencies: Constituency[] | undefined = parse(
    constituenciesSchema,
    raw.circunscripciones,
    dataFile('circunscripciones'),
  );
  const statements: Statement[] | undefined = parse(statementsSchema, raw.afirmaciones, dataFile('afirmaciones'));
  const parties: Party[] | undefined = parse(partiesSchema, raw.partidos, dataFile('partidos'));
  const coalitions: Coalition[] | undefined = parse(coalitionsSchema, raw.coaliciones, dataFile('coaliciones'));
  const candidacies: Candidacies | undefined = parse(candidaciesSchema, raw.candidaturas, dataFile('candidaturas'));

  const positions = new Map<string, PositionsFile>();
  for (const [name, value] of Object.entries(raw.posiciones)) {
    const file = positionsFile(name);
    const parsed = parse(positionsFileSchema, value, file);
    if (!parsed) continue;
    if (parsed.entidad !== name) {
      error(file, ['entidad'], `«${parsed.entidad}» no coincide con el nombre del fichero («${name}»)`);
    }
    positions.set(name, parsed);
  }

  // --- Production guard ------------------------------------------------------

  if (production && meta?.ficticio) {
    error(dataFile('meta'), ['ficticio'], 'los datos son FICTICIOS y no se pueden publicar en producción');
  }

  // --- Duplicate ids -----------------------------------------------------------

  if (constituencies) {
    reportDuplicates(constituencies.map((c) => c.codigo), (code) =>
      error(dataFile('circunscripciones'), [code], 'código duplicado'),
    );
    const present = new Set(constituencies.map((c) => c.codigo));
    for (const code of CONSTITUENCY_CODES) {
      if (!present.has(code)) error(dataFile('circunscripciones'), [code], 'falta la circunscripción');
    }
  }
  if (statements) {
    reportDuplicates(statements.map((s) => s.id), (id) => error(dataFile('afirmaciones'), [id], 'id duplicado'));
  }
  if (parties) {
    reportDuplicates(parties.map((p) => p.id), (id) => error(dataFile('partidos'), [id], 'id duplicado'));
  }
  if (coalitions) {
    reportDuplicates(coalitions.map((c) => c.id), (id) => error(dataFile('coaliciones'), [id], 'id duplicado'));
  }
  // Parties and coalitions share the `posiciones/<id>.json` namespace.
  if (parties && coalitions) {
    const partyIds = new Set(parties.map((p) => p.id));
    for (const c of coalitions) {
      if (partyIds.has(c.id)) error(dataFile('coaliciones'), [c.id], 'ya existe un partido con ese id');
    }
  }
  for (const [name, file] of positions) {
    reportDuplicates(file.posiciones.map((p) => p.afirmacion), (id) =>
      error(positionsFile(name), [id], 'afirmación repetida'),
    );
  }

  const partyIds = parties && new Set(parties.map((p) => p.id));
  const coalitionIds = coalitions && new Set(coalitions.map((c) => c.id));
  const statementIds = statements && new Set(statements.map((s) => s.id));

  // --- Coalitions reference existing parties -----------------------------------

  if (coalitions && partyIds) {
    for (const c of coalitions) {
      if (!partyIds.has(c.partidoReferencia)) {
        error(dataFile('coaliciones'), [c.id, 'partidoReferencia'], `partido inexistente «${c.partidoReferencia}»`);
      }
      for (const id of c.incluye) {
        if (!partyIds.has(id)) error(dataFile('coaliciones'), [c.id, 'incluye'], `partido inexistente «${id}»`);
      }
    }
  }

  // --- Candidacies ------------------------------------------------------------

  if (candidacies) {
    const file = dataFile('candidaturas');
    for (const code of CONSTITUENCY_CODES) {
      const list = candidacies[code];
      if (!list) error(file, [code], 'falta la circunscripción');
      else if (list.length === 0) error(file, [code], 'la lista de candidaturas está vacía');
    }
    for (const [code, list] of Object.entries(candidacies)) {
      reportDuplicates(list.map(candidacyId), (id) => error(file, [code], `candidatura repetida «${id}»`));
      for (const c of list) {
        if ('partido' in c && partyIds && !partyIds.has(c.partido)) {
          error(file, [code], `partido inexistente «${c.partido}»`);
        }
        if ('coalicion' in c && coalitionIds && !coalitionIds.has(c.coalicion)) {
          error(file, [code], `coalición inexistente «${c.coalicion}»`);
        }
      }
    }
  }

  // --- Positions ---------------------------------------------------------------

  for (const [name, file] of positions) {
    const path = positionsFile(name);
    if (partyIds && coalitionIds && !partyIds.has(name) && !coalitionIds.has(name)) {
      error(path, [], `«${name}» no es un partido ni una coalición`);
    }
    for (const p of file.posiciones) {
      if (statementIds && !statementIds.has(p.afirmacion)) error(path, [p.afirmacion], 'afirmación inexistente');

      reportDuplicates(p.fuentes.map((f) => f.url), (url) =>
        warn(path, [p.afirmacion, 'fuentes'], `URL repetida ${url}`),
      );

      const justification = p.justificacion.es.trim();
      if (justification === '') warn(path, [p.afirmacion, 'justificacion'], 'vacía');
      else if (justification.length > MAX_JUSTIFICATION_LENGTH) {
        warn(
          path,
          [p.afirmacion, 'justificacion'],
          `${justification.length} caracteres (máximo recomendado ${MAX_JUSTIFICATION_LENGTH})`,
        );
      }
    }
  }

  // Parties shown to the user (own candidacy) or whose positions a coalition inherits
  // must state a position, even `sin_posicion`, on every statement.
  if (statements && parties && coalitions && candidacies) {
    const required = new Set<string>(coalitions.map((c) => c.partidoReferencia));
    for (const list of Object.values(candidacies)) {
      for (const c of list) if ('partido' in c) required.add(c.partido);
    }
    for (const party of parties) {
      if (!required.has(party.id)) continue;
      const file = positions.get(party.id);
      if (!file) {
        if (!(party.id in raw.posiciones)) error(positionsFile(party.id), [], 'falta el fichero de posiciones');
        continue;
      }
      const covered = new Set(file.posiciones.map((p) => p.afirmacion));
      for (const s of statements) {
        if (!covered.has(s.id)) error(positionsFile(party.id), [s.id], 'falta la posición');
      }
    }
  }

  // --- Coverage ----------------------------------------------------------------

  if (meta && statements && coalitions && candidacies && statements.length > 0) {
    const coalitionById = new Map(coalitions.map((c) => [c.id, c]));
    const onBallot = new Set(Object.values(candidacies).flat().map(candidacyId));
    for (const id of [...onBallot].sort()) {
      const coalition = coalitionById.get(id);
      const stances = new Map<string, string>();
      for (const p of positions.get(coalition?.partidoReferencia ?? id)?.posiciones ?? []) stances.set(p.afirmacion, p.posicion);
      if (coalition) for (const p of positions.get(id)?.posiciones ?? []) stances.set(p.afirmacion, p.posicion);

      const known = statements.filter((s) => {
        const stance = stances.get(s.id);
        return stance !== undefined && stance !== 'sin_posicion';
      }).length;
      const coverage = known / statements.length;
      if (coverage < meta.umbralAvisoCobertura) {
        warn(
          positionsFile(id),
          [],
          `cobertura del ${percent(coverage)} (${known} de ${statements.length}), por debajo del umbral de aviso (${percent(meta.umbralAvisoCobertura)})`,
        );
      }
    }
  }

  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const candidacyId = (c: Candidacies[string][number]) => ('partido' in c ? c.partido : c.coalicion);

const percent = (ratio: number) => `${Math.round(ratio * 100)} %`;

function reportDuplicates(values: string[], report: (value: string) => void): void {
  const seen = new Set<string>();
  const reported = new Set<string>();
  for (const v of values) {
    if (seen.has(v) && !reported.has(v)) {
      reported.add(v);
      report(v);
    }
    seen.add(v);
  }
}

/**
 * Turns a Zod issue path into something a person can find in the JSON:
 * array indices become the element's `id`, `codigo` or `afirmacion` when it has one,
 * and the `posiciones` wrapper of a positions file is dropped.
 */
function readablePath(root: unknown, path: readonly PropertyKey[]): string[] {
  const out: string[] = [];
  let node: unknown = root;
  path.forEach((key, i) => {
    const child: unknown = isRecord(node) || Array.isArray(node) ? (node as Record<PropertyKey, unknown>)[key] : undefined;
    if (i === 0 && key === 'posiciones' && Array.isArray(child)) {
      node = child;
      return;
    }
    if (typeof key === 'number' && isRecord(child)) {
      const label = [child.afirmacion, child.id, child.codigo].find((v) => typeof v === 'string');
      out.push(typeof label === 'string' ? label : `[${key}]`);
    } else {
      out.push(typeof key === 'number' ? `[${key}]` : String(key));
    }
    node = child;
  });
  return out;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
