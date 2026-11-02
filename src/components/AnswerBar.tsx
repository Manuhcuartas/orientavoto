import { useEffect, useRef } from 'preact/hooks';
import type { Translate } from '../i18n';
import type { AnswerValue } from '../lib/affinity';

interface Props {
  t: Translate;
  /** Current answer when coming back to a statement (`null` = skipped, `undefined` = not reached). */
  value: AnswerValue | null | undefined;
  important: boolean;
  onAnswer: (value: AnswerValue) => void;
  onSkip: () => void;
  onToggleImportant: () => void;
}

const ANSWERS = [
  { value: 1, label: 'afirmaciones.deAcuerdo' },
  { value: 0, label: 'afirmaciones.neutral' },
  { value: -1, label: 'afirmaciones.enDesacuerdo' },
] as const;

/**
 * Fixed at the bottom of the screen (thumb zone). The page gets a matching
 * bottom padding so the bar never covers content or the footer.
 */
export function AnswerBar({ t, value, important, onAnswer, onSkip, onToggleImportant }: Props) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    const pad = () => {
      document.body.style.paddingBottom = `${element.offsetHeight}px`;
    };
    pad();
    const observer = new ResizeObserver(pad);
    observer.observe(element);
    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = '';
    };
  }, []);

  return (
    <div class="answer-bar" ref={bar}>
      <div class="container">
        <div class="answer-bar__inner">
          <div class="answer-bar__row answer-bar__row--options" role="group" aria-label={t('afirmaciones.opciones')}>
            <button type="button" class="toggle" aria-pressed={important} onClick={onToggleImportant}>
              <span aria-hidden="true">{important ? '★' : '☆'}</span>
              {t('afirmaciones.importante')}
            </button>
            <button type="button" class="link-button" onClick={onSkip}>
              {t('afirmaciones.saltar')}
            </button>
          </div>
          <div class="answer-bar__row answer-bar__row--answers" role="group" aria-label={t('afirmaciones.respuesta')}>
            {ANSWERS.map((a) => (
              <button
                key={a.value}
                type="button"
                class="button"
                aria-pressed={value === a.value}
                onClick={() => onAnswer(a.value)}
              >
                {value === a.value && <span aria-hidden="true">✓</span>}
                {t(a.label)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
