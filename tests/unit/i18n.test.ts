import { readdirSync, readFileSync } from 'node:fs';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import es from '../../src/i18n/es.json';
import { catalogs, createTranslator, defaultLocale, locales, localize, t, type Catalog, type MessageKey } from '../../src/i18n';

describe('t', () => {
  it('returns the text for a key', () => {
    expect(t('nav.inicio')).toBe('Inicio');
    expect(t('banner.ficticio')).toBe('DATOS FICTICIOS — NO USAR PARA DECIDIR EL VOTO');
  });

  it('interpolates parameters', () => {
    expect(t('pie.datos', { version: '0.0.1', fecha: '2 de noviembre de 2026' })).toBe(
      'Datos: versión 0.0.1, actualizados el 2 de noviembre de 2026.',
    );
    expect(t('sitio.tituloPagina', { titulo: 'Partidos' })).toBe('Partidos · Orientavoto');
  });

  it('leaves unknown placeholders as they are and ignores extra params', () => {
    expect(t('pie.datos', { version: 3, otro: 'x' })).toBe('Datos: versión 3, actualizados el {fecha}.');
  });

  it('throws in tests when a key is missing', () => {
    expect(() => t('nav.noExiste' as MessageKey)).toThrow('i18n: falta la clave «nav.noExiste»');
    expect(() => t('nav' as MessageKey)).toThrow(); // a group, not a text
  });
});

describe('locales and fallback', () => {
  const fake: Record<string, Catalog> = {
    es,
    xx: { nav: { inicio: 'Hasiera' }, pie: { datos: 'Datuak: {version}' } },
  };

  it('uses the locale’s own text when it has one', () => {
    const tx = createTranslator('xx', fake);
    expect(tx('nav.inicio')).toBe('Hasiera');
    expect(tx('pie.datos', { version: '1' })).toBe('Datuak: 1');
  });

  it('falls back to es for keys the locale lacks', () => {
    expect(createTranslator('xx', fake)('nav.partidos')).toBe('Partidos');
  });

  it('falls back to es for an unknown or missing locale', () => {
    expect(createTranslator('zz', fake)('nav.inicio')).toBe('Inicio');
    expect(createTranslator(undefined)('nav.inicio')).toBe('Inicio');
  });

  it('only es exists for now, and it is the default', () => {
    expect(defaultLocale).toBe('es');
    expect(Object.keys(catalogs)).toEqual(['es']);
  });
});

describe('localize (content texts from data/)', () => {
  it('uses the locale when present and falls back to es', () => {
    expect(localize({ es: 'Afirmación', ca: 'Afirmació' }, 'ca')).toBe('Afirmació');
    expect(localize({ es: 'Afirmación' }, 'ca')).toBe('Afirmación');
    expect(localize({ es: 'Afirmación', ca: '' }, 'ca')).toBe('Afirmación');
    expect(localize({ es: 'Afirmación' }, undefined)).toBe('Afirmación');
  });
});

describe('catalogs', () => {
  const leafKeys = (catalog: Catalog, prefix = ''): string[] =>
    Object.entries(catalog).flatMap(([k, v]) => (typeof v === 'string' ? [`${prefix}${k}`] : leafKeys(v, `${prefix}${k}.`)));
  const esKeys = new Set(leafKeys(es));

  it.each(Object.entries(catalogs))('%s only has keys that exist in es (no typos)', (_, catalog) => {
    expect(leafKeys(catalog).filter((k) => !esKeys.has(k))).toEqual([]);
  });

  it('every locale in the catalogs is in astro.config.mjs', () => {
    const config = readFileSync(new URL('../../astro.config.mjs', import.meta.url), 'utf8');
    const configured = /locales:\s*\[([^\]]*)\]/.exec(config)?.[1] ?? '';
    for (const locale of locales) expect(configured).toContain(`'${locale}'`);
  });
});

describe('no hard-coded visible text in components, layouts or pages', () => {
  // Visible text must come from src/i18n/<locale>.json or the { es } maps in data/.
  // .tsx files are parsed with the TypeScript compiler (JSX text and user-facing string
  // attributes); .astro markup is checked with a regex once frontmatter, styles and comments are removed.
  const roots = ['components', 'layouts', 'pages'].map((d) => new URL(`../../src/${d}/`, import.meta.url));
  const files = roots.flatMap((root) =>
    readdirSync(root, { recursive: true, encoding: 'utf8' })
      .filter((f) => /\.(tsx|astro)$/.test(f))
      .map((f) => new URL(f, root)),
  );
  const VISIBLE_ATTRIBUTES = new Set(['aria-label', 'alt', 'title', 'placeholder', 'aria-description']);
  /** Icons and punctuation are allowed as literal text; words are not. */
  const hasWords = (text: string) => /\p{L}{2,}/u.test(text);

  function tsxTexts(source: string): string[] {
    const found: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isJsxText(node) && hasWords(node.text)) found.push(node.text.trim());
      if (
        ts.isJsxAttribute(node) &&
        VISIBLE_ATTRIBUTES.has(node.name.getText()) &&
        node.initializer &&
        ts.isStringLiteral(node.initializer) &&
        hasWords(node.initializer.text)
      ) {
        found.push(node.initializer.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(ts.createSourceFile('x.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX));
    return found;
  }

  function astroTexts(source: string): string[] {
    const markup = source
      .replace(/^---[\s\S]*?\n---/, '') // frontmatter is code, not markup
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<!--[\s\S]*?-->/g, '');
    const texts = [...markup.matchAll(/>([^<>{}]+)</g)].map((m) => (m[1] ?? '').trim());
    const attributes = [...markup.matchAll(/\b([a-z-]+)="([^"{]+)"/g)]
      .filter((m) => VISIBLE_ATTRIBUTES.has(m[1] ?? ''))
      .map((m) => m[2] ?? '');
    return [...texts, ...attributes].filter(hasWords);
  }

  const textsIn = (file: URL) => {
    const source = readFileSync(file, 'utf8');
    return file.pathname.endsWith('.tsx') ? tsxTexts(source) : astroTexts(source);
  };

  it('finds the files to check', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(files.map((f) => [f.pathname.replace(/.*\/src\//, 'src/'), f] as const))('%s', (_, file) => {
    expect(textsIn(file)).toEqual([]);
  });

  it('the detector catches hard-coded text and ignores icons, expressions and TS generics', () => {
    expect(
      tsxTexts('const a = useState<string>(x); const b = n < 2 && m > 1;\nexport const C = () => <p aria-label="Cerrar" title={t("x")}>Texto fijo {t("y")} ★ · ✓</p>;'),
    ).toEqual(['Cerrar', 'Texto fijo']);
    expect(astroTexts('---\nconst a = 1 < 2;\n---\n<p>Hola</p><b>{t("x")} ·</b><img alt="Logo" /><!-- nota -->')).toEqual(['Hola', 'Logo']);
  });
});
