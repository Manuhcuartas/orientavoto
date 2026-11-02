/**
 * Quiz island: a step machine province → statements → results → breakdown.
 * All state lives in memory (useState) and is lost on reload, on purpose:
 * no cookies, no storage and nothing in the URL (privacy rules in CLAUDE.md).
 *
 * Data comes in as props, already parsed at build time, so the island does not
 * bundle Zod or the raw JSON.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { createTranslator } from '../i18n';
import type { AnswerValue } from '../lib/affinity';
import { ProvinceStep, type ConstituencyOption } from './ProvinceStep';
import { StatementStep, type StatementView } from './StatementStep';

export type Step = 'provincia' | 'afirmaciones' | 'resultados' | 'desglose';

interface Props {
  locale: string;
  constituencies: readonly ConstituencyOption[];
  statements: readonly StatementView[];
}

export default function Quiz({ locale, constituencies, statements }: Props) {
  const t = createTranslator(locale);
  const total = statements.length;

  const [step, setStep] = useState<Step>('provincia');
  /** `undefined` until chosen; `null` = prefers not to say (state-wide parties only). */
  const [constituency, setConstituency] = useState<string | null | undefined>(undefined);
  /** 0-based position in the statements step. */
  const [index, setIndex] = useState(0);
  /** Answer per statement id: −1/0/+1, `null` = skipped; absent = not reached yet. */
  const [values, setValues] = useState<Readonly<Record<string, AnswerValue | null>>>({});
  /** «Importante para mí» per statement id, kept even if the statement is skipped. */
  const [important, setImportant] = useState<Readonly<Record<string, boolean>>>({});
  /** Text of the polite live region: «Afirmación N de 25». */
  const [announcement, setAnnouncement] = useState('');

  const statement = statements[index];

  // On every step or statement change (not on first load), move focus to the
  // new heading and announce the position, for keyboard and screen reader users.
  const root = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    root.current?.querySelector<HTMLElement>('h1')?.focus();
    setAnnouncement(step === 'afirmaciones' ? t('afirmaciones.contador', { actual: index + 1, total }) : '');
  }, [step, index]);

  // Warn before leaving with answers in progress: reloading loses them (nothing is stored).
  const answeredCount = Object.keys(values).length;
  const unfinished = answeredCount > 0 && (step === 'provincia' || step === 'afirmaciones');
  useEffect(() => {
    if (!unfinished) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [unfinished]);

  const next = () => {
    if (index < total - 1) setIndex(index + 1);
    else setStep('resultados');
  };

  const record = (value: AnswerValue | null) => {
    if (!statement) return;
    setValues({ ...values, [statement.id]: value });
    next();
  };

  const back = () => {
    if (index > 0) setIndex(index - 1);
    else setStep('provincia');
  };

  return (
    <div ref={root}>
      <p class="visually-hidden" aria-live="polite">
        {announcement}
      </p>

      {step === 'provincia' && (
        <ProvinceStep
          t={t}
          constituencies={constituencies}
          initial={constituency}
          onContinue={(codigo) => {
            setConstituency(codigo);
            setStep('afirmaciones');
          }}
        />
      )}

      {step === 'afirmaciones' && statement && (
        <StatementStep
          key={statement.id}
          t={t}
          statement={statement}
          index={index}
          total={total}
          value={values[statement.id]}
          important={important[statement.id] ?? false}
          onAnswer={record}
          onSkip={() => record(null)}
          onToggleImportant={() => setImportant({ ...important, [statement.id]: !important[statement.id] })}
          onBack={back}
        />
      )}

      {/* Placeholder until task 1.6 builds the results step. */}
      {(step === 'resultados' || step === 'desglose') && (
        <section>
          <h1 tabIndex={-1}>{t('resultados.provisional')}</h1>
          <p>
            {t('resultados.provisionalTexto', {
              respondidas: Object.values(values).filter((v) => v !== null).length,
              total,
            })}
          </p>
          <button type="button" class="button button--secondary" onClick={() => setStep('afirmaciones')}>
            {t('cuestionario.anterior')}
          </button>
        </section>
      )}
    </div>
  );
}
