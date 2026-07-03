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
