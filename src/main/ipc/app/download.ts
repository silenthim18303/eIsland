import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { MultiThreadDownloadEngine, type DownloadTaskSnapshot } from '../../core/downloadEngine';

interface RegisterDownloadIpcHandlersOptions {
  getDownloadsPath: () => string;
}

interface DownloadStartPayload {
  url?: unknown;
  savePath?: unknown;
  threads?: unknown;
}

let registered = false;

function sanitizeThreads(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 8;
  return Math.max(1, Math.min(16, Math.floor(value)));
}

function sanitizeSuggestedName(input: unknown): string {
  if (typeof input !== 'string') return `download-${Date.now()}.bin`;
  const safe = input.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  return safe || `download-${Date.now()}.bin`;
}

function normalizeStartPayload(payload: unknown): { url: string; savePath?: string; threads: number } {
  const row = (payload ?? {}) as DownloadStartPayload;
  const url = typeof row.url === 'string' ? row.url.trim() : '';
  const savePath = typeof row.savePath === 'string' ? row.savePath.trim() : '';
  const threads = sanitizeThreads(row.threads);
  return {
    url,
    savePath: savePath || undefined,
    threads,
  };
}

export function registerDownloadIpcHandlers(options: RegisterDownloadIpcHandlersOptions): void {
  if (registered) return;
  registered = true;

  const emitToRenderer = (task: DownloadTaskSnapshot): void => {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win.isDestroyed()) return;
      try {
        win.webContents.send('download:task-updated', task);
      } catch {
        // ignore
      }
    });
  };

  const engine = new MultiThreadDownloadEngine({
    onTaskUpdated: emitToRenderer,
  });

  ipcMain.handle('download:start', async (_event, payload: unknown) => {
    try {
      const normalized = normalizeStartPayload(payload);
      if (!normalized.url) {
        return { ok: false, message: '下载地址不能为空' } as const;
      }
      const task = await engine.startDownload({
        url: normalized.url,
        savePath: normalized.savePath,
        threads: normalized.threads,
        defaultDir: options.getDownloadsPath(),
      });
      return { ok: true, task } as const;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, message } as const;
    }
  });

  ipcMain.handle('download:cancel', (_event, taskId: unknown) => {
    const id = typeof taskId === 'string' ? taskId.trim() : '';
    if (!id) return false;
    return engine.cancelDownload(id);
  });

  ipcMain.handle('download:list', () => {
    return engine.listTasks();
  });

  ipcMain.handle('download:get', (_event, taskId: unknown) => {
    const id = typeof taskId === 'string' ? taskId.trim() : '';
    if (!id) return null;
    return engine.getTask(id);
  });

  ipcMain.handle('download:pick-save-path', async (event, suggestedName: unknown) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender) ?? BrowserWindow.getFocusedWindow();
      if (!win) return null;
      const fileName = sanitizeSuggestedName(suggestedName);
      const result = await dialog.showSaveDialog(win, {
        title: '选择保存位置',
        defaultPath: join(options.getDownloadsPath(), fileName),
      });
      if (result.canceled) return null;
      return result.filePath ?? null;
    } catch (error) {
      console.error('[Download] pick save path error:', error);
      return null;
    }
  });

  ipcMain.handle('download:get-default-dir', () => {
    return options.getDownloadsPath() || app.getPath('downloads');
  });
}
