import { describe, expect, it } from 'vitest';
import { getBallot, resolveBallot, type BallotEntity } from '../../src/lib/ballot';
import { dataset } from '../../src/lib/data';

// Runs against the fictitious dataset in data/ (see «Dataset ficticio» in PLAN.md):
// X runs with A in Aragon (22, 44, 50), Y with B in Extremadura (06, 10),
// overrides on coalicion-a-x a03/a10 and coalicion-b-y a05/a18, D not in Ceuta (51) or Melilla (52).

const ids = (ballot: BallotEntity[]) => ballot.map((e) => e.id);
const find = (ballot: BallotEntity[], id: string) => {
  const entity = ballot.find((e) => e.id === id);
  if (!entity) throw new Error(`${id} not on the ballot`);
  return entity;
};

describe('data', () => {
  it('loads every data file and every positions file', () => {
    expect(dataset.constituencies).toHaveLength(52);
    expect(dataset.statements).toHaveLength(25);
    expect(Object.keys(dataset.positions).sort()).toEqual([
      'coalicion-a-x',
      'coalicion-b-y',
      'partido-a',
      'partido-b',
      'partido-c',
      'partido-d',
      'partido-e',
      'partido-f',
      'partido-regional-x',
      'partido-regional-y',
    ]);
  });
});

describe('getBallot', () => {
  it.each(['22', '44', '50'])('in X’s province %s the A + X coalition appears instead of A or X alone', (code) => {
    const ballot = ids(getBallot(code));
    expect(ballot).toContain('coalicion-a-x');
    expect(ballot).not.toContain('partido-a');
    expect(ballot).not.toContain('partido-regional-x');
  });

  it('a coalition lists its parties and its reference party', () => {
    const coalition = find(getBallot('22'), 'coalicion-a-x');
    expect(coalition).toMatchObject({
      tipo: 'coalicion',
      siglas: 'CFAX',
      color: dataset.parties.find((p) => p.id === 'partido-a')?.color,
      referencia: { id: 'partido-a', siglas: 'PFA' },
    });
    expect(coalition.incluye.map((p) => p.id)).toEqual(['partido-a', 'partido-regional-x']);
  });

  it.each([
    ['22', 'coalicion-a-x', 'partido-a', ['a03', 'a10']],
    ['06', 'coalicion-b-y', 'partido-b', ['a05', 'a18']],
  ])('in %s, %s overrides win over the positions inherited from %s', (code, coalitionId, partyId, overrides) => {
    const coalition = find(getBallot(code), coalitionId);
    const own = dataset.positions[coalitionId]?.posiciones ?? [];
    const inherited = dataset.positions[partyId]?.posiciones ?? [];

    expect(Object.keys(coalition.positions)).toHaveLength(dataset.statements.length);
    for (const s of dataset.statements) {
      const position = coalition.positions[s.id];
      if (overrides.includes(s.id)) {
        const override = own.find((p) => p.afirmacion === s.id);
        expect(position).toEqual({ ...override, origen: 'propia' });
        // The fictitious overrides always differ from the inherited stance.
        expect(position?.posicion).not.toBe(inherited.find((p) => p.afirmacion === s.id)?.posicion);
      } else {
        expect(position).toEqual({ ...inherited.find((p) => p.afirmacion === s.id), origen: 'heredada' });
      }
    }
  });

  it('a party’s positions are all its own', () => {
    const party = find(getBallot('28'), 'partido-a');
    expect(party).toMatchObject({ tipo: 'partido', incluye: [], referencia: undefined });
    const positions = Object.values(party.positions);
    expect(positions).toHaveLength(dataset.statements.length);
    expect(positions.every((p) => p?.origen === 'propia')).toBe(true);
  });

  it('without a constituency, only the state-wide parties', () => {
    const ballot = getBallot(null);
    expect(ids(ballot)).toEqual(['partido-a', 'partido-b', 'partido-c', 'partido-d', 'partido-e', 'partido-f']);
    expect(ballot.every((e) => e.tipo === 'partido')).toBe(true);
  });

  it.each(['51', '52'])('Ceuta and Melilla (%s) do not include D', (code) => {
    const ballot = ids(getBallot(code));
    expect(ballot).not.toContain('partido-d');
    expect(ballot).toContain('partido-a');
  });

  it('follows candidaturas.json exactly in every constituency', () => {
    for (const { codigo } of dataset.constituencies) {
      const expected = (dataset.candidacies[codigo] ?? []).map((c) => ('partido' in c ? c.partido : c.coalicion));
      expect(ids(getBallot(codigo))).toEqual(expected);
    }
  });

  it('throws on an unknown constituency or entity', () => {
    expect(() => getBallot('99')).toThrow('Circunscripción inexistente');
    const broken = { ...dataset, candidacies: { ...dataset.candidacies, '01': [{ partido: 'partido-z' }] } };
    expect(() => resolveBallot(broken, '01')).toThrow('Partido inexistente «partido-z»');
  });
});
