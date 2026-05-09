import { randomUUID } from 'crypto';
import { createReadStream, createWriteStream, existsSync } from 'fs';
import { mkdir, open, rename, rm, unlink } from 'fs/promises';
import { basename, dirname, extname, join } from 'path';
import { pipeline } from 'stream/promises';

export type DownloadTaskStatus = 'downloading' | 'completed' | 'failed' | 'canceled';

export interface DownloadTaskSnapshot {
  id: string;
  url: string;
  savePath: string;
  fileName: string;
  totalBytes: number;
  downloadedBytes: number;
  progress: number;
  speedBytesPerSecond: number;
  threads: number;
  status: DownloadTaskStatus;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StartDownloadOptions {
  url: string;
  savePath?: string;
  threads?: number;
  defaultDir: string;
}

interface DownloadEngineOptions {
  onTaskUpdated?: (task: DownloadTaskSnapshot) => void;
}

interface DownloadProbeResult {
  fileName: string;
  totalBytes: number;
  supportsRange: boolean;
}

interface ChunkInfo {
  index: number;
  start: number;
  end: number;
  partPath: string;
}

interface InternalTask extends DownloadTaskSnapshot {
  tempDir: string;
  tempOutputPath: string;
  partPaths: string[];
  abortControllers: Set<AbortController>;
  lastSampleTime: number;
  lastSampleBytes: number;
  lastEmitTime: number;
}

const DEFAULT_THREADS = 8;
const MAX_THREADS = 16;
const MIN_THREADS = 1;
const EMIT_INTERVAL_MS = 160;
const MIN_CHUNK_BYTES = 1024 * 1024;

function normalizeThreads(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_THREADS;
  return Math.max(MIN_THREADS, Math.min(MAX_THREADS, Math.floor(value)));
}

function toTaskSnapshot(task: InternalTask): DownloadTaskSnapshot {
  return {
    id: task.id,
    url: task.url,
    savePath: task.savePath,
    fileName: task.fileName,
    totalBytes: task.totalBytes,
    downloadedBytes: task.downloadedBytes,
    progress: task.progress,
    speedBytesPerSecond: task.speedBytesPerSecond,
    threads: task.threads,
    status: task.status,
    errorMessage: task.errorMessage,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function parseContentDispositionFileName(headerValue: string): string {
  const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(headerValue);
  if (utf8Match && utf8Match[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }
  const simpleMatch = /filename\s*=\s*"?([^";]+)"?/i.exec(headerValue);
  if (simpleMatch && simpleMatch[1]) {
    return simpleMatch[1].trim();
  }
  return '';
}

function inferFileNameFromUrl(url: URL): string {
  const fromPath = basename(decodeURIComponent(url.pathname || ''));
  if (fromPath && fromPath !== '/' && fromPath !== '.') {
    return fromPath;
  }
  return `download-${Date.now()}.bin`;
}

function safeFileName(input: string): string {
  const safe = input.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  if (!safe) return `download-${Date.now()}.bin`;
  return safe.slice(0, 180);
}

function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (!(error instanceof Error)) return false;
  return error.name === 'AbortError' || /aborted|abort/i.test(error.message);
}

function buildChunks(totalBytes: number, threads: number, tempDir: string): ChunkInfo[] {
  const targetThreads = Math.max(1, Math.min(threads, Math.floor(totalBytes / MIN_CHUNK_BYTES) || 1));
  const chunkSize = Math.ceil(totalBytes / targetThreads);
  const chunks: ChunkInfo[] = [];
  let start = 0;
  for (let index = 0; index < targetThreads; index++) {
    const end = index === targetThreads - 1 ? totalBytes - 1 : Math.min(totalBytes - 1, start + chunkSize - 1);
    chunks.push({
      index,
      start,
      end,
      partPath: join(tempDir, `chunk-${index}.part`),
    });
    start = end + 1;
  }
  return chunks;
}

async function mergePartFiles(partPaths: string[], outputPath: string): Promise<void> {
  await rm(outputPath, { force: true }).catch(() => {});
  const writeStream = createWriteStream(outputPath, { flags: 'w' });
  for (let index = 0; index < partPaths.length; index++) {
    await pipeline(createReadStream(partPaths[index]), writeStream, { end: false });
  }
  await new Promise<void>((resolve, reject) => {
    writeStream.end(() => resolve());
    writeStream.on('error', reject);
  });
}

export class MultiThreadDownloadEngine {
  private readonly tasks = new Map<string, InternalTask>();

