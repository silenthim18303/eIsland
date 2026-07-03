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
