---
watermark: true
title: getPowerInfo
icon: fa6-solid:code
---

# getPowerInfo

:::info Introduction
`getPowerInfo` is a synchronous query function that returns a snapshot of the current system power status. It reads battery level, charging state, power supply status, and energy saver mode in a single call. On desktop machines without a battery, it reports 100% charge with `hasBattery: false`.
:::

## Signature

```typescript
function getPowerInfo(): PowerInfo | null
```

The function takes no parameters and returns a [PowerInfo](power-info.md) object, or `null` if the underlying system call fails.

## Usage

Call `getPowerInfo` whenever you need a one-time reading of the current power state. Typical use cases include:

- Displaying the current battery percentage in a UI widget
- Checking whether the device is on AC power before starting a heavy task
- Reading the energy saver status to adjust background activity

:::tip
If you need continuous monitoring instead of one-time queries, use the [PowerMonitor](power-monitor.md) class. It emits events like `ac-connected`, `battery-low`, and `power-changed` so you don't have to poll.
:::

:::note
`getPowerInfo` performs a synchronous system call each time it is invoked. Avoid calling it in a tight loop. For periodic updates, prefer [PowerMonitor](power-monitor.md) or throttle your calls with a timer.
:::

## Return Value

Returns a [PowerInfo](power-info.md) object with the following shape:

```typescript
{
  remainingChargePercent: 78,         // Battery percentage (0-100)
  batteryStatus: 3,                   // BatteryStatus.Charging
  powerSupplyStatus: 1,               // PowerSupplyStatus.Adequate
  energySaverStatus: 1,               // EnergySaverStatus.Off
  hasBattery: true,                   // Whether a battery is present
  isCharging: true,                   // Whether currently charging
  isOnAcPower: true,                  // Whether AC power is connected
}
```

:::warning
Returns `null` when the power status cannot be read from the system. This may happen if the native DLL fails to load or the underlying WinRT call fails. Always check for `null` before accessing properties.
:::

:::note
On desktop machines without a battery, `remainingChargePercent` is reported as `100`, `hasBattery` is `false`, and `batteryStatus` is `BatteryStatus.NotPresent` (0).
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getPowerInfo } from '@eisland/windows-power-helper';

// Query the current power status in a single synchronous call
const info = getPowerInfo();

if (info) {
  // Build a human-readable status string from the snapshot
  const status = info.isCharging ? 'Charging' : 'On battery';
  // remainingChargePercent is a number from 0 to 100
  console.log(`${status}: ${info.remainingChargePercent}%`);

  // Check if energy saver is currently active (status 2 = On)
  if (info.energySaverStatus === 2) {
    console.log('Energy saver is enabled — reducing background work');
  }
} else {
  // null means the system call failed
  console.log('Unable to read power info');
}
```

@tab JavaScript

```js
const { getPowerInfo } = require('@eisland/windows-power-helper');

// Query the current power status in a single synchronous call
const info = getPowerInfo();

if (info) {
  // Build a human-readable status string from the snapshot
  const status = info.isCharging ? 'Charging' : 'On battery';
  // remainingChargePercent is a number from 0 to 100
  console.log(`${status}: ${info.remainingChargePercent}%`);

  // Check if energy saver is currently active (status 2 = On)
  if (info.energySaverStatus === 2) {
    console.log('Energy saver is enabled — reducing background work');
  }
} else {
  // null means the system call failed
  console.log('Unable to read power info');
}
```

:::

## Notes

:::note
The enum values (`BatteryStatus`, `PowerSupplyStatus`, `EnergySaverStatus`) are `const enum` in TypeScript, meaning they are inlined at compile time. In plain JavaScript, compare against the raw numeric values (0, 1, 2, 3). See [BatteryStatus](battery-status.md), [PowerSupplyStatus](power-supply-status.md), and [EnergySaverStatus](energy-saver-status.md) for the full mapping.
:::

:::tip
Import the enum types alongside `getPowerInfo` in TypeScript for readable comparisons:

```ts
import { getPowerInfo, BatteryStatus } from '@eisland/windows-power-helper';

const info = getPowerInfo();
if (info && info.batteryStatus === BatteryStatus.Discharging) {
  console.log('Running on battery power');
}
```
:::

:::note
`isOnAcPower` reflects whether the AC adapter is connected, which is independent of whether the battery is charging. A device can be on AC power but not charging if the battery is already full (`batteryStatus === BatteryStatus.Idle`).
:::

## Danger Avoidance

:::danger
Do not call `getPowerInfo` in a tight loop or on every animation frame. Each call performs a synchronous native system query. Repeated rapid calls can degrade performance and waste system resources. Use [PowerMonitor](power-monitor.md) for continuous tracking, or throttle calls to once every few seconds at most.
:::

:::danger
The `PowerInfo` object returned by `getPowerInfo` is a snapshot — it does not update automatically. If you store a reference and read it later, the values may be stale. Call `getPowerInfo` again or switch to [PowerMonitor](power-monitor.md) if you need live data.
:::
