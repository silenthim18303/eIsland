/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file inflate.test.ts
 * @description inflateAuto 单元测试 — mock DecompressionStream / Blob / Response
 * @author 鸡哥
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { inflateAuto } from '../inflate';

describe('inflateAuto', () => {
  const origDS = globalThis.DecompressionStream;
  const origBlob = globalThis.Blob;
  const origResponse = globalThis.Response;

  /** Return true for formats that should throw in the mock DecompressionStream. */
  let formatGuard: (format: string) => boolean = () => false;

  beforeEach(() => {
    // Mock DecompressionStream: pass-through TransformStream, or throw per formatGuard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock global
    (globalThis as Record<string, unknown>).DecompressionStream = class {
      readable: ReadableStream<Uint8Array>;
      writable: WritableStream<Uint8Array>;
      constructor(format: string) {
        if (formatGuard(format)) {
          throw new Error('mock decompression failure');
        }
        const ts = new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, controller) {
            controller.enqueue(chunk);
          },
        });
        this.readable = ts.readable;
        this.writable = ts.writable;
      }
    };

    // Mock Blob: stream() emits each ArrayBuffer part as a chunk
    (globalThis as Record<string, unknown>).Blob = class {
      private parts: ArrayBuffer[];
      constructor(parts: ArrayBuffer[]) {
        this.parts = parts;
      }
      stream(): ReadableStream<Uint8Array> {
        const parts = this.parts;
        return new ReadableStream({
          start(controller) {
            parts.forEach((p) => {
              if (p.byteLength > 0) controller.enqueue(new Uint8Array(p));
            });
            controller.close();
          },
        });
      }
    };

    // Mock Response: collect stream into a single ArrayBuffer
    (globalThis as Record<string, unknown>).Response = class {
      private _stream: ReadableStream;
      constructor(stream: ReadableStream) {
        this._stream = stream;
      }
      async arrayBuffer(): Promise<ArrayBuffer> {
        const reader = this._stream.getReader();
        const chunks: Uint8Array[] = [];
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const len = chunks.reduce((s, c) => s + c.length, 0);
        const buf = new Uint8Array(len);
        let off = 0;
        chunks.forEach((c) => {
          buf.set(c, off);
          off += c.length;
        });
        return buf.buffer;
      }
    };
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).DecompressionStream = origDS;
    (globalThis as Record<string, unknown>).Blob = origBlob;
    (globalThis as Record<string, unknown>).Response = origResponse;
  });

  it('empty input throws because decompressed output is empty', async () => {
    formatGuard = () => false;
    // Empty data -> decompress produces empty output -> byteLength > 0 guard fires
    await expect(inflateAuto(new Uint8Array(0))).rejects.toThrow(
      /both zlib and raw deflate failed/,
    );
  });

  it('valid deflated data is inflated correctly (pass-through mock)', async () => {
    const input = new Uint8Array([1, 2, 3, 4, 5]);
    formatGuard = () => false;

    const result = await inflateAuto(input);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([1, 2, 3, 4, 5]);
  });

  it('falls back to raw deflate when zlib fails', async () => {
    const input = new Uint8Array([10, 20, 30]);
    // 'deflate' throws, 'deflate-raw' passes through
    formatGuard = (f) => f === 'deflate';

    const result = await inflateAuto(input);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([10, 20, 30]);
  });

  it('throws when both zlib and raw deflate fail', async () => {
    formatGuard = () => true;

    await expect(inflateAuto(new Uint8Array([1, 2, 3]))).rejects.toThrow(
      /both zlib and raw deflate failed/,
    );
  });
});
