import { describe, it, expect } from 'vitest';
import type { CommandResult } from '../index';

const smtc = require('../') as { pause(): CommandResult };

describe('pause', () => {
  it('is exported as a function', () => {
    expect(typeof smtc.pause).toBe('function');
  });

  it('returns a CommandResult object', () => {
    const result = smtc.pause();
    expect(typeof result).toBe('object');
    expect(typeof result.success).toBe('boolean');
  });

  it('returns error string on failure', () => {
    const result = smtc.pause();
    if (!result.success) {
      expect(typeof result.error).toBe('string');
    } else {
      expect(result.error).toBeNull();
    }
  });

  it('never throws', () => {
    expect(() => smtc.pause()).not.toThrow();
  });
});
