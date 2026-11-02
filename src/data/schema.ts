/**
 * Zod schemas for the hand-edited files in `data/`. Single source of truth:
 * TS types are inferred from here and `npm run schemas` generates the JSON
 * Schema files in `schemas/` (editor autocompletion).
 *
 * JSON keys are in Spanish because a person edits them by hand.
 * Objects are strict so that a mistyped key is an error, not silently ignored.
 * Cross-file rules (unknown ids, missing combinations, 52 constituencies…)
 * live in `src/data/validate.ts`, not here.
 */
import * as z from 'zod';

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** Lowercase kebab-case id: `partido-a`, `coalicion-a-x`. */
export const entityIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Debe ser kebab-case en minúsculas (p. ej. «partido-a»)')
  .describe('Identificador en kebab-case y minúsculas, p. ej. «partido-a».');

/** Statement id: `a01`, `a02`… */
export const statementIdSchema = z
  .string()
  .regex(/^a\d{2}$/, 'Debe tener el formato «a01»')
  .describe('Identificador de afirmación, p. ej. «a01».');

/** INE province code: "01".."52" (51 Ceuta, 52 Melilla). */
export const constituencyCodeSchema = z
  .string()
  .regex(/^(?:0[1-9]|[1-4]\d|5[0-2])$/, 'Debe ser un código INE de «01» a «52»')
  .describe('Código INE de provincia, de «01» a «52» (51 Ceuta, 52 Melilla).');

export const httpsUrlSchema = z
  .url({ protocol: /^https$/, error: 'Debe ser una URL https://' })
  .meta({ pattern: '^https://' });

export const isoDateSchema = z.iso.date({ error: 'Debe ser una fecha AAAA-MM-DD' });

const nonEmptyString = z.string().trim().min(1, 'No puede estar vacío');

/** Localized content text. `es` is mandatory; other locales are added here when supported. */
export const localizedTextSchema = z.strictObject({
  es: nonEmptyString,
});

/**
 * Same as `localizedTextSchema` but `es` may be empty. Only for justifications:
 * an empty one is a validation warning (task 0.4), not a schema error.
 */
export const localizedOptionalTextSchema = z.strictObject({
  es: z.string(),
});

// ---------------------------------------------------------------------------
// data/meta.json
// ---------------------------------------------------------------------------

const ratioSchema = z.number().min(0).max(1);

export const metaSchema = z.strictObject({
  ficticio: z.boolean().describe('true mientras los datos sean ficticios. Bloquea el build de producción.'),
  eleccion: localizedTextSchema,
  version: nonEmptyString,
  actualizado: isoDateSchema,
  umbralAvisoCobertura: ratioSchema.describe('Por debajo de esta cobertura se muestra un aviso (0–1).'),
  umbralCoberturaMinima: ratioSchema.describe('Por debajo de esta cobertura el partido sale del ranking (0–1).'),
  minimoRespuestas: z.int().min(1).describe('Con menos respuestas, los resultados llevan aviso de baja fiabilidad.'),
  contactoCorrecciones: nonEmptyString,
});

// ---------------------------------------------------------------------------
// data/circunscripciones.json
// ---------------------------------------------------------------------------

export const constituencySchema = z.strictObject({
  codigo: constituencyCodeSchema,
  nombre: localizedTextSchema,
  comunidad: entityIdSchema.describe('Identificador de la comunidad autónoma, p. ej. «castilla-y-leon».'),
});

export const constituenciesSchema = z.array(constituencySchema);

// ---------------------------------------------------------------------------
// data/afirmaciones.json
// ---------------------------------------------------------------------------

export const statementSchema = z.strictObject({
  id: statementIdSchema,
  texto: localizedTextSchema,
  tema: localizedTextSchema,
  explicacion: localizedTextSchema.optional(),
});

export const statementsSchema = z.array(statementSchema);

// ---------------------------------------------------------------------------
// data/partidos.json
// ---------------------------------------------------------------------------

export const partyScopeSchema = z.enum(['estatal', 'autonomico']);

