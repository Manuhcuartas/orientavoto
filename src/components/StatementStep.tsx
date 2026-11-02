import type { Translate } from '../i18n';
import type { AnswerValue } from '../lib/affinity';
import { AnswerBar } from './AnswerBar';
import { ProgressBar } from './ProgressBar';

/** A statement with its texts already localized (passed as island props). */
export interface StatementView {
  id: string;
  texto: string;
  tema: string;
  explicacion?: string;
}

interface Props {
  t: Translate;
  statement: StatementView;
  /** 0-based. */
  index: number;
  total: number;
  value: AnswerValue | null | undefined;
  important: boolean;
  onAnswer: (value: AnswerValue) => void;
  onSkip: () => void;
  onToggleImportant: () => void;
  onBack: () => void;
}

export function StatementStep({ t, statement, index, total, value, important, onAnswer, onSkip, onToggleImportant, onBack }: Props) {
  return (
    <section class="statement">
      <div class="statement__top">
        <button type="button" class="link-button statement__back" onClick={onBack}>
          <span aria-hidden="true">←</span>
          {t('cuestionario.anterior')}
        </button>
        <ProgressBar current={index + 1} total={total} />
      </div>

      <p class="statement__meta">
        {t('afirmaciones.contador', { actual: index + 1, total })} · {t('afirmaciones.tema', { tema: statement.tema })}
      </p>
      {/* Focus target on every statement change (see Quiz). */}
      <h1 class="statement__text" tabIndex={-1}>
        {statement.texto}
      </h1>

      {statement.explicacion && (
        <details class="statement__more">
          <summary>{t('afirmaciones.masInformacion')}</summary>
          <p>{statement.explicacion}</p>
        </details>
      )}

      <AnswerBar
        t={t}
        value={value}
        important={important}
        onAnswer={onAnswer}
        onSkip={onSkip}
        onToggleImportant={onToggleImportant}
      />
    </section>
  );
}
