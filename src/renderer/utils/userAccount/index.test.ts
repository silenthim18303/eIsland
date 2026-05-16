import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  USER_ACCOUNT_LOGOUT_MARKER_KEY,
  USER_ACCOUNT_PROFILE_STORAGE_KEY,
  USER_ACCOUNT_TOKEN_STORAGE_KEY,
  USER_ACCOUNT_SESSION_CHANGED_EVENT,
  clearLocalAccount,
  getRoleFromToken,
  readLocalProfile,
  readLocalToken,
  subscribeUserAccountSessionChanged,
  writeLocalProfile,
  writeLocalToken,
} from './index';

class MemoryStorage {
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

describe('userAccount utils', () => {
  const storage = new MemoryStorage();
  const listeners = new Map<string, Set<() => void>>();

  beforeEach(() => {
    storage.clear();
    listeners.clear();

    Object.defineProperty(globalThis, 'localStorage', {
      value: storage,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis, 'atob', {
      value: (input: string) => Buffer.from(input, 'base64').toString('binary'),
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis, 'window', {
      value: {
        api: {
          storeWrite: vi.fn().mockResolvedValue(undefined),
        },
        addEventListener: vi.fn((event: string, cb: () => void) => {
          if (!listeners.has(event)) listeners.set(event, new Set());
          listeners.get(event)!.add(cb);
        }),
        removeEventListener: vi.fn((event: string, cb: () => void) => {
          listeners.get(event)?.delete(cb);
        }),
        dispatchEvent: vi.fn((evt: Event) => {
          listeners.get(evt.type)?.forEach((cb) => cb());
          return true;
        }),
      },
      configurable: true,
      writable: true,
    });
  });

  it('writes and reads token with side effects', () => {
    writeLocalToken('abc-token');
    expect(readLocalToken()).toBe('abc-token');

    writeLocalToken(null);
    expect(readLocalToken()).toBeNull();
  });

  it('writes and reads profile', () => {
    const profile = {
      username: 'tester',
      email: 't@example.com',
      avatar: null,
      gender: 'undisclosed' as const,
      genderCustom: null,
      birthday: null,
      createdAt: '2026-01-01T00:00:00Z',
    };

    writeLocalProfile(profile);
    expect(readLocalProfile()).toEqual(profile);

    writeLocalProfile(null);
    expect(readLocalProfile()).toBeNull();
  });

  it('subscribes and unsubscribes session change event', () => {
    const handler = vi.fn();
    const off = subscribeUserAccountSessionChanged(handler);

    writeLocalToken('token');
    expect(handler).toHaveBeenCalledTimes(1);

    off();
    writeLocalToken('next-token');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('parses role from jwt payload', () => {
    const payload = Buffer.from(JSON.stringify({ role: 'ROLE_PRO' })).toString('base64url');
    const token = `a.${payload}.c`;

    expect(getRoleFromToken(token)).toBe('pro');
    expect(getRoleFromToken('invalid')).toBeNull();
  });

  it('clears local account token/profile', () => {
    storage.setItem(USER_ACCOUNT_TOKEN_STORAGE_KEY, 'x');
    storage.setItem(USER_ACCOUNT_PROFILE_STORAGE_KEY, JSON.stringify({ id: 1 }));
    storage.setItem(USER_ACCOUNT_LOGOUT_MARKER_KEY, 'false');

    clearLocalAccount();

    expect(readLocalToken()).toBeNull();
    expect(readLocalProfile()).toBeNull();
  });

  it('uses session changed event constant', () => {
    expect(USER_ACCOUNT_SESSION_CHANGED_EVENT).toBe('user-account-session-changed');
  });
});
