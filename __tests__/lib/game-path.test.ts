import { describe, it, expect } from 'vitest';
import { cleanGamePath, gamePathKey } from '@/lib/game-path';

describe('cleanGamePath', () => {
  it('rimuove separatori finali (backslash e slash, anche multipli)', () => {
    expect(cleanGamePath('E:\\Games\\Foo\\')).toBe('E:\\Games\\Foo');
    expect(cleanGamePath('E:/Games/Foo/')).toBe('E:/Games/Foo');
    expect(cleanGamePath('E:\\Games\\Foo\\\\')).toBe('E:\\Games\\Foo');
  });

  it('fa trim degli spazi', () => {
    expect(cleanGamePath('  E:\\Games\\Foo  ')).toBe('E:\\Games\\Foo');
  });

  it('preserva caso e separatori interni (path FS valido)', () => {
    expect(cleanGamePath('E:\\SteamLibrary\\steamapps\\common\\Look Outside'))
      .toBe('E:\\SteamLibrary\\steamapps\\common\\Look Outside');
  });

  it('gestisce input vuoto/degenere senza lanciare', () => {
    expect(cleanGamePath('')).toBe('');
    expect(cleanGamePath(undefined as unknown as string)).toBe('');
  });
});

describe('gamePathKey', () => {
  it('lo stesso gioco produce la stessa chiave con separatori diversi', () => {
    expect(gamePathKey('E:\\Games\\Foo')).toBe(gamePathKey('E:/Games/Foo'));
  });

  it('lo stesso gioco produce la stessa chiave con casing diverso', () => {
    expect(gamePathKey('E:\\SteamLibrary\\Foo')).toBe(gamePathKey('e:\\steamlibrary\\foo'));
  });

  it('lo stesso gioco produce la stessa chiave con slash finale', () => {
    expect(gamePathKey('E:\\Games\\Foo\\')).toBe(gamePathKey('E:\\Games\\Foo'));
  });

  it('giochi diversi producono chiavi diverse', () => {
    expect(gamePathKey('E:\\Games\\Foo')).not.toBe(gamePathKey('E:\\Games\\Bar'));
  });

  it('forma normalizzata: slash, lowercase, senza slash finale', () => {
    expect(gamePathKey('E:\\SteamLibrary\\Common\\Game\\')).toBe('e:/steamlibrary/common/game');
  });
});
