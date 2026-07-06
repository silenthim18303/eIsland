---
watermark: true
title: EnergySaverStatus
icon: fa6-solid:list
---

# EnergySaverStatus

:::info Introduction
`EnergySaverStatus` is a const enum that represents the current state of Windows Energy Saver (battery saver) mode. It is returned as part of [PowerInfo](power-info.md) when you query power state via [`getPowerInfo()`](./) or listen to [PowerMonitor](power-monitor.md) events. Use it to determine whether the system is actively conserving battery.
:::

## Interface Introduction

`EnergySaverStatus` is a numeric enum with three possible values. You will encounter it as the `energySaverStatus` property of [PowerInfo](power-info.md), which is returned by [`getPowerInfo()`](./) and every [PowerMonitor](power-monitor.md) event callback.

:::note
Energy Saver mode is managed entirely by Windows. Applications cannot programmatically toggle it on or off — you can only observe its current state and adapt behavior accordingly.
:::

## Usage

The typical workflow is to read `energySaverStatus` from a [PowerInfo](power-info.md) snapshot and branch your application logic accordingly. For example, you might reduce polling frequency, defer non-critical network requests, or dim UI animations when energy saver is active.

:::tip Best Practice
Combine `energySaverStatus` with other [PowerInfo](power-info.md) fields like `isOnAcPower` and `remainingChargePercent` for a complete picture. Energy saver being `On` alone does not necessarily mean the battery is critically low — Windows may activate it at a user-configured threshold.
:::

## Values

| Value | Name | Description |
|-------|------|-------------|
| `0` | `Disabled` | Energy saver has been disabled by a system policy (e.g. Group Policy or MDM). The feature is completely unavailable. |
| `1` | `Off` | Energy saver is available but not currently active. The system is operating at normal power consumption. |
| `2` | `On` | Energy saver is active. Windows is limiting background activity, push notifications, and other power-consuming features. |

:::note Behavioral Detail
The `Disabled` state is distinct from `Off`. When `Disabled`, the user cannot enable energy saver through Windows Settings — it has been overridden by administrative policy. Your application should not prompt users to change this setting when the status is `Disabled`.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getPowerInfo, EnergySaverStatus } from '@eisland/windows-power-helper';

// Query the current power state
const info = getPowerInfo();

if (info) {
  // Check the energy saver status enum value
  switch (info.energySaverStatus) {
    case EnergySaverStatus.On:
      // Energy saver is active — reduce background work
      console.log('Energy saver is on — reducing background activity');
      break;
    case EnergySaverStatus.Off:
      // Energy saver is available but not active
      console.log('Energy saver is off — operating normally');
      break;
    case EnergySaverStatus.Disabled:
      // Energy saver is disabled by policy
      console.log('Energy saver is disabled by system policy');
      break;
  }
}
```

@tab JavaScript

```js
const { getPowerInfo, EnergySaverStatus } = require('@eisland/windows-power-helper');

// Query the current power state
const info = getPowerInfo();

if (info) {
  // Check the energy saver status enum value
  switch (info.energySaverStatus) {
    case EnergySaverStatus.On:
      // Energy saver is active — reduce background work
      console.log('Energy saver is on — reducing background activity');
      break;
    case EnergySaverStatus.Off:
      // Energy saver is available but not active
      console.log('Energy saver is off — operating normally');
      break;
    case EnergySaverStatus.Disabled:
      // Energy saver is disabled by policy
      console.log('Energy saver is disabled by system policy');
      break;
  }
}
```

:::

## Notes

:::note Desktop Machines
On desktop machines without a battery, `energySaverStatus` is typically `Off` or `Disabled`. The `On` state is uncommon on AC-powered systems unless the user has manually configured it.
:::

:::note Value Type
`EnergySaverStatus` is declared as a `const enum` in TypeScript. At compile time, references like `EnergySaverStatus.On` are inlined to their numeric values (`2`). If you need to compare by raw number, use `2` for `On`, `1` for `Off`, and `0` for `Disabled`.
:::

:::tip Real-Time Monitoring
If you need to react to energy saver changes in real time, use [PowerMonitor](power-monitor.md) and listen for the `power-changed` event. This avoids polling with `getPowerInfo()` and ensures you respond immediately when Windows toggles the mode.
:::

## Danger Avoidance

:::danger Do Not Compare Against String Values
`EnergySaverStatus` is a numeric enum. Always compare against the enum constants (e.g. `EnergySaverStatus.On`) or their literal numeric values (`2`). Comparing against strings like `"On"` will always be `false` and silently break your logic.
:::

:::danger Do Not Assume Energy Saver Can Be Toggled
`EnergySaverStatus` is read-only. There is no API in `@eisland/windows-power-helper` to enable or disable energy saver. Attempting to work around this by modifying system settings programmatically may violate Group Policy restrictions and cause unpredictable system behavior.
:::
