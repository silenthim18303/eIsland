---
watermark: true
title: TemperatureCategory
icon: fa6-solid:list
---

# TemperatureCategory

:::info
Classification of hardware temperature sensor readings.
:::

## Values

| Value | Description |
|-------|-------------|
| `"cpu"` | CPU temperature sensor |
| `"gpu"` | GPU temperature sensor |
| `"motherboard"` | Motherboard chipset sensor |
| `"storage"` | Storage device (HDD/SSD) sensor |
| `"unknown"` | Unclassified sensor |

:::note
Categories are determined by the LibreHardwareMonitor library based on hardware sensor metadata.
:::

## Example

```typescript
import { getTemperature } from '@eisland/windows-performance-monitor';

const temp = getTemperature();
if (temp.isAvailable) {
  const cpuTemps = temp.readings.filter(r => r.category === 'cpu');
  cpuTemps.forEach(r => {
    console.log(`${r.label}: ${r.temperatureCelsius}°C`);
  });
}
```
