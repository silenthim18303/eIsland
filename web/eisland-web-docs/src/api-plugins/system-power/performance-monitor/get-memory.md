---
watermark: true
title: getMemory
icon: fa6-solid:code
---

# getMemory

:::info
Returns the current system memory usage.
:::

## Signature

```typescript
function getMemory(): MemorySnapshot
```

## Return Value

[MemorySnapshot](memory-snapshot.md) object.

## Example

```typescript
import { getMemory } from '@eisland/windows-performance-monitor';

const mem = getMemory();
console.log(`RAM: ${(mem.usedBytes / 1073741824).toFixed(1)} / ${(mem.totalBytes / 1073741824).toFixed(1)} GB`);
console.log(`Available: ${(mem.availableBytes / 1073741824).toFixed(1)} GB`);
```
