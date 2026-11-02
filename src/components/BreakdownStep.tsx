import type { Stance } from '../data/schema';
import type { MessageKey, Translate } from '../i18n';
import type { AnswerValue } from '../lib/affinity';
import { PartyBadge } from './PartyBadge';
import type { ResultEntity } from './ResultsStep';
import { SourceList } from './SourceList';
import type { StatementView } from './StatementStep';

interface Props {
  t: Translate;
  statements: readonly StatementView[];
  /** Entities on the user's ballot, already shuffled once for this visit: same order in every statement. */
  entities: readonly ResultEntity[];
  values: Readonly<Record<string, AnswerValue | null>>;
  important: Readonly<Record<string, boolean>>;
  onBack: () => void;
}

/** Text and icon for each stance: the icon is redundant with the text, never the only cue. */
const STANCE_ICON: Record<Stance, string> = { a_favor: '✓', neutral: '=', en_contra: '✗', sin_posicion: '?' };

const ANSWER_LABEL: Record<string, MessageKey> = {
  '1': 'afirmaciones.deAcuerdo',
  '0': 'afirmaciones.neutral',
  '-1': 'afirmaciones.enDesacuerdo',
};

export function BreakdownStep({ t, statements, entities, values, important, onBack }: Props) {
  const answerLabel = (id: string) => {
    const value = values[id];
    return value === null || value === undefined ? t('desglose.saltada') : t(ANSWER_LABEL[String(value)] ?? 'desglose.saltada');
  };

  const back = (
    <button type="button" class="button button--secondary" onClick={onBack}>
      {t('desglose.volver')}
    </button>
  );

  return (
    <section class="breakdown">
      <h1 tabIndex={-1}>{t('desglose.titulo')}</h1>
      <p>{t('desglose.intro')}</p>
      <p>{back}</p>

      {statements.map((s, i) => (
        <details key={s.id} class="breakdown__item">
          <summary>
            <h2 class="breakdown__statement">
              {i + 1}. {s.texto}
            </h2>
            <p class="breakdown__answer">
              {t('desglose.tuRespuesta', { respuesta: answerLabel(s.id) })}
              {important[s.id] && (
                <>
                  {' · '}
                  <span aria-hidden="true">★ </span>
                  {t('desglose.importante')}
                </>
              )}
            </p>
          </summary>

          <ul class="breakdown__entities">
            {entities.map((entity) => {
              const position = entity.positions[s.id];
              const stance: Stance = position?.posicion ?? 'sin_posicion';
              return (
                <li key={entity.id} class="breakdown__entity">
                  <h3 class="result__title">
                    <PartyBadge siglas={entity.siglas} color={entity.color} />
                    <span class="result__name">{entity.nombre}</span>
                  </h3>
                  <p class="breakdown__stance">
                    <span aria-hidden="true" class="breakdown__icon">
                      {STANCE_ICON[stance]}
                    </span>
                    {t(`posicion.${stance}` satisfies MessageKey)}
                  </p>
                  {entity.tipo === 'coalicion' && position && (
                    <p class="result__detail">
                      {position.origen === 'propia'
                        ? t('desglose.propia')
                        : t('desglose.heredada', { partido: entity.referencia ?? '' })}
                    </p>
                  )}
                  {position && (
                    <>
                      <p>{position.justificacion || t('desglose.sinJustificacion')}</p>
                      <SourceList t={t} sources={position.fuentes} />
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </details>
      ))}

      <p class="breakdown__footer">{back}</p>
    </section>
  );
}
