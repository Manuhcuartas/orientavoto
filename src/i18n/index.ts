/**
 * UI texts. Each locale is a JSON file in this folder with the same nested
 * structure as `es.json`; any key a locale lacks falls back to `es`.
 * Content texts (statements, parties…) are `{ es }` maps in `data/`, not here.
 *
 *   t('nav.inicio')                         → "Inicio"
 *   t('pie.datos', { version: '1.0', … })   → "Datos: versión 1.0, …"
 */
import es from './es.json';

export type Messages = typeof es;

/** Dotted paths to every string in `es.json`: `'nav.inicio'`, `'banner.ficticio'`… */
export type MessageKey = LeafPaths<Messages>;

type LeafPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : LeafPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** A catalog may be partial: missing keys fall back to `es`. */
export interface Catalog {
  [key: string]: string | Catalog;
}

export type Params = Readonly<Record<string, string | number>>;

export const defaultLocale = 'es';

/** Locales with a UI catalog. Keep in sync with `i18n.locales` in astro.config.mjs (see docs/IDIOMAS.md). */
export const catalogs: Readonly<Record<string, Catalog>> = { es };

export const locales: readonly string[] = Object.keys(catalogs);

/**
 * Picks a content text (`{ es, … }` maps in data/) for a locale, falling back to `es`.
 * Today data/ only has `es`; when a locale is added to the schema, pages use this
 * instead of reading `.es` directly.
 */
export function localize(text: Readonly<{ es: string } & Partial<Record<string, string>>>, locale: string | undefined): string {
  return (locale && text[locale]) || text.es;
}

/** Thrown in dev and tests; in production the key itself is shown instead of breaking the page. */
const strictMissingKeys = import.meta.env.DEV || import.meta.env.MODE === 'test';

export type Translate = (key: MessageKey, params?: Params) => string;

export function createTranslator(
  locale: string | undefined,
  available: Readonly<Record<string, Catalog>> = catalogs,
): Translate {
  const primary = (locale && available[locale]) || undefined;
  const fallback = available[defaultLocale];

  return (key, params) => {
    const template = (primary && lookup(primary, key)) ?? (fallback && lookup(fallback, key));
    if (template === undefined) {
      if (strictMissingKeys) throw new Error(`i18n: falta la clave «${key}»`);
      return key;
    }
    return params ? interpolate(template, params) : template;
  };
}

/** Translator for the default locale. Pages with a locale use `createTranslator(Astro.currentLocale)`. */
export const t: Translate = createTranslator(defaultLocale);

function lookup(catalog: Catalog, key: string): string | undefined {
  let node: string | Catalog | undefined = catalog;
  for (const part of key.split('.')) {
    if (typeof node !== 'object') return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/** Replaces `{name}` with `params.name`; unknown placeholders are left as they are. */
function interpolate(template: string, params: Params): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}
