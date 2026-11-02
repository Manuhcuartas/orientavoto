/**
 * Party list island. Rendered only in the client (`client:only`): the HTML never
 * carries a fixed order of parties. Shuffled once per visit; the constituency
 * filter keeps that order.
 */
import { useId, useMemo, useState } from 'preact/hooks';
import { createTranslator } from '../i18n';
import { shuffle } from '../lib/shuffle';
import { PartyBadge } from './PartyBadge';
import type { ConstituencyOption } from './ProvinceStep';

export interface PartyCard {
  id: string;
  nombre: string;
  siglas: string;
  color: string | undefined;
  ambito: 'estatal' | 'autonomico';
  web?: string;
  /** INE codes where it runs on its own. */
  solo: string[];
  coalitions: { nombre: string; siglas: string; codes: string[] }[];
}

interface Props {
  locale: string;
  parties: readonly PartyCard[];
  /** Sorted alphabetically. */
  constituencies: readonly ConstituencyOption[];
}

/** Above this many constituencies, list the exceptions instead («todas salvo …»). */
const LIST_EXCEPTIONS_FROM = 26;

export default function PartyList({ locale, parties, constituencies }: Props) {
  const t = createTranslator(locale);
  const id = useId();
  const [filter, setFilter] = useState('');
  const order = useMemo(() => shuffle(parties), [parties]);

  const total = constituencies.length;
  const nameOf = new Map(constituencies.map((c) => [c.codigo, c.nombre]));
  const list = new Intl.ListFormat(locale, { type: 'conjunction' });
  /** Names in alphabetical order (the order of `constituencies`). */
  const names = (codes: readonly string[]) => {
    const set = new Set(codes);
    return list.format(constituencies.filter((c) => set.has(c.codigo)).map((c) => c.nombre));
  };
  const allBut = (codes: readonly string[]) => constituencies.filter((c) => !codes.includes(c.codigo)).map((c) => c.codigo);

  const soloText = (codes: readonly string[]) => {
    if (codes.length === 0) return t('partidos.noSolitario');
    if (codes.length === total) return t('partidos.solitarioTodas', { total });
    if (codes.length >= LIST_EXCEPTIONS_FROM) return t('partidos.solitarioSalvo', { lista: names(allBut(codes)) });
    return t('partidos.solitarioEn', { lista: names(codes) });
  };

  const visible = filter
    ? order.filter((p) => p.solo.includes(filter) || p.coalitions.some((c) => c.codes.includes(filter)))
    : order;

  return (
    <div>
      <div class="field">
        <label for={id}>{t('partidos.filtroEtiqueta')}</label>
        <select id={id} value={filter} onChange={(e) => setFilter(e.currentTarget.value)}>
          <option value="">{t('partidos.filtroTodas')}</option>
          {constituencies.map((c) => (
            <option key={c.codigo} value={c.codigo}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <p aria-live="polite">
        {filter
          ? t('partidos.recuentoProvincia', { numero: visible.length, provincia: nameOf.get(filter) ?? '' })
          : t('partidos.recuento', { numero: visible.length })}
      </p>

      <ul class="party-list">
        {visible.map((p) => (
          <li key={p.id} class="party-card">
            <h2 class="result__title">
              <PartyBadge siglas={p.siglas} color={p.color} />
              <span class="result__name">{p.nombre}</span>
            </h2>
            <p class="result__detail">{t(p.ambito === 'estatal' ? 'partidos.ambitoEstatal' : 'partidos.ambitoAutonomico')}</p>
            <p>{soloText(p.solo)}</p>
            {p.coalitions.map((c) => (
              <p key={c.siglas}>{t('partidos.coalicion', { nombre: c.nombre, siglas: c.siglas, lista: names(c.codes) })}</p>
            ))}
            {p.web && (
              <p>
                <a href={p.web} target="_blank" rel="noopener noreferrer">
                  {t('partidos.web')}
                  <span class="visually-hidden"> {t('fuente.nuevaPestana')}</span>
                </a>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