  private readonly onTaskUpdated?: (task: DownloadTaskSnapshot) => void;

  constructor(options?: DownloadEngineOptions) {
    this.onTaskUpdated = options?.onTaskUpdated;
  }

  listTasks(): DownloadTaskSnapshot[] {
    return Array.from(this.tasks.values()).map((task) => toTaskSnapshot(task));
  }

  getTask(taskId: string): DownloadTaskSnapshot | null {
    const task = this.tasks.get(taskId);
    return task ? toTaskSnapshot(task) : null;
  }

  async startDownload(options: StartDownloadOptions): Promise<DownloadTaskSnapshot> {
    const normalizedUrl = String(options.url || '').trim();
    if (!normalizedUrl) {
      throw new Error('下载地址不能为空');
    }
    const parsedUrl = new URL(normalizedUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('仅支持 HTTP/HTTPS 下载地址');
    }

    const probe = await this.probeRemoteFile(parsedUrl);
    const threads = normalizeThreads(options.threads);
    const savePath = options.savePath && options.savePath.trim()
      ? options.savePath.trim()
      : join(options.defaultDir, probe.fileName);

    await mkdir(dirname(savePath), { recursive: true });

    const taskId = randomUUID();
    const tempDir = join(dirname(savePath), `.eisland-download-${taskId}`);
    const tempOutputPath = join(tempDir, `target${extname(savePath) || '.tmp'}`);
    await mkdir(tempDir, { recursive: true });

    const now = Date.now();
    const task: InternalTask = {
      id: taskId,
      url: parsedUrl.toString(),
      savePath,
      fileName: basename(savePath),
      totalBytes: probe.totalBytes,
      downloadedBytes: 0,
      progress: 0,
      speedBytesPerSecond: 0,
      threads,
      status: 'downloading',
      createdAt: now,
      updatedAt: now,
      tempDir,
      tempOutputPath,
      partPaths: [],
      abortControllers: new Set<AbortController>(),
      lastSampleTime: now,
      lastSampleBytes: 0,
      lastEmitTime: 0,
    };

    this.tasks.set(task.id, task);
    this.emitTask(task, true);

    void this.executeDownload(task, probe).catch((error) => {
      this.handleTaskFailure(task, error);
    });

    return toTaskSnapshot(task);
  }

  cancelDownload(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    if (task.status !== 'downloading') return false;

    task.status = 'canceled';
    task.updatedAt = Date.now();
    task.abortControllers.forEach((controller) => controller.abort());
    task.abortControllers.clear();
    this.emitTask(task, true);
    return true;
  }

  private async probeRemoteFile(url: URL): Promise<DownloadProbeResult> {
    let fileName = inferFileNameFromUrl(url);
    let totalBytes = 0;
    let supportsRange = false;

    try {
      const headResponse = await fetch(url.toString(), { method: 'HEAD' });
      if (headResponse.ok) {
        const contentLength = headResponse.headers.get('content-length');
        totalBytes = Number(contentLength || 0) || 0;
        const acceptRanges = (headResponse.headers.get('accept-ranges') || '').toLowerCase();
        supportsRange = acceptRanges.includes('bytes');
        const disposition = headResponse.headers.get('content-disposition') || '';
        const dispositionName = parseContentDispositionFileName(disposition);
        if (dispositionName) {
          fileName = dispositionName;
        }
      }
    } catch {
      // ignore head errors
    }

    return {
      fileName: safeFileName(fileName),
      totalBytes,
      supportsRange,
    };
  }

  private async executeDownload(task: InternalTask, probe: DownloadProbeResult): Promise<void> {
    const useMultiThread = probe.supportsRange && probe.totalBytes > 0 && task.threads > 1;

    if (useMultiThread) {
      const chunks = buildChunks(probe.totalBytes, task.threads, task.tempDir);
      task.partPaths = chunks.map((chunk) => chunk.partPath);
      await Promise.all(chunks.map((chunk) => this.downloadChunk(task, chunk)));
      if (task.status === 'canceled') {
        await this.cleanupTaskFiles(task);
        return;
      }
      await mergePartFiles(task.partPaths, task.tempOutputPath);
    } else {
      await this.downloadSingle(task);
      if (task.status === 'canceled') {
        await this.cleanupTaskFiles(task);
        return;
      }
    }

    if (existsSync(task.savePath)) {
      await unlink(task.savePath).catch(() => {});
    }
    await rename(task.tempOutputPath, task.savePath);

    if (task.totalBytes <= 0) {
      task.totalBytes = task.downloadedBytes;
    }
    task.downloadedBytes = Math.max(task.downloadedBytes, task.totalBytes);
    task.progress = 1;
    task.speedBytesPerSecond = 0;
    task.status = 'completed';
    task.updatedAt = Date.now();
    this.emitTask(task, true);

    await this.cleanupTaskFiles(task, { keepOutput: true });
  }

