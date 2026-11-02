/**
 * Which entities (parties and coalitions) appear on the ballot of a
 * constituency, each with its effective positions.
 *
 * - With a constituency: exactly its candidacies. A coalition replaces its
 *   parties there (in Aragon the user sees «A + X», not «A»).
 * - Without one: only parties with `ambito: "estatal"`.
 * - A coalition inherits the positions of `partidoReferencia`; its own file
 *   overrides specific statements (override > reference party).
 *
 * Returns entities in data order: callers shuffle (`shuffle.ts`) or rank them.
 */
import type { ConstituencyCode, EntityId, LocalizedText, Position, StatementId } from '../data/schema';
import { dataset, type Dataset } from './data';

export type PositionOrigin = 'propia' | 'heredada';

export interface BallotPosition extends Position {
  /** `heredada` when a coalition takes it from its reference party. */
  origen: PositionOrigin;
}

export interface PartyRef {
  id: EntityId;
  nombre: LocalizedText;
  siglas: string;
}

export interface BallotEntity {
  id: EntityId;
  tipo: 'partido' | 'coalicion';
  nombre: LocalizedText;
  siglas: string;
  /** Small mark next to the acronym. Coalitions use their reference party's colour. */
  color: string | undefined;
  /** Coalitions: the parties it includes («incluye a: …»). Parties: empty. */
  incluye: PartyRef[];
  /** Coalitions: the party whose positions it inherits («heredada de …»). */
  referencia: PartyRef | undefined;
  /** Effective positions by statement id. A missing statement means no known stance. */
  positions: Partial<Record<StatementId, BallotPosition>>;
}

export function resolveBallot(data: Dataset, codigo: ConstituencyCode | null): BallotEntity[] {
  const partyById = new Map(data.parties.map((p) => [p.id, p]));
  const coalitionById = new Map(data.coalitions.map((c) => [c.id, c]));

  const party = (id: EntityId) => {
    const found = partyById.get(id);
    if (!found) throw new Error(`Partido inexistente «${id}»`);
    return found;
  };
  const ref = (id: EntityId): PartyRef => {
    const { nombre, siglas } = party(id);
    return { id, nombre, siglas };
  };
  const ownPositions = (id: EntityId, origen: PositionOrigin) =>
    Object.fromEntries((data.positions[id]?.posiciones ?? []).map((p) => [p.afirmacion, { ...p, origen }]));

  const partyEntity = (id: EntityId): BallotEntity => {
    const p = party(id);
    return {
      id,
      tipo: 'partido',
      nombre: p.nombre,
      siglas: p.siglas,
      color: p.color,
      incluye: [],
      referencia: undefined,
      positions: ownPositions(id, 'propia'),
    };
  };

  const coalitionEntity = (id: EntityId): BallotEntity => {
    const c = coalitionById.get(id);
    if (!c) throw new Error(`Coalición inexistente «${id}»`);
    return {
      id,
      tipo: 'coalicion',
      nombre: c.nombre,
      siglas: c.siglas,
      color: party(c.partidoReferencia).color,
      incluye: c.incluye.map(ref),
      referencia: ref(c.partidoReferencia),
      positions: { ...ownPositions(c.partidoReferencia, 'heredada'), ...ownPositions(id, 'propia') },
    };
  };

  if (codigo === null) {
    return data.parties.filter((p) => p.ambito === 'estatal').map((p) => partyEntity(p.id));
  }

  const candidacies = data.candidacies[codigo];
  if (!candidacies) throw new Error(`Circunscripción inexistente «${codigo}»`);
  return candidacies.map((c) => ('partido' in c ? partyEntity(c.partido) : coalitionEntity(c.coalicion)));
}

/** Ballot for a constituency (INE code), or the state-wide parties when `null`. */
export const getBallot = (codigo: ConstituencyCode | null): BallotEntity[] => resolveBallot(dataset, codigo);
