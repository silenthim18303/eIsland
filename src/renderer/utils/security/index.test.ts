import { describe, expect, it } from 'vitest';
import { buildReplayHeaders, createReplayNonce } from './index';

describe('security utils', () => {
  it('creates 16-byte hex nonce', () => {
    const nonce = createReplayNonce();
    expect(nonce).toMatch(/^[0-9a-f]{32}$/);
  });

  it('builds replay headers with given names and timestamp', () => {
    const headers = buildReplayHeaders('x-ts', 'x-nonce', 1234567890);
    expect(headers['x-ts']).toBe('1234567890');
    expect(headers['x-nonce']).toMatch(/^[0-9a-f]{32}$/);
  });
});