  private async downloadSingle(task: InternalTask): Promise<void> {
    const controller = new AbortController();
    task.abortControllers.add(controller);
    try {
      const response = await fetch(task.url, { signal: controller.signal });
      if (!response.ok || !response.body) {
        throw new Error(`下载请求失败: HTTP ${response.status}`);
      }
      const contentLength = Number(response.headers.get('content-length') || 0) || 0;
      if (task.totalBytes <= 0 && contentLength > 0) {
        task.totalBytes = contentLength;
      }

      const fileHandle = await open(task.tempOutputPath, 'w');
      try {
        const reader = response.body.getReader();
        while (true) {
          const result = await reader.read();
          if (result.done) break;
          const chunk = result.value;
          if (chunk && chunk.byteLength > 0) {
            await fileHandle.write(chunk);
            task.downloadedBytes += chunk.byteLength;
            this.updateTaskProgress(task);
          }
        }
      } finally {
        await fileHandle.close();
      }
    } finally {
      task.abortControllers.delete(controller);
    }
  }

  private async downloadChunk(task: InternalTask, chunk: ChunkInfo): Promise<void> {
    const controller = new AbortController();
    task.abortControllers.add(controller);
    try {
      const response = await fetch(task.url, {
        signal: controller.signal,
        headers: {
          Range: `bytes=${chunk.start}-${chunk.end}`,
        },
      });
      if ((response.status !== 206 && response.status !== 200) || !response.body) {
        throw new Error(`分片下载失败: HTTP ${response.status}`);
      }

      const fileHandle = await open(chunk.partPath, 'w');
      try {
        const reader = response.body.getReader();
        while (true) {
          const result = await reader.read();
          if (result.done) break;
          const bytes = result.value;
          if (bytes && bytes.byteLength > 0) {
            await fileHandle.write(bytes);
            task.downloadedBytes += bytes.byteLength;
            this.updateTaskProgress(task);
          }
        }
      } finally {
        await fileHandle.close();
      }
    } finally {
      task.abortControllers.delete(controller);
    }
  }

  private updateTaskProgress(task: InternalTask): void {
    const now = Date.now();
    const elapsedMs = Math.max(1, now - task.lastSampleTime);
    const deltaBytes = task.downloadedBytes - task.lastSampleBytes;

    task.speedBytesPerSecond = Math.max(0, Math.round((deltaBytes / elapsedMs) * 1000));
    task.lastSampleBytes = task.downloadedBytes;
    task.lastSampleTime = now;
    task.updatedAt = now;

    if (task.totalBytes > 0) {
      task.progress = Math.max(0, Math.min(1, task.downloadedBytes / task.totalBytes));
    }

    this.emitTask(task, false);
  }

  private emitTask(task: InternalTask, force: boolean): void {
    const now = Date.now();
    if (!force && now - task.lastEmitTime < EMIT_INTERVAL_MS) return;
    task.lastEmitTime = now;
    this.onTaskUpdated?.(toTaskSnapshot(task));
  }

  private async cleanupTaskFiles(task: InternalTask, options?: { keepOutput?: boolean }): Promise<void> {
    if (!options?.keepOutput) {
      await rm(task.tempOutputPath, { force: true }).catch(() => {});
    }
    if (task.partPaths.length > 0) {
      await Promise.all(task.partPaths.map((path) => rm(path, { force: true }).catch(() => {})));
    }
    await rm(task.tempDir, { recursive: true, force: true }).catch(() => {});
  }

  private handleTaskFailure(task: InternalTask, error: unknown): void {
    if (task.status === 'canceled' || isAbortError(error)) {
      task.status = 'canceled';
      task.speedBytesPerSecond = 0;
      task.updatedAt = Date.now();
      this.emitTask(task, true);
      void this.cleanupTaskFiles(task);
      return;
    }

    task.status = 'failed';
    task.errorMessage = error instanceof Error ? error.message : String(error);
    task.speedBytesPerSecond = 0;
    task.updatedAt = Date.now();
    this.emitTask(task, true);
    void this.cleanupTaskFiles(task);
  }
}
