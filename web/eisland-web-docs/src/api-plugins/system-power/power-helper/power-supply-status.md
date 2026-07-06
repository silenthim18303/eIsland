---
watermark: true
title: PowerSupplyStatus
icon: fa6-solid:list
---

# PowerSupplyStatus

:::info
`PowerSupplyStatus` is a constant enum that represents the current state of the external power supply (AC adapter). It is part of the [PowerInfo](power-info.md) interface and is returned by [getPowerInfo()](get-power-info.md) as well as emitted with every [PowerMonitor](power-monitor.md) event. Use it to determine whether the device is connected to a reliable power source.
:::

## Values

| Value | Name | Description |
|-------|------|-------------|
| `0` | `NotPresent` | No external power supply detected (e.g., running on battery with no charger) |
| `1` | `Adequate` | External power supply is connected and providing sufficient power |
| `2` | `Inadequate` | External power supply is connected but cannot deliver enough current |
| `3` | `Unknown` | Power supply status cannot be determined |

:::note
Because `PowerSupplyStatus` is a TypeScript `const enum`, its values are inlined at compile time. In JavaScript, you must compare against the raw numeric values (`0`, `1`, `2`, `3`) unless you access the enum through the TypeScript compilation output.
:::

## Usage

`PowerSupplyStatus` is not something you query independently. It always appears as the `powerSupplyStatus` field inside a `PowerInfo` object. You obtain it in two ways:

1. **Snapshot query** -- call [getPowerInfo()](get-power-info.md) to read the current status once.
2. **Real-time monitoring** -- subscribe to [PowerMonitor](power-monitor.md) events; every event callback receives a `PowerInfo` object containing this field.

The most common pattern is checking `powerSupplyStatus` to decide whether to warn the user about an unreliable charger or to throttle power-hungry features.

:::tip
Combine `powerSupplyStatus` with [BatteryStatus](battery-status.md) and `isCharging` for a full picture. For example, `Adequate` + `isCharging === false` + `remainingChargePercent === 100` means the battery is fully charged and the charger is still plugged in.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getPowerInfo, PowerSupplyStatus } from '@eisland/windows-power-helper';

// Query the current power info snapshot
const info = getPowerInfo();

if (info) {
  // Check if the charger is connected but underpowered
  if (info.powerSupplyStatus === PowerSupplyStatus.Inadequate) {
    console.warn('Charger is connected but cannot supply enough power');
  }

  // Check if no external power is present
  if (info.powerSupplyStatus === PowerSupplyStatus.NotPresent) {
    console.log('Running on battery only');
  }

  // Check if power supply is normal
  if (info.powerSupplyStatus === PowerSupplyStatus.Adequate) {
    console.log('External power is connected and adequate');
  }
}
```

@tab JavaScript

```js
const { getPowerInfo } = require('@eisland/windows-power-helper');

// Query the current power info snapshot
const info = getPowerInfo();

if (info) {
  // In JS, const enum values are inlined as numbers at compile time.
  // Compare against the raw numeric value: Inadequate = 2
  if (info.powerSupplyStatus === 2) {
    console.warn('Charger is connected but cannot supply enough power');
  }

  // NotPresent = 0
  if (info.powerSupplyStatus === 0) {
    console.log('Running on battery only');
  }

  // Adequate = 1
  if (info.powerSupplyStatus === 1) {
    console.log('External power is connected and adequate');
  }
}
```

:::

## Notes

:::note
The `Inadequate` status typically appears when a USB-C charger or docking station is connected but cannot deliver sufficient wattage for the device's current load. This is common with low-wattage phone chargers plugged into laptops.
:::

:::note
On desktop machines without a battery, `powerSupplyStatus` is usually `Adequate` as long as the system is running on mains power. However, on UPS-backed systems, it may temporarily read `Inadequate` or `NotPresent` during a power outage.
:::

:::tip
If you only need a simple "is the charger plugged in?" check, use the `isOnAcPower` boolean from [PowerInfo](power-info.md) instead of comparing `powerSupplyStatus`. The enum gives you finer-grained control when the distinction between `Adequate` and `Inadequate` matters for your feature.
:::

## Danger Avoidance

:::danger
Do not assume `PowerSupplyStatus.Adequate` (value `1`) means the battery is charging. The charger can be adequate yet the battery may already be full (`isCharging === false`). Always check `isCharging` separately if you need to know whether energy is actively flowing into the battery.
:::

:::danger
When using JavaScript (not TypeScript), never import the enum name `PowerSupplyStatus` expecting it to be a runtime object. Because it is a `const enum`, TypeScript erases it during compilation. You must compare against the raw numeric values (`0`, `1`, `2`, `3`) directly, or use the TypeScript compiler's `--preserveConstEnums` flag to emit a runtime object.
:::
