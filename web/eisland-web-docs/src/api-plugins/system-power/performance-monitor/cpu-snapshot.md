---
watermark: true
title: CpuSnapshot
icon: fa6-solid:table
---

# CpuSnapshot

:::info
CPU usage data returned by getCpu().
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `usagePercent` | `number` | CPU usage percentage (0–100) |
| `hasBaseline` | `boolean` | Whether a baseline measurement exists (first call establishes baseline) |

:::warning
The first call to `getCpu()` establishes a baseline and may return `hasBaseline: false` with an unreliable `usagePercent`. Call it twice with a short interval for accurate readings.
:::

## Example

```typescript
import { getCpu } from '@eisland/windows-performance-monitor';

// First call establishes baseline
getCpu();

// Second call after a short interval returns meaningful data
setTimeout(() => {
  const cpu = getCpu();
  console.log(`CPU usage: ${cpu.usagePercent.toFixed(1)}%`);
  console.log(`Has baseline: ${cpu.hasBaseline}`);
}, 1000);
```