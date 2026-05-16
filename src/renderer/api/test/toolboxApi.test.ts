import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('toolbox apis', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('fetchToolboxSoftwareList returns list when payload is valid', async () => {
    const netFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: JSON.stringify({
        code: 200,
        data: [{ id: 1, name: 'Steam', description: 'desc', url: 'u', iconUrl: 'i' }],
      }),
    }));

    (globalThis as any).window = {
      location: { hostname: 'localhost' },
      api: { netFetch },
    };

    const { fetchToolboxSoftwareList } = await import('../tools/toolboxSoftwareApi');
    const list = await fetchToolboxSoftwareList();

    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Steam');
  });

  it('fetchTranslate returns normalized error on non-200 payload', async () => {
    const netFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: JSON.stringify({ code: 500, message: 'failed' }),
    }));

    (globalThis as any).window = {
      location: { hostname: '127.0.0.1' },
      api: { netFetch },
    };

    const { fetchTranslate } = await import('../tools/toolboxTranslateApi');
    const result = await fetchTranslate('token', 'hello', 'en', 'zh');

    expect(result.success).toBe(false);
    expect(result.message).toBe('failed');
    expect(netFetch).toHaveBeenCalledWith(
      'https://test.server.pyisland.com/api/v1/toolbox/translate',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('fetchTranslate returns success data on code 200', async () => {
    const netFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: JSON.stringify({
        code: 200,
        data: {
          targetText: '你好',
          source: 'en',
          target: 'zh',
          requestId: 'r1',
        },
      }),
    }));

    (globalThis as any).window = {
      location: { hostname: 'localhost' },
      api: { netFetch },
    };

    const { fetchTranslate } = await import('../tools/toolboxTranslateApi');
    const result = await fetchTranslate('token', 'hello', 'en', 'zh');

    expect(result.success).toBe(true);
    expect(result.data?.targetText).toBe('你好');
  });
});
