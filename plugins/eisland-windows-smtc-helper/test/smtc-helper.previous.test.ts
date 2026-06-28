import { describe, it, expect } from 'vitest';
import type { CommandResult } from '../index';

const smtc = require('../') as { previous(): CommandResult };

describe('previous', () => {
  it('is exported as a function', () => {
    expect(typeof smtc.previous).toBe('function');
  });

  it('returns a CommandResult object', () => {
    const result = smtc.previous();
    expect(typeof result).toBe('object');
    expect(typeof result.success).toBe('boolean');
  });

  it('returns error string on failure', () => {
    const result = smtc.previous();
    if (!result.success) {
      expect(typeof result.error).toBe('string');
    } else {
      expect(result.error).toBeNull();
    }
  });

  it('never throws', () => {
    expect(() => smtc.previous()).not.toThrow();
  });
});
