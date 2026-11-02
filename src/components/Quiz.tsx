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
import { ProvinceStep, type ConstituencyOption } from './ProvinceStep';

export type Step = 'provincia' | 'afirmaciones' | 'resultados' | 'desglose';

interface Props {
  locale: string;
  constituencies: readonly ConstituencyOption[];
}

export default function Quiz({ locale, constituencies }: Props) {
  const t = createTranslator(locale);
  const [step, setStep] = useState<Step>('provincia');
  /** `undefined` until chosen; `null` = prefers not to say (state-wide parties only). */
  const [constituency, setConstituency] = useState<string | null | undefined>(undefined);

  // On every step change (not on first load), move focus to the new step's heading
  // so keyboard and screen reader users start at the top of it.
  const root = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    root.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [step]);

  const constituencyName =
    constituency === null
      ? t('provincia.ninguna')
      : (constituencies.find((c) => c.codigo === constituency)?.nombre ?? '');

  return (
    <div ref={root}>
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

      {/* Placeholder until task 1.5 builds the statements step. */}
      {step !== 'provincia' && (
        <section>
          <h1 tabIndex={-1}>{t('afirmaciones.provisional')}</h1>
          <p>{t('afirmaciones.provisionalTexto', { provincia: constituencyName })}</p>
          <button type="button" class="button button--secondary" onClick={() => setStep('provincia')}>
            {t('cuestionario.anterior')}
          </button>
        </section>
      )}
    </div>
  );
}
