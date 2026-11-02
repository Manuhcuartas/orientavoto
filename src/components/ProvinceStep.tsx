import { useId, useRef, useState } from 'preact/hooks';
import type { Translate } from '../i18n';

export interface ConstituencyOption {
  codigo: string;
  nombre: string;
}

interface Props {
  t: Translate;
  /** Already sorted alphabetically. */
  constituencies: readonly ConstituencyOption[];
  /** Previous choice when coming back: a code, `null` (prefer not to say) or `undefined` (none yet). */
  initial: string | null | undefined;
  onContinue: (codigo: string | null) => void;
}

/** Value of the «Prefiero no indicarla» option. Not a valid INE code, so it cannot clash. */
const NONE = 'ninguna';

export function ProvinceStep({ t, constituencies, initial, onContinue }: Props) {
  const [value, setValue] = useState(initial === undefined ? '' : (initial ?? NONE));
  const [showError, setShowError] = useState(false);
  const select = useRef<HTMLSelectElement>(null);
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const submit = (event: Event) => {
    event.preventDefault();
    if (value === '') {
      setShowError(true);
      select.current?.focus();
      return;
    }
    onContinue(value === NONE ? null : value);
  };

  return (
    <form onSubmit={submit} noValidate>
      <h1 tabIndex={-1}>{t('provincia.titulo')}</h1>
      <p class="prose">{t('provincia.ayuda')}</p>

      <div class="field">
        <label for={id}>{t('provincia.etiqueta')}</label>
        <p id={hintId} class="field__hint">
          {t('provincia.ningunaAyuda')}
        </p>
        {showError && (
          <p id={errorId} class="field__error" role="alert">
            {t('provincia.error')}
          </p>
        )}
        <select
          id={id}
          ref={select}
          value={value}
          aria-describedby={showError ? `${errorId} ${hintId}` : hintId}
          aria-invalid={showError ? 'true' : undefined}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            setShowError(false);
          }}
        >
          <option value="" disabled>
            {t('provincia.placeholder')}
          </option>
          <option value={NONE}>{t('provincia.ninguna')}</option>
          {constituencies.map((c) => (
            <option key={c.codigo} value={c.codigo}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" class="button">
        {t('cuestionario.continuar')}
      </button>
    </form>
  );
}
