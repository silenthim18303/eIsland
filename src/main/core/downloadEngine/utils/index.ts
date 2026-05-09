import { createReadStream, createWriteStream } from 'fs';
import { rm } from 'fs/promises';
import { basename, join } from 'path';
import { pipeline } from 'stream/promises';
import { DEFAULT_THREADS, MAX_THREADS, MIN_CHUNK_BYTES, MIN_THREADS } from '../config';

export interface ChunkInfo {
  index: number;
  start: number;
  end: number;
  partPath: string;
}

export function normalizeThreads(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_THREADS;
  return Math.max(MIN_THREADS, Math.min(MAX_THREADS, Math.floor(value)));
}

export function parseContentDispositionFileName(headerValue: string): string {
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

export function inferFileNameFromUrl(url: URL): string {
  const fromPath = basename(decodeURIComponent(url.pathname || ''));
  if (fromPath && fromPath !== '/' && fromPath !== '.') {
    return fromPath;
  }
  return `download-${Date.now()}.bin`;
}

export function safeFileName(input: string): string {
  const safe = input.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  if (!safe) return `download-${Date.now()}.bin`;
  return safe.slice(0, 180);
}

export function isAbortError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (!(error instanceof Error)) return false;
  return error.name === 'AbortError' || /aborted|abort/i.test(error.message);
}

export function buildChunks(totalBytes: number, threads: number, tempDir: string): ChunkInfo[] {
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

export async function mergePartFiles(partPaths: string[], outputPath: string): Promise<void> {
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
