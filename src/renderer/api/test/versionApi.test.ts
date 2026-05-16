import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('versionApi', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns version info when remote payload is valid', async () => {
    const netFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: JSON.stringify({
        code: 200,
        data: {
          appName: 'eisland',
          version: '1.2.3',
          description: 'desc',
          downloadUrl: 'https://example.com',
          id: 1,
          updatedAt: '2026-01-01',
        },
      }),
    }));

    (globalThis as any).window = {
      location: { hostname: 'localhost' },
      api: { netFetch },
    };

    const { fetchVersion } = await import('../update/versionApi');
    const result = await fetchVersion();

    expect(result?.version).toBe('1.2.3');
    expect(netFetch).toHaveBeenCalledWith(
      'https://test.server.pyisland.com/api/v1/version?appName=eisland',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('reports update download count with trimmed version', async () => {
    const netFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: JSON.stringify({ code: 200 }),
    }));

    (globalThis as any).window = {
      location: { hostname: 'localhost' },
      api: { netFetch },
    };

    const { reportUpdateDownloadCount } = await import('../update/versionApi');
    const success = await reportUpdateDownloadCount(' 1.2.3 ');

    expect(success).toBe(true);
    expect(netFetch).toHaveBeenCalledWith(
      'https://test.server.pyisland.com/api/v1/version/update-count',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ appName: 'eisland', version: '1.2.3' }),
      }),
    );
  });

  it('returns false when reporting with empty version', async () => {
    const netFetch = vi.fn();
    (globalThis as any).window = {
      location: { hostname: 'localhost' },
      api: { netFetch },
    };

    const { reportUpdateDownloadCount } = await import('../update/versionApi');
    const success = await reportUpdateDownloadCount('   ');

    expect(success).toBe(false);
    expect(netFetch).not.toHaveBeenCalled();
  });
});
