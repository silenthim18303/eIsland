---
watermark: true
title: HardwareDevice
icon: fa6-solid:table
---

# HardwareDevice

:::info
Information about a detected hardware device (CPU or GPU).
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique hardware identifier |
| `name` | `string` | Device name (e.g., "Intel Core i7-12700K") |
| `category` | `"cpu" \| "gpu"` | Device category |
| `hardwareType` | `string` | Hardware type string from LibreHardwareMonitor |
| `source` | `"libre-hardware-monitor"` | Data source identifier |

## Example

```typescript
import { getHardwareList } from '@eisland/windows-performance-monitor';

const hw = getHardwareList();
if (hw.isAvailable) {
  hw.cpus.forEach(cpu => console.log(`CPU: ${cpu.name} (${cpu.hardwareType})`));
  hw.gpus.forEach(gpu => console.log(`GPU: ${gpu.name} (${gpu.hardwareType})`));
}
```
