import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('siteMetaApi', () => {
  beforeEach(() => {
    vi.resetModules();
    const store = new Map<string, string>();
    (globalThis as any).localStorage = {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => { store.set(key, value); },
      removeItem: (key: string) => { store.delete(key); },
      clear: () => { store.clear(); },
    };
  });

  it('parses html title and favicon candidates', async () => {
    (globalThis as any).window = {
      api: {
        netFetch: vi.fn(),
      },
    };
    const { parseHtmlTitle, getWebsiteFaviconUrls } = await import('../site/siteMetaApi');

    expect(parseHtmlTitle('<html><title> A &amp; B </title></html>')).toBe('A & B');
    const urls = getWebsiteFaviconUrls('https://example.com/path');
    expect(urls[0]).toBe('https://example.com/favicon.ico');
    expect(urls.some((u) => u.includes('duckduckgo.com'))).toBe(true);
  });

  it('stores and reads authorization policy by hostname', async () => {
    (globalThis as any).window = {
      api: {
        netFetch: vi.fn(),
      },
    };
    const { setWebsiteAuthorizationPolicy, getWebsiteAuthorizationPolicy } = await import('../site/siteMetaApi');

    setWebsiteAuthorizationPolicy('https://EXAMPLE.com/a', 'allow');
    expect(getWebsiteAuthorizationPolicy('https://example.com/b')).toBe('allow');

    setWebsiteAuthorizationPolicy('https://example.com/b', 'ask');
    expect(getWebsiteAuthorizationPolicy('https://example.com/c')).toBe('ask');
  });

  it('fetches preferred favicon with HEAD fallback to GET', async () => {
    const netFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404, body: '' })
      .mockResolvedValueOnce({ ok: true, status: 200, body: '' });

    (globalThis as any).window = { api: { netFetch } };

    const { getWebsitePreferredFaviconUrl } = await import('../site/siteMetaApi');
    const url = await getWebsitePreferredFaviconUrl('https://example.com/page', 1000);

    expect(url).toBe('https://example.com/favicon.ico');
    expect(netFetch).toHaveBeenNthCalledWith(
      1,
      'https://example.com/favicon.ico',
      expect.objectContaining({ method: 'HEAD' }),
    );
    expect(netFetch).toHaveBeenNthCalledWith(
      2,
      'https://example.com/favicon.ico',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
