---
watermark: true
title: TemperatureReading
icon: fa6-solid:table
---

# TemperatureReading

:::info
A single temperature sensor reading.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique sensor identifier |
| `label` | `string` | Human-readable sensor name |
| `category` | [TemperatureCategory](temperature-category.md) | Sensor category |
| `temperatureCelsius` | `number` | Temperature in degrees Celsius |
| `source` | `"libre-hardware-monitor"` | Data source identifier |

## Example

```typescript
import { getTemperature } from '@eisland/windows-performance-monitor';

const temp = getTemperature();
temp.readings.forEach(r => {
  const icon = r.category === 'cpu' ? '🖥️' : r.category === 'gpu' ? '🎮' : '🔧';
  console.log(`${icon} ${r.label}: ${r.temperatureCelsius}°C`);
});
```
