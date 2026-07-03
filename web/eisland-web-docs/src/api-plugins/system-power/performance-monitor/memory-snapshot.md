---
watermark: true
title: MemorySnapshot
icon: fa6-solid:table
---

# MemorySnapshot

:::info
System memory usage data returned by getMemory().
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `totalBytes` | `number` | Total physical memory in bytes |
| `usedBytes` | `number` | Used memory in bytes |
| `availableBytes` | `number` | Available memory in bytes |
| `usagePercent` | `number` | Memory usage percentage (0–100) |

## Example

```typescript
import { getMemory } from '@eisland/windows-performance-monitor';

const mem = getMemory();
const totalGB = (mem.totalBytes / 1073741824).toFixed(1);
const usedGB = (mem.usedBytes / 1073741824).toFixed(1);
console.log(`Memory: ${usedGB}/${totalGB} GB (${mem.usagePercent.toFixed(1)}%)`);
```
