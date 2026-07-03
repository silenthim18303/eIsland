---
watermark: true
title: getCpu
icon: fa6-solid:code
---

# getCpu

:::info
Returns the current CPU usage. The first call establishes a baseline; subsequent calls return meaningful usage data.
:::

## Signature

```typescript
function getCpu(): CpuSnapshot
```

## Return Value

[CpuSnapshot](cpu-snapshot.md) object.

:::warning
The first call establishes a baseline and returns `hasBaseline: false`. Call again after a short interval for accurate usage data.
:::

## Example

```typescript
import { getCpu } from '@eisland/windows-performance-monitor';

// First call establishes baseline
getCpu();

// Subsequent calls return meaningful data
setInterval(() => {
  const cpu = getCpu();
  if (cpu.hasBaseline) {
    console.log(`CPU: ${cpu.usagePercent.toFixed(1)}%`);
  }
}, 2000);
```
