---
watermark: true
title: TemperatureSnapshot
icon: fa6-solid:table
---

# TemperatureSnapshot

:::info
Collection of temperature readings from all available sensors.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isAvailable` | `boolean` | Whether temperature data is available (requires LibreHardwareMonitor) |
| `readings` | [TemperatureReading](temperature-reading.md)`[]` | Array of sensor readings |
| `maxTemperatureCelsius` | `number \| null` | Highest temperature across all sensors, `null` if no readings |

## Example

```typescript
import { getTemperature } from '@eisland/windows-performance-monitor';

const temp = getTemperature();
if (temp.isAvailable) {
  console.log(`${temp.readings.length} sensor(s) found`);
  if (temp.maxTemperatureCelsius !== null) {
    console.log(`Max temperature: ${temp.maxTemperatureCelsius}°C`);
  }
} else {
  console.log('Temperature data unavailable — is the helper EXE running?');
}
```
