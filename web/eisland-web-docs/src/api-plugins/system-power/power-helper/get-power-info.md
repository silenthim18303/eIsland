---
watermark: true
title: getPowerInfo
icon: fa6-solid:code
---

# getPowerInfo

:::info
Returns a snapshot of the current power status.
:::

## Signature

```typescript
function getPowerInfo(): PowerInfo | null
```

## Return Value

[PowerInfo](power-info.md) object, or `null` if power info cannot be read.

```typescript
// Example return value
{
  remainingChargePercent: 78,
  batteryStatus: 3,     // BatteryStatus.Charging
  powerSupplyStatus: 1, // PowerSupplyStatus.Adequate
  energySaverStatus: 1, // EnergySaverStatus.Off
  hasBattery: true,
  isCharging: true,
  isOnAcPower: true,
}
```

:::warning
Returns `null` if the power status cannot be read from the system.
:::

## Example

```typescript
import { getPowerInfo } from '@eisland/windows-power-helper';

const info = getPowerInfo();
if (info) {
  const status = info.isCharging ? '⚡ Charging' : '🔋 On battery';
  console.log(`${status}: ${info.remainingChargePercent}%`);
} else {
  console.log('Unable to read power info');
}
```
