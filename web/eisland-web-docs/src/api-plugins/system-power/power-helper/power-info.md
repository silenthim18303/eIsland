---
watermark: true
title: PowerInfo
icon: fa6-solid:table
---

# PowerInfo

:::info
Complete power status snapshot including battery, supply, and energy saver state.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `remainingChargePercent` | `number` | Battery charge 0–100 (100 on desktops without battery) |
| `batteryStatus` | [BatteryStatus](battery-status.md) | Current battery status |
| `powerSupplyStatus` | [PowerSupplyStatus](power-supply-status.md) | Power supply status |
| `energySaverStatus` | [EnergySaverStatus](energy-saver-status.md) | Energy saver mode status |
| `hasBattery` | `boolean` | Whether a battery is present |
| `isCharging` | `boolean` | Whether the battery is charging |
| `isOnAcPower` | `boolean` | Whether AC power is connected |

:::tip
On desktop systems without a battery, `hasBattery` is `false` and `remainingChargePercent` defaults to `100`.
:::

## Example

```typescript
import { getPowerInfo } from '@eisland/windows-power-helper';

const info = getPowerInfo();
if (info) {
  console.log(`Battery: ${info.remainingChargePercent}%`);
  console.log(`Charging: ${info.isCharging}`);
  console.log(`AC Power: ${info.isOnAcPower}`);
  console.log(`Has Battery: ${info.hasBattery}`);
}
```
