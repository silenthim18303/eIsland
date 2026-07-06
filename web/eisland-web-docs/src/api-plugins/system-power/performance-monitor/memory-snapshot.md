---
watermark: true
title: MemorySnapshot
icon: fa6-solid:table
---

# MemorySnapshot

:::info Introduction
`MemorySnapshot` is the data interface returned by [getMemory()](./getMemory.md). It represents a point-in-time snapshot of system physical memory usage, including total capacity, consumed memory, available memory, and a pre-calculated usage percentage. Use this interface to build memory monitors, display utilization gauges, or trigger alerts when memory pressure is high.
:::

## Interface Introduction

You will encounter `MemorySnapshot` whenever you call `getMemory()` from the `@eisland/windows-performance-monitor` plugin. Each call returns a fresh snapshot reflecting the current state of system RAM at the moment of invocation. The interface contains only raw numeric fields — all byte values are in bytes and the percentage is a normalized 0–100 float.

```ts
// The shape of every object returned by getMemory()
export interface MemorySnapshot {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
  usagePercent: number;
}
```

## Usage

Call `getMemory()` to obtain a `MemorySnapshot`. The returned object is a plain data bag with no methods or lifecycle — it does not update itself. To track memory over time, call `getMemory()` repeatedly on your own schedule (e.g. inside `setInterval`).

:::tip Polling Strategy
For a live memory display, poll every 2–5 seconds. Polling faster than 1 second yields negligible accuracy gains while increasing CPU overhead. Combine with `getCpu()` and `getTemperature()` to build a full system health dashboard.
:::

:::note Synchronous Call
`getMemory()` is a synchronous native call. It blocks the calling thread for a few milliseconds. In an Electron renderer process, prefer calling it from the main process or a worker thread and sending the result via IPC to avoid janking the UI.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `totalBytes` | `number` | Total installed physical memory in bytes. This value does not change between calls on the same system. |
| `usedBytes` | `number` | Memory currently in use by the OS and all processes, in bytes. |
| `availableBytes` | `number` | Memory available for allocation without swapping, in bytes. |
| `usagePercent` | `number` | Memory usage as a percentage from 0 to 100. Calculated as `(usedBytes / totalBytes) * 100`. |

:::tip Converting Bytes to Gigabytes
To display bytes as GB, divide by `1073741824` (2^30) for GiB or `1000000000` for GB. The example below uses GiB.
:::

:::note Byte vs Percentage Consistency
`usagePercent` is derived from `usedBytes` and `totalBytes`. You can compute it yourself with `(usedBytes / totalBytes) * 100` and will get the same value. There is no rounding mismatch to worry about.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getMemory } from '@eisland/windows-performance-monitor';
import type { MemorySnapshot } from '@eisland/windows-performance-monitor';

// Take a single memory snapshot
const mem: MemorySnapshot = getMemory();

// Convert bytes to GiB for display
const totalGB: string = (mem.totalBytes / 1073741824).toFixed(1);
const usedGB: string = (mem.usedBytes / 1073741824).toFixed(1);
const availGB: string = (mem.availableBytes / 1073741824).toFixed(1);

// Log a human-readable summary
console.log(`RAM: ${usedGB} / ${totalGB} GiB (${mem.usagePercent.toFixed(1)}%)`);
console.log(`Available: ${availGB} GiB`);

// Poll every 3 seconds for a live readout
const intervalId: ReturnType<typeof setInterval> = setInterval(() => {
  const snapshot: MemorySnapshot = getMemory();
  console.log(`RAM: ${snapshot.usagePercent.toFixed(1)}%`);
}, 3000);

// Stop polling when no longer needed
// clearInterval(intervalId);
```

@tab JavaScript

```js
const { getMemory } = require('@eisland/windows-performance-monitor');

// Take a single memory snapshot
const mem = getMemory();

// Convert bytes to GiB for display
const totalGB = (mem.totalBytes / 1073741824).toFixed(1);
const usedGB = (mem.usedBytes / 1073741824).toFixed(1);
const availGB = (mem.availableBytes / 1073741824).toFixed(1);

// Log a human-readable summary
console.log(`RAM: ${usedGB} / ${totalGB} GiB (${mem.usagePercent.toFixed(1)}%)`);
console.log(`Available: ${availGB} GiB`);

// Poll every 3 seconds for a live readout
const intervalId = setInterval(() => {
  const snapshot = getMemory();
  console.log(`RAM: ${snapshot.usagePercent.toFixed(1)}%`);
}, 3000);

// Stop polling when no longer needed
// clearInterval(intervalId);
```

:::

## Notes

:::note No Historical Data
`MemorySnapshot` only captures the current instant. It does not track trends, peaks, or averages. If you need history (e.g. a rolling 60-second graph), store snapshots in an array yourself and evict old entries.
:::

:::tip Combining with Other Snapshots
Pair `getMemory()` with `getCpu()` and `getTemperature()` in the same polling loop to build a unified system health view. All three calls are synchronous and fast, so calling them together inside a single `setInterval` callback is fine.
:::

:::note Electron IPC Best Practice
In an Electron app, call `getMemory()` in the main process and forward the result to the renderer via `ipcMain` / `ipcRenderer`. This keeps the native call off the renderer's main thread and avoids potential UI stutter on low-end machines.
:::

## Danger Avoidance

:::danger Do Not Poll in a Tight Loop
Calling `getMemory()` without any delay (e.g. in a `while (true)` loop) will pin a CPU core and degrade system performance. Always use `setInterval`, `setTimeout`, or an equivalent mechanism to space out calls — even a 1-second interval is sufficient for most use cases.
:::

:::danger Do Not Assume Bytes Are Mebibytes
All byte values (`totalBytes`, `usedBytes`, `availableBytes`) are in **bytes**, not KiB or MiB. Dividing by `1024` once gives KiB, twice gives MiB, three times gives GiB. Forgetting to divide correctly is a common source of wildly wrong displayed values.
:::
