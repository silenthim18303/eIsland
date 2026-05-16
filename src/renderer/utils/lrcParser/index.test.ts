import { describe, expect, it } from 'vitest';
import {
  cleanArtist,
  cleanTitle,
  extractSyncedFromArray,
  extractSyncedFromObject,
  parseKrc,
  parseLrcTime,
  parseSyncedLrc,
  parseYrc,
} from './index';

describe('lrcParser', () => {
  it('parses lrc time tag with millisecond precision', () => {
    expect(parseLrcTime('01:02.3')).toBe(62300);
    expect(parseLrcTime('01:02.34')).toBe(62340);
    expect(parseLrcTime('01:02.345')).toBe(62345);
    expect(parseLrcTime('xx')).toBeNull();
  });

  it('parses synced lrc and filters metadata lines', () => {
    const lines = parseSyncedLrc('[00:10.00]作词 张三\n[00:20.00]第二行\n[00:05.00]第一行');
    expect(lines).toEqual([
      { time_ms: 5000, text: '第一行' },
      { time_ms: 20000, text: '第二行' },
    ]);
  });

  it('parses yrc word tags into plain lines', () => {
    const lines = parseYrc('[1000,3000](0,500,0)你(500,500,0)好');
    expect(lines).toEqual([{ time_ms: 1000, text: '你好' }]);
  });

  it('falls back to lrc parser when content is not krc', () => {
    const lines = parseKrc('[00:01.00]Hello');
    expect(lines).toEqual([{ time_ms: 1000, text: 'Hello' }]);
  });

  it('cleans title and artist text', () => {
    expect(cleanTitle('Song Name (Live) feat. Artist')).toBe('Song Name');
    expect(cleanArtist('Singer A / Singer B feat. C')).toBe('Singer A');
  });

  it('extracts synced lyrics from object and array payload', () => {
    const objectResult = extractSyncedFromObject({ syncedLyrics: '[00:01.00]Line' });
    expect(objectResult).toEqual([{ time_ms: 1000, text: 'Line' }]);

    const arrayResult = extractSyncedFromArray([
      { syncedLyrics: '' },
      { syncedLyrics: '[00:02.00]Another' },
    ]);
    expect(arrayResult).toEqual([{ time_ms: 2000, text: 'Another' }]);
  });
});
