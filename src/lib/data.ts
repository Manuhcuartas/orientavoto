/**
 * The contents of `data/`, imported at build time (embedded in the bundle, no
 * network requests) and parsed with the Zod schemas. Cross-file consistency is
 * guaranteed by `npm run validate`, which runs before every build.
 */
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
} from '../data/schema';
import rawCandidacies from '../../data/candidaturas.json';
import rawCoalitions from '../../data/coaliciones.json';
import rawConstituencies from '../../data/circunscripciones.json';
import rawMeta from '../../data/meta.json';
import rawParties from '../../data/partidos.json';
import rawStatements from '../../data/afirmaciones.json';

const rawPositions = import.meta.glob<unknown>('../../data/posiciones/*.json', { eager: true, import: 'default' });

export interface Dataset {
  meta: Meta;
  constituencies: Constituency[];
  statements: Statement[];
  parties: Party[];
  coalitions: Coalition[];
  candidacies: Candidacies;
  /** Positions files by entity id (file name without `.json`). */
  positions: Readonly<Partial<Record<string, PositionsFile>>>;
}

export const dataset: Dataset = {
  meta: metaSchema.parse(rawMeta),
  constituencies: constituenciesSchema.parse(rawConstituencies),
  statements: statementsSchema.parse(rawStatements),
  parties: partiesSchema.parse(rawParties),
  coalitions: coalitionsSchema.parse(rawCoalitions),
  candidacies: candidaciesSchema.parse(rawCandidacies),
  positions: Object.fromEntries(
    Object.values(rawPositions).map((raw) => {
      const file = positionsFileSchema.parse(raw);
      return [file.entidad, file];
    }),
  ),
};
