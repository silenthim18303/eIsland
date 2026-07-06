---
watermark: true
title: CpuSnapshot
icon: fa6-solid:table
---

# CpuSnapshot

:::info
`CpuSnapshot` is the data structure returned by the `getCpu()` function in `@eisland/windows-performance-monitor`. It contains the current CPU usage percentage and a flag indicating whether a baseline measurement has been established. This interface is the primary way to read real-time CPU load from the performance monitor plugin.
:::

## Interface Introduction

`CpuSnapshot` is a snapshot object returned each time you call `getCpu()`. It represents a single point-in-time reading of CPU utilization. You do not construct this object yourself — it is always produced by the `getCpu()` function.

Because CPU usage measurement relies on comparing two samples (a delta), the very first call establishes a baseline. Until that baseline exists, the `usagePercent` value is unreliable and `hasBaseline` will be `false`.

## Usage

Call `getCpu()` at a regular interval (e.g. every 1–2 seconds) to track CPU load over time. On the first call, the plugin records an internal baseline snapshot. Subsequent calls compute the usage delta from that baseline and return meaningful percentages.

:::tip
Poll `getCpu()` on a timer rather than calling it in a tight loop. A 1-second interval is sufficient for most UI dashboards and avoids unnecessary overhead.
:::

:::note
The `hasBaseline` field tells you whether the returned `usagePercent` is trustworthy. Always check it before displaying or acting on the value.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `usagePercent` | `number` | CPU usage percentage, ranging from `0` to `100`. Unreliable when `hasBaseline` is `false`. |
| `hasBaseline` | `boolean` | `true` if an internal baseline has been established and the `usagePercent` is meaningful. `false` on the first call. |

:::warning
The first call to `getCpu()` always returns `hasBaseline: false`. The `usagePercent` value at that point is an approximation derived from insufficient data and should not be used for display or decision-making.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getCpu, CpuSnapshot } from '@eisland/windows-performance-monitor';

// First call establishes the internal baseline; result is not yet reliable
const first: CpuSnapshot = getCpu();
console.log(`Baseline ready: ${first.hasBaseline}`); // false

// Poll every second for accurate CPU readings
setInterval(() => {
  const snapshot: CpuSnapshot = getCpu();
  if (snapshot.hasBaseline) {
    // usagePercent is now meaningful — display it
    console.log(`CPU: ${snapshot.usagePercent.toFixed(1)}%`);
  } else {
    // Still waiting for baseline (only happens on first call)
    console.log('Waiting for baseline...');
  }
}, 1000);
```

@tab JavaScript

```js
const { getCpu } = require('@eisland/windows-performance-monitor');

// First call establishes the internal baseline; result is not yet reliable
const first = getCpu();
console.log(`Baseline ready: ${first.hasBaseline}`); // false

// Poll every second for accurate CPU readings
setInterval(() => {
  const snapshot = getCpu();
  if (snapshot.hasBaseline) {
    // usagePercent is now meaningful — display it
    console.log(`CPU: ${snapshot.usagePercent.toFixed(1)}%`);
  } else {
    // Still waiting for baseline (only happens on first call)
    console.log('Waiting for baseline...');
  }
}, 1000);
```

:::

## Notes

:::note
The CPU usage calculation is a delta between two samples. If you stop calling `getCpu()` for a long time and then resume, the first resumed call may produce an outlier value because the baseline is stale. Consider discarding the first reading after a long pause.
:::

:::note
`usagePercent` is a value between `0` and `100`. It represents overall system-wide CPU utilization across all cores, not a per-core breakdown.
:::

:::tip
If you need CPU data alongside memory and temperature readings, call `getCpu()`, `getMemory()`, and `getTemperature()` in the same timer callback to keep all snapshots temporally aligned.
:::

## Danger Avoidance

:::danger
Do not call `getCpu()` in a tight loop (e.g. `while(true)`) without any delay. Each call performs a system-level measurement. Rapid repeated calls waste CPU cycles and may produce meaningless zero-delta readings, paradoxically increasing the very resource usage you are trying to monitor. Always use an interval of at least 500ms.
:::

:::danger
Do not rely on the `usagePercent` value when `hasBaseline` is `false`. Displaying or acting on it may show misleading data to the user. Always gate your logic on the `hasBaseline` flag.
:::
