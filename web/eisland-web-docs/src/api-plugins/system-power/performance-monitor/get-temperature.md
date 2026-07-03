---
watermark: true
title: getTemperature
icon: fa6-solid:code
---

# getTemperature

:::info
Returns hardware temperature readings via the LibreHardwareMonitor helper EXE.
:::

## Signature

```typescript
function getTemperature(): TemperatureSnapshot
```

## Return Value

[TemperatureSnapshot](temperature-snapshot.md) object. `isAvailable` is `false` if the helper EXE is not running or has no sensors.

```typescript
// Example return value
{
  isAvailable: true,
  readings: [
    { id: 'cpu-0', label: 'CPU Core #1', category: 'cpu', temperatureCelsius: 58, source: 'libre-hardware-monitor' },
    { id: 'cpu-1', label: 'CPU Core #2', category: 'cpu', temperatureCelsius: 61, source: 'libre-hardware-monitor' },
    { id: 'gpu-0', label: 'GPU Core', category: 'gpu', temperatureCelsius: 72, source: 'libre-hardware-monitor' },
  ],
  maxTemperatureCelsius: 72,
}
```

:::warning
Requires the LibreHardwareMonitor helper EXE (`eIslandTemperatureReader.exe`) to be running. Returns `isAvailable: false` if the helper is unavailable.
:::

## Example

```typescript
import { getTemperature } from '@eisland/windows-performance-monitor';

const temp = getTemperature();
if (!temp.isAvailable) {
  console.log('Temperature unavailable — ensure eIslandTemperatureReader.exe is running');
  process.exit(0);
}

console.log(`Max: ${temp.maxTemperatureCelsius}°C`);
temp.readings.forEach(r => {
  console.log(`  ${r.label} [${r.category}]: ${r.temperatureCelsius}°C`);
});
```
