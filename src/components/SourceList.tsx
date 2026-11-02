import type { MessageKey, Translate } from '../i18n';

export interface SourceView {
  url: string;
  tipo: 'programa_electoral' | 'votacion_congreso' | 'declaracion_publica' | 'otro';
  titulo: string;
  /** Already formatted for display (e.g. «15 de octubre de 2026»). */
  fecha?: string;
}

interface Props {
  t: Translate;
  sources: readonly SourceView[];
}

/** Sources of a position. Links open in a new tab without sending the referrer. */
export function SourceList({ t, sources }: Props) {
  return (
    <ul class="sources">
      {sources.map((s) => (
        <li key={s.url}>
          <span class="sources__type">{t(`fuente.${s.tipo}` satisfies MessageKey)}</span>
          {s.fecha && <span class="sources__date"> · {s.fecha}</span>}
          <br />
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {s.titulo}
            <span class="visually-hidden"> {t('fuente.nuevaPestana')}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
