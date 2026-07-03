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
