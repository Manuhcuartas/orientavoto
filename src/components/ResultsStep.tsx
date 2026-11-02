import type { Stance } from '../data/schema';
import type { Translate } from '../i18n';
import type { InsufficientEntity, RankedEntity, Ranking } from '../lib/affinity';
import { PartyBadge } from './PartyBadge';
import type { SourceView } from './SourceList';

/** An effective position as the island receives it (texts localized). */
export interface PositionView {
  posicion: Stance;
  justificacion: string;
  fuentes: SourceView[];
  /** `heredada` when a coalition takes it from its reference party. */
  origen: 'propia' | 'heredada';
}

/** A ballot entity as the island receives it, texts localized. */
export interface ResultEntity {
  id: string;
  tipo: 'partido' | 'coalicion';
  nombre: string;
  siglas: string;
  color: string | undefined;
  /** Coalitions: names of the included parties. Parties: empty. */
  incluye: string[];
  /** Coalitions: name of the party whose positions it inherits. */
  referencia?: string;
  /** Effective positions by statement id. */
  positions: Readonly<Partial<Record<string, PositionView>>>;
}

interface Props {
  t: Translate;
  locale: string;
  ranking: Ranking<ResultEntity>;
  /** Constituency name, or `null` when the user preferred not to say. */
  constituencyName: string | null;
  minimoRespuestas: number;
  umbralCoberturaMinima: number;
  onBreakdown: () => void;
  onRestart: () => void;
}

/**
 * Ranking by affinity. Every row has the same component, size and style: no
 * special treatment for the first place, no recommendation language.
 */
export function ResultsStep(props: Props) {
  const { t, ranking, constituencyName, minimoRespuestas, umbralCoberturaMinima, onBreakdown, onRestart } = props;
  const list = new Intl.ListFormat(props.locale, { type: 'conjunction' });
  const answered = ranking.ranked[0]?.score.answered ?? ranking.insufficient[0]?.score.answered ?? 0;

  const name = (entity: ResultEntity) => (
    <>
      <PartyBadge siglas={entity.siglas} color={entity.color} />
      <span class="result__name">{entity.nombre}</span>
    </>
  );
  const includes = (entity: ResultEntity) =>
    entity.incluye.length > 0 && <p class="result__detail">{t('resultados.incluye', { partidos: list.format(entity.incluye) })}</p>;

  const row = ({ entity, score, percent, lowCoverage }: RankedEntity<ResultEntity>) => (
    <li key={entity.id} class="result">
      <h3 class="result__title">{name(entity)}</h3>
      {includes(entity)}
      <div class="result__score">
        <div class="result__bar" aria-hidden="true">
          <div class="result__bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p class="result__percent">
          {t('resultados.porcentaje', { valor: percent })} <span class="visually-hidden">{t('resultados.porcentajeSr')}</span>
        </p>
      </div>
      <p class="result__detail">
        {t('resultados.calculado', { consideradas: score.considered, respondidas: score.answered })}
      </p>
      {lowCoverage && (
        <p class="notice">{t('resultados.avisoCobertura', { consideradas: score.considered, respondidas: score.answered })}</p>
      )}
    </li>
  );

  const insufficientRow = ({ entity, score }: InsufficientEntity<ResultEntity>) => (
    <li key={entity.id} class="result">
      <h3 class="result__title">{name(entity)}</h3>
      {includes(entity)}
      <p class="result__detail">
        {t('resultados.insuficienteDetalle', { consideradas: score.considered, respondidas: score.answered })}
      </p>
    </li>
  );

  return (
    <section class="results">
      <h1 tabIndex={-1}>{t('resultados.titulo')}</h1>
      <p class="notice notice--strong">{t('resultados.descargo')}</p>
      <p>
        {constituencyName === null
          ? t('resultados.sinCircunscripcion')
          : t('resultados.circunscripcion', { provincia: constituencyName })}
      </p>
      {ranking.lowAnswerCount && (
        <p class="notice">{t('resultados.avisoPocasRespuestas', { respondidas: answered, minimo: minimoRespuestas })}</p>
      )}

      {ranking.ranked.length > 0 && (
        <>
          <h2>{t('resultados.rankingTitulo')}</h2>
          <ol class="results__list">{ranking.ranked.map(row)}</ol>
        </>
      )}

      {ranking.insufficient.length > 0 && (
        <>
          <h2>{t('resultados.insuficientesTitulo')}</h2>
          <p>{t('resultados.insuficientesTexto', { umbral: Math.round(umbralCoberturaMinima * 100) })}</p>
          <ul class="results__list">{ranking.insufficient.map(insufficientRow)}</ul>
        </>
      )}

      <div class="results__actions">
        <button type="button" class="button" onClick={onBreakdown}>
          {t('resultados.verDesglose')}
        </button>
        <a class="button button--secondary" href="/metodologia/" target="_blank" rel="noopener noreferrer">
          {t('resultados.metodologia')} <span class="visually-hidden">{t('resultados.nuevaPestana')}</span>
        </a>
        <button type="button" class="link-button" onClick={onRestart}>
          {t('resultados.volverAEmpezar')}
        </button>
      </div>
    </section>
  );
}
