---
watermark: true
title: getHardwareList
icon: fa6-solid:code
---

# getHardwareList

:::info
Returns the list of detected CPUs and GPUs via the LibreHardwareMonitor helper EXE.
:::

## Signature

```typescript
function getHardwareList(): HardwareListSnapshot
```

## Return Value

[HardwareListSnapshot](hardware-list-snapshot.md) object.

```typescript
// Example return value
{
  isAvailable: true,
  cpus: [
    { id: 'cpu-0', name: 'Intel Core i7-12700K', category: 'cpu', hardwareType: 'Cpu', source: 'libre-hardware-monitor' },
  ],
  gpus: [
    { id: 'gpu-0', name: 'NVIDIA GeForce RTX 4070', category: 'gpu', hardwareType: 'GpuNvidia', source: 'libre-hardware-monitor' },
  ],
}
```

:::warning
Requires the LibreHardwareMonitor helper EXE. Returns `isAvailable: false` if the helper is unavailable.
:::

## Example

```typescript
import { getHardwareList } from '@eisland/windows-performance-monitor';

const hw = getHardwareList();
if (hw.isAvailable) {
  console.log('=== Hardware ===');
  hw.cpus.forEach(c => console.log(`  CPU: ${c.name}`));
  hw.gpus.forEach(g => console.log(`  GPU: ${g.name}`));
}
```
