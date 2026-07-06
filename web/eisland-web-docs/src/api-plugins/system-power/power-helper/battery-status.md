---
watermark: true
title: BatteryStatus
icon: fa6-solid:list
---

# BatteryStatus

:::info
BatteryStatus is a constant enum representing the current charge state of the system battery. It is accessed via the `batteryStatus` field of [PowerInfo](power-info.md) and is returned by both [getPowerInfo()](get-power-info.md) and [PowerMonitor](power-monitor.md) events.
:::

## Values

| Value | Name | Description |
|-------|------|-------------|
| `0` | `NotPresent` | No battery present (desktop systems) |
| `1` | `Discharging` | Battery is discharging |
| `2` | `Idle` | Battery fully charged, AC connected |
| `3` | `Charging` | Battery is charging |

:::note
`BatteryStatus` is a `const enum`, which means TypeScript inlines the numeric values at compile time. In JavaScript, you compare against the raw numbers (0, 1, 2, 3) instead of the enum members.
:::

:::tip
The `Idle` state (value `2`) specifically means the battery is at 100% and AC power is connected. If the battery is full but AC is disconnected, the state will be `Discharging` rather than `Idle`.
:::

## Usage

BatteryStatus is always obtained as part of a [PowerInfo](power-info.md) object. You never construct it directly. Typical access patterns:

- Call [getPowerInfo()](get-power-info.md) for a one-time snapshot and read `info.batteryStatus`.
- Listen to [PowerMonitor](power-monitor.md) events (e.g., `power-changed`, `charging`, `discharging`) and read `info.batteryStatus` from the callback argument.

:::tip
When writing a `switch` statement over BatteryStatus, always include a `default` branch. New battery states could be added in future Windows versions, and the native layer may pass an unexpected numeric value.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getPowerInfo, BatteryStatus } from '@eisland/windows-power-helper';

// Take a one-time power snapshot
const info = getPowerInfo();

// getPowerInfo() returns null if the system call fails
if (info) {
  switch (info.batteryStatus) {
    case BatteryStatus.Charging:
      // Battery is actively charging; show the current percentage
      console.log(`Charging: ${info.remainingChargePercent}%`);
      break;
    case BatteryStatus.Discharging:
      // Running on battery power; warn if charge is low
      console.log(`On battery: ${info.remainingChargePercent}%`);
      break;
    case BatteryStatus.Idle:
      // Battery is full and AC is connected
      console.log('Battery full, AC connected');
      break;
    case BatteryStatus.NotPresent:
      // Desktop systems typically have no battery
      console.log('No battery (desktop)');
      break;
    default:
      // Handle any unknown future status values
      console.log(`Unknown battery status: ${info.batteryStatus}`);
  }
}
```

@tab JavaScript

```js
const { getPowerInfo } = require('@eisland/windows-power-helper');

// Take a one-time power snapshot
const info = getPowerInfo();

// getPowerInfo() returns null if the system call fails
if (info) {
  // In JS, compare against raw numbers since const enum is not available
  switch (info.batteryStatus) {
    case 3: // Charging
      // Battery is actively charging; show the current percentage
      console.log(`Charging: ${info.remainingChargePercent}%`);
      break;
    case 1: // Discharging
      // Running on battery power; warn if charge is low
      console.log(`On battery: ${info.remainingChargePercent}%`);
      break;
    case 2: // Idle
      // Battery is full and AC is connected
      console.log('Battery full, AC connected');
      break;
    case 0: // NotPresent
      // Desktop systems typically have no battery
      console.log('No battery (desktop)');
      break;
    default:
      // Handle any unknown future status values
      console.log(`Unknown battery status: ${info.batteryStatus}`);
  }
}
```

:::

## Notes

:::note
On desktop systems without a battery, `batteryStatus` is `NotPresent` (0) and `hasBattery` is `false`. The `remainingChargePercent` field still reports `100` in this case, which can be misleading if you do not also check `hasBattery`.
:::

:::tip
If you only need to know whether the system is charging or not, use the `isCharging` boolean on [PowerInfo](power-info.md) instead of comparing `batteryStatus` — it is simpler and covers edge cases automatically.
:::

:::note
The `battery-low` event on [PowerMonitor](power-monitor.md) fires when `remainingChargePercent` drops to 15% or below. The `batteryStatus` inside that event will be `Discharging`, but the dedicated event gives you a cleaner hook than polling the percentage yourself.
:::

## Danger Avoidance

:::danger
Do not assume `batteryStatus` will only ever be one of the four documented values. Windows may introduce new power states in future updates. Always include a `default` branch in switch statements, and avoid using the value as an array index without bounds checking.
:::

:::danger
The `BatteryStatus` const enum is inlined at TypeScript compile time. If you import it in a library that is consumed by downstream JavaScript projects, the enum members will not exist at runtime. Always compare against the raw numeric values (`0`, `1`, `2`, `3`) in plain JavaScript code, or use a regular (non-const) enum if you need runtime access.
:::
