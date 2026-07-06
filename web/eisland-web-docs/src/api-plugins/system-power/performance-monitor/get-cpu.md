---
watermark: true
title: getCpu
icon: fa6-solid:code
---

# getCpu

:::info
`getCpu` is a synchronous function from `@eisland/windows-performance-monitor` that returns the current CPU usage as a [CpuSnapshot](cpu-snapshot.md) object. It works by measuring the CPU idle time delta between consecutive calls — the first call establishes a baseline, and subsequent calls return meaningful usage percentages.
:::

## Signature

```typescript
function getCpu(): CpuSnapshot
```

## Usage

`getCpu` is designed to be called repeatedly on a timer. Because CPU usage is calculated from the difference between two measurements, you must call it at least once to establish a baseline before the returned `usagePercent` is meaningful.

:::tip Recommended Polling Interval
Call `getCpu` every 1–3 seconds for responsive yet lightweight monitoring. Polling faster than 500ms yields diminishing returns and wastes CPU cycles on the measurement itself.
:::

Typical workflow:

1. Import the function from `@eisland/windows-performance-monitor`.
2. Call it once to establish the baseline (the return value will have `hasBaseline: false`).
3. Call it on a recurring interval — subsequent calls will return accurate `usagePercent` values with `hasBaseline: true`.

:::note Baseline is Per-Process
The baseline is established per native module instance. If your application restarts or re-imports the module, the first call again returns `hasBaseline: false`.
:::

## Return Value

Returns a [CpuSnapshot](cpu-snapshot.md) object with the following shape:

```typescript
{
  usagePercent: number;   // CPU usage as a percentage (0–100)
  hasBaseline: boolean;   // true once at least two calls have been made
}
```

:::warning First Call Returns Zero Usage
On the very first call, `usagePercent` will be `0` and `hasBaseline` will be `false`. Do not display this value to users as real CPU usage — always check `hasBaseline` before using `usagePercent`.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getCpu, CpuSnapshot } from '@eisland/windows-performance-monitor';

// First call establishes the baseline; discard the result
getCpu();

// Subsequent calls return meaningful CPU usage data
setInterval(() => {
  // getCpu() is synchronous — safe to call inside a timer callback
  const cpu: CpuSnapshot = getCpu();

  // Only use usagePercent once the baseline has been established
  if (cpu.hasBaseline) {
    // Format to one decimal place for display
    console.log(`CPU Usage: ${cpu.usagePercent.toFixed(1)}%`);
  }
}, 2000);
```

@tab JavaScript

```js
const { getCpu } = require('@eisland/windows-performance-monitor');

// First call establishes the baseline; discard the result
getCpu();

// Subsequent calls return meaningful CPU usage data
setInterval(() => {
  // getCpu() is synchronous — safe to call inside a timer callback
  const cpu = getCpu();

  // Only use usagePercent once the baseline has been established
  if (cpu.hasBaseline) {
    // Format to one decimal place for display
    console.log(`CPU Usage: ${cpu.usagePercent.toFixed(1)}%`);
  }
}, 2000);
```

:::

## Notes

:::note Synchronous Call
`getCpu` is a synchronous function backed by a native addon. It does not return a Promise and does not require `await`. The execution time is typically sub-millisecond.
:::

:::tip Combining with Other Monitors
You can combine `getCpu` with [getMemory](get-memory.md) and [getTemperature](get-temperature.md) in the same polling loop to build a unified system health dashboard without multiple timers.
:::

:::note Cross-Platform Limitation
This API relies on Windows-specific performance counters (PDH). It is not available on macOS or Linux. If you need cross-platform support, consider using Node.js built-in `os.cpus()` as a fallback.
:::

## Danger Avoidance

:::danger Do Not Poll at Extreme Rates
Calling `getCpu` in a tight loop (e.g., every 10ms or without any delay) will waste CPU cycles on the measurement itself and produce unreliable delta-based readings. Always use a reasonable interval of at least 500ms.
:::

:::danger Do Not Assume hasBaseline is Always True
If you access `usagePercent` without checking `hasBaseline`, you risk displaying `0%` to users on the first measurement cycle. Always gate your UI updates on `hasBaseline === true`.
:::
