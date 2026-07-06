---
watermark: true
title: getMemory
icon: fa6-solid:code
---

# getMemory

:::info Introduction
`getMemory` is a synchronous function that returns a snapshot of the current system memory usage. It reports total, used, and available memory in bytes along with the overall usage percentage, making it straightforward to display RAM status in a widget or dashboard.
:::

## Signature

```typescript
function getMemory(): MemorySnapshot
```

## Usage

Call `getMemory()` whenever you need a point-in-time reading of system RAM. Because the function is synchronous and lightweight, you can safely call it on a timer (e.g. every 1-2 seconds) to keep a UI widget updated.

:::tip Polling Interval
For a smooth memory widget, poll every 1 000 - 2 000 ms. Calling it more frequently than 500 ms yields little new information and wastes CPU cycles.
:::

The returned [MemorySnapshot](memory-snapshot.md) object contains all the fields you need — no additional calls are required.

:::note Byte Units
All byte values (`totalBytes`, `usedBytes`, `availableBytes`) are in **bytes**. Divide by `1073741824` (1024^3) to convert to GiB, or by `1000000000` to convert to GB (decimal).
:::

## Return Value

Returns a [MemorySnapshot](memory-snapshot.md) object with the following shape:

| Property | Type | Description |
| --- | --- | --- |
| `totalBytes` | `number` | Total installed physical memory in bytes |
| `usedBytes` | `number` | Memory currently in use in bytes |
| `availableBytes` | `number` | Memory available for allocation in bytes |
| `usagePercent` | `number` | Memory usage as a percentage (0-100) |

```typescript
// Example return value
{
  totalBytes: 17179869184,    // 16 GB total
  usedBytes: 10737418240,     // ~10 GB used
  availableBytes: 6442450944, // ~6 GB available
  usagePercent: 62.5,         // 62.5% usage
}
```

:::warning No Error Return
`getMemory()` does not return `null` or throw under normal conditions. If the underlying system call fails unexpectedly, the process may throw a native error. Wrap the call in a `try / catch` if you are running in an environment where system APIs may be restricted.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getMemory } from '@eisland/windows-performance-monitor';
import type { MemorySnapshot } from '@eisland/windows-performance-monitor';

// Query the current memory snapshot
const mem: MemorySnapshot = getMemory();

// Convert bytes to GiB for display (1 GiB = 1073741824 bytes)
const totalGiB = (mem.totalBytes / 1073741824).toFixed(1);
const usedGiB = (mem.usedBytes / 1073741824).toFixed(1);
const availGiB = (mem.availableBytes / 1073741824).toFixed(1);

// Log a human-readable summary
console.log(`RAM: ${usedGiB} / ${totalGiB} GiB used`);
console.log(`Available: ${availGiB} GiB`);
console.log(`Usage: ${mem.usagePercent.toFixed(1)}%`);
```

@tab JavaScript

```js
const { getMemory } = require('@eisland/windows-performance-monitor');

// Query the current memory snapshot
const mem = getMemory();

// Convert bytes to GiB for display (1 GiB = 1073741824 bytes)
const totalGiB = (mem.totalBytes / 1073741824).toFixed(1);
const usedGiB = (mem.usedBytes / 1073741824).toFixed(1);
const availGiB = (mem.availableBytes / 1073741824).toFixed(1);

// Log a human-readable summary
console.log(`RAM: ${usedGiB} / ${totalGiB} GiB used`);
console.log(`Available: ${availGiB} GiB`);
console.log(`Usage: ${mem.usagePercent.toFixed(1)}%`);
```

:::

## Notes

:::note Snapshot Semantics
Each call to `getMemory()` returns an independent snapshot. The values of `usedBytes` and `availableBytes` reflect the system state at the instant the call is made and may differ slightly between successive calls.
:::

:::tip Combining with CPU Data
You can combine `getMemory()` with [getCpu()](get-cpu.md) in the same polling loop to build a comprehensive system monitor without noticeable performance overhead — both calls are synchronous and fast.
:::

:::note Percentage Precision
`usagePercent` is a floating-point value. Depending on the OS memory manager, very small fluctuations (e.g. 62.4% vs 62.5%) between polls are normal and do not indicate a problem.
:::

## Danger Avoidance

:::danger Do Not Spam Calls in a Tight Loop
Calling `getMemory()` in a `while (true)` loop without any delay will pin a CPU core and provide no useful benefit. Always use `setInterval` or a timer with a reasonable interval (1 000 ms or more).
:::

:::danger Avoid Unbounded Historical Storage
If you store every memory snapshot for charting, you will eventually exhaust heap memory. Use a fixed-size ring buffer (e.g. keep only the last 600 data points for a 10-minute chart at 1-second intervals).
:::
