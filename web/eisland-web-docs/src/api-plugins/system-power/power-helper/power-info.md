---
watermark: true
title: PowerInfo
icon: fa6-solid:table
---

# PowerInfo

:::info
`PowerInfo` is a snapshot interface that describes the complete power state of the system at a given moment. It is the return type of [getPowerInfo()](./get-power-info.md) and the payload delivered by every [PowerMonitor](./power-monitor.md) event. Use it to read battery level, charging state, AC power connection, and energy saver mode in a single object.
:::

## Interface Introduction

`PowerInfo` is a read-only data structure — you never construct it yourself. You obtain it from two sources:

1. **One-shot query** — call `getPowerInfo()` to get a snapshot of the current power state. Returns `null` if the underlying system call fails.
2. **Real-time monitoring** — every event emitted by a [PowerMonitor](./power-monitor.md) instance passes the latest `PowerInfo` as the callback argument.

:::tip
If you only need a single check (e.g. show battery level once), use `getPowerInfo()`. If you need to react to changes (e.g. show a notification when AC is unplugged), use [PowerMonitor](./power-monitor.md) instead.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `remainingChargePercent` | `number` | Battery charge percentage, range `0`–`100`. On desktops without a battery this defaults to `100`. |
| `batteryStatus` | [BatteryStatus](battery-status.md) | Current battery state: `NotPresent` (0), `Discharging` (1), `Idle` (2), or `Charging` (3). |
| `powerSupplyStatus` | [PowerSupplyStatus](power-supply-status.md) | Power supply state: `NotPresent` (0), `Adequate` (1), `Inadequate` (2), or `Unknown` (3). |
| `energySaverStatus` | [EnergySaverStatus](energy-saver-status.md) | Energy saver mode: `Disabled` (0), `Off` (1), or `On` (2). |
| `hasBattery` | `boolean` | `true` if the system has a battery (laptop). `false` on most desktops. |
| `isCharging` | `boolean` | `true` if the battery is currently charging. |
| `isOnAcPower` | `boolean` | `true` if the system is connected to AC (wall) power. |

:::note
On desktop systems without a battery, `hasBattery` is `false`, `remainingChargePercent` is `100`, `batteryStatus` is `NotPresent`, and `isCharging` is `false`. This is normal behavior, not an error.
:::

:::note
`energySaverStatus` reflects the Windows Energy Saver setting. When the value is `On`, the OS is actively throttling background activity. This can affect performance of background tasks.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getPowerInfo, PowerInfo, BatteryStatus } from '@eisland/windows-power-helper';

// Query the current power state as a one-shot snapshot
const info: PowerInfo | null = getPowerInfo();

if (info) {
  // Print battery percentage (0-100)
  console.log(`Battery: ${info.remainingChargePercent}%`);

  // Check if the system is charging
  console.log(`Charging: ${info.isCharging}`);

  // Check if AC power is connected
  console.log(`AC Power: ${info.isOnAcPower}`);

  // Check if the system has a battery at all
  console.log(`Has Battery: ${info.hasBattery}`);

  // Use enum to check battery status with type safety
  if (info.batteryStatus === BatteryStatus.Discharging) {
    console.log('Battery is discharging — consider plugging in.');
  }
}
```

@tab JavaScript

```js
const { getPowerInfo, BatteryStatus } = require('@eisland/windows-power-helper');

// Query the current power state as a one-shot snapshot
const info = getPowerInfo();

if (info) {
  // Print battery percentage (0-100)
  console.log(`Battery: ${info.remainingChargePercent}%`);

  // Check if the system is charging
  console.log(`Charging: ${info.isCharging}`);

  // Check if AC power is connected
  console.log(`AC Power: ${info.isOnAcPower}`);

  // Check if the system has a battery at all
  console.log(`Has Battery: ${info.hasBattery}`);

  // Use enum value to check battery status
  if (info.batteryStatus === BatteryStatus.Discharging) {
    console.log('Battery is discharging — consider plugging in.');
  }
}
```

:::

## Notes

:::note
`getPowerInfo()` is a synchronous call. It reads the system power state on the calling thread and returns immediately. There is no need to await it.
:::

:::tip
When working with the `BatteryStatus` and `PowerSupplyStatus` enums, prefer comparing against the named enum values (e.g. `BatteryStatus.Charging`) rather than raw numbers. This makes your code self-documenting and resilient to future enum reordering.
:::

:::note
`PowerInfo` properties are independent. For example, `isOnAcPower` can be `true` while `isCharging` is `false` — this happens when the battery is already full and the charger is still connected.
:::

## Danger Avoidance

:::danger
`getPowerInfo()` can return `null` if the underlying system call fails. Always check for `null` before accessing properties. Accessing `info.remainingChargePercent` when `info` is `null` will throw a runtime error and crash your application.
:::

:::danger
Do not assume `remainingChargePercent` is a valid percentage on all systems. On virtual machines or systems with non-standard power drivers, the value may be inaccurate. Always use `hasBattery` to determine whether the percentage data is meaningful before displaying it to the user.
:::
