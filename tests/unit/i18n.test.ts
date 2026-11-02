import { describe, expect, it } from 'vitest';
import es from '../../src/i18n/es.json';
import { catalogs, createTranslator, defaultLocale, t, type Catalog, type MessageKey } from '../../src/i18n';

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
