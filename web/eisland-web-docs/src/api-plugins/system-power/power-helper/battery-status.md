---
watermark: true
title: BatteryStatus
icon: fa6-solid:list
---

# BatteryStatus

:::info
Battery charge status values.
:::

## Values

| Value | Name | Description |
|-------|------|-------------|
| `0` | `NotPresent` | No battery present (desktop systems) |
| `1` | `Discharging` | Battery is discharging |
| `2` | `Idle` | Battery fully charged, AC connected |
| `3` | `Charging` | Battery is charging |

:::note
Desktop systems without a battery report `NotPresent`. The `Idle` state means the battery is full and AC is connected.
:::

## Example

```typescript
import { getPowerInfo, BatteryStatus } from '@eisland/windows-power-helper';

const info = getPowerInfo();
if (info) {
  switch (info.batteryStatus) {
    case BatteryStatus.Charging:
      console.log(`Charging: ${info.remainingChargePercent}%`);
      break;
    case BatteryStatus.Discharging:
      console.log(`On battery: ${info.remainingChargePercent}%`);
      break;
    case BatteryStatus.Idle:
      console.log('Battery full, AC connected');
      break;
    case BatteryStatus.NotPresent:
      console.log('No battery (desktop)');
      break;
  }
}
```