export const partySchema = z.strictObject({
  id: entityIdSchema,
  nombre: localizedTextSchema,
  siglas: nonEmptyString,
  ambito: partyScopeSchema.describe('«estatal» o «autonomico». Sin provincia elegida solo salen los estatales.'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Debe ser un color #RRGGBB')
    .optional()
    .describe('Solo se usa como marca pequeña junto a las siglas.'),
  logo: z
    .string()
    .regex(/^logos\/[a-z0-9-]+\.(?:svg|png|webp)$/, 'Debe ser una ruta «logos/x.svg»')
    .optional(),
  web: httpsUrlSchema.optional(),
});

export const partiesSchema = z.array(partySchema);

// ---------------------------------------------------------------------------
// data/coaliciones.json
// ---------------------------------------------------------------------------

export const coalitionSchema = z.strictObject({
  id: entityIdSchema,
  nombre: localizedTextSchema,
  siglas: nonEmptyString,
  partidoReferencia: entityIdSchema.describe('Partido del que hereda las posiciones.'),
  incluye: z.array(entityIdSchema).min(1),
});

export const coalitionsSchema = z.array(coalitionSchema);

// ---------------------------------------------------------------------------
// data/candidaturas.json
// ---------------------------------------------------------------------------

export const candidacySchema = z.union([
  z.strictObject({ partido: entityIdSchema }),
  z.strictObject({ coalicion: entityIdSchema }),
]);

export const candidaciesSchema = z.record(constituencyCodeSchema, z.array(candidacySchema));

// ---------------------------------------------------------------------------
// data/posiciones/<idEntidad>.json
// ---------------------------------------------------------------------------

export const stanceSchema = z
  .enum(['a_favor', 'neutral', 'en_contra', 'sin_posicion'])
  .describe('«sin_posicion» también necesita fuente: el programa consultado donde el tema no aparece.');

export const sourceTypeSchema = z.enum(['programa_electoral', 'votacion_congreso', 'declaracion_publica', 'otro']);

export const sourceSchema = z.strictObject({
  url: httpsUrlSchema,
  tipo: sourceTypeSchema,
  titulo: nonEmptyString,
  fecha: isoDateSchema.optional(),
});

export const positionSchema = z.strictObject({
  afirmacion: statementIdSchema,
  posicion: stanceSchema,
  justificacion: localizedOptionalTextSchema,
  fuentes: z.array(sourceSchema).min(1, 'Hace falta al menos una fuente'),
});

export const positionsFileSchema = z.strictObject({
  entidad: entityIdSchema.describe('Id del partido o coalición; coincide con el nombre del fichero.'),
  posiciones: z.array(positionSchema),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type EntityId = z.infer<typeof entityIdSchema>;
export type StatementId = z.infer<typeof statementIdSchema>;
export type ConstituencyCode = z.infer<typeof constituencyCodeSchema>;
export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type Meta = z.infer<typeof metaSchema>;
export type Constituency = z.infer<typeof constituencySchema>;
export type Statement = z.infer<typeof statementSchema>;
export type PartyScope = z.infer<typeof partyScopeSchema>;
export type Party = z.infer<typeof partySchema>;
export type Coalition = z.infer<typeof coalitionSchema>;
export type Candidacy = z.infer<typeof candidacySchema>;
export type Candidacies = z.infer<typeof candidaciesSchema>;
export type Stance = z.infer<typeof stanceSchema>;
export type SourceType = z.infer<typeof sourceTypeSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Position = z.infer<typeof positionSchema>;
export type PositionsFile = z.infer<typeof positionsFileSchema>;

/** One schema per data file, keyed by the generated JSON Schema file name. */
export const fileSchemas = {
  meta: metaSchema,
  circunscripciones: constituenciesSchema,
  afirmaciones: statementsSchema,
  partidos: partiesSchema,
  coaliciones: coalitionsSchema,
  candidaturas: candidaciesSchema,
  posiciones: positionsFileSchema,
} as const;
