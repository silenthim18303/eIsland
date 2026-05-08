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

interface PushFloat32FramesOptions {
  input: Float32Array<ArrayBufferLike>;
  pending: Float32Array<ArrayBufferLike>;
  frameSize: number;
  onFrame: (pcm16: Int16Array) => void;
}

export function pushFloat32Frames(options: PushFloat32FramesOptions): Float32Array<ArrayBufferLike> {
  const { input, pending, frameSize, onFrame } = options;
  if (input.length === 0) return pending;

  const merged = new Float32Array(pending.length + input.length);
  merged.set(pending);
  merged.set(input, pending.length);

  let offset = 0;
  while (offset + frameSize <= merged.length) {
    const frame = merged.subarray(offset, offset + frameSize);
    const pcm16 = new Int16Array(frame.length);
    for (let i = 0; i < frame.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, frame[i]));
      pcm16[i] = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
    }
    onFrame(pcm16);
    offset += frameSize;
  }

  return merged.slice(offset);
}
