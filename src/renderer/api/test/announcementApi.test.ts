import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('announcementApi', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('reads and writes announcement show mode via store', async () => {
    const storeRead = vi.fn(async () => 'always');
    const storeWrite = vi.fn(async () => {});
    (globalThis as any).window = {
      location: { hostname: 'localhost' },
      api: { storeRead, storeWrite, netFetch: vi.fn() },
    };

    const { readAnnouncementShowMode, writeAnnouncementShowMode } = await import('../announcement/announcementApi');

    await expect(readAnnouncementShowMode()).resolves.toBe('always');
    await writeAnnouncementShowMode('version-update-only');
    expect(storeWrite).toHaveBeenCalledWith('announcement-show-mode', 'version-update-only');
  });

  it('fetches current announcement and normalizes nullable fields', async () => {
    const netFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: JSON.stringify({ code: 200, data: { title: 't', content: 'c', updatedAt: '2026' } }),
    }));

    (globalThis as any).window = {
      location: { hostname: 'localhost' },
      api: {
        storeRead: vi.fn(),
        storeWrite: vi.fn(),
        netFetch,
      },
    };

    const { fetchCurrentAnnouncement } = await import('../announcement/announcementApi');
    const data = await fetchCurrentAnnouncement();

    expect(data?.title).toBe('t');
    expect(data?.content).toBe('c');
  });
});
