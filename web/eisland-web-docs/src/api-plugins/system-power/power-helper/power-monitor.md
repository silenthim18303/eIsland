---
watermark: true
title: PowerMonitor
icon: fa6-solid:cubes
---

# PowerMonitor

:::info Introduction
`PowerMonitor` is a real-time power status monitor for Windows. It uses a .NET NativeAOT DLL via koffi FFI to subscribe to WinRT `PowerManager` events, emitting structured events when AC power connects/disconnects, battery level changes, or charging state transitions. It also provides a synchronous snapshot method for one-time queries.
:::

## Constructor

```typescript
new PowerMonitor(): PowerMonitor
```

The constructor takes no arguments. It prepares internal FFI bindings but does **not** start listening for events — you must call [`start()`](#methods) to begin monitoring.

## Usage

The typical lifecycle is: **construct → start → listen → stop**.

`start()` returns the current [PowerInfo](power-info.md) snapshot immediately, which is useful for initializing UI before any events fire. After that, the monitor emits events asynchronously as the system power state changes.

:::tip
Call `start()` and use the returned snapshot to populate your UI on first render. This avoids a blank or loading state while waiting for the first event.
:::

:::tip
If you only need a one-time query and do not require ongoing monitoring, use the standalone [`getPowerInfo()`](./get-power-info.md) function instead of creating a `PowerMonitor` instance.
:::

:::note
`start()` and `stop()` are both idempotent — calling `start()` when already started, or `stop()` when already stopped, is safe and has no side effects.
:::

## Methods

| Method | Return | Description |
|--------|--------|-------------|
| `start()` | [PowerInfo](power-info.md) | Start monitoring (idempotent). Returns the initial power state snapshot. |
| `stop()` | `void` | Stop monitoring and release the underlying FFI listener (idempotent). |
| `getPowerInfo()` | [PowerInfo](power-info.md) `\| null` | Get a synchronous snapshot of the current power state. Returns `null` if the system call fails. |

:::note
`getPowerInfo()` on the instance behaves the same as the standalone `getPowerInfo()` function — it queries the current state on demand without relying on the event stream.
:::

## Events

All power-related events pass a [PowerInfo](power-info.md) object as the payload. The `error` event passes an `Error` object instead.

| Event | Payload | Description |
|-------|---------|-------------|
| `ac-connected` | `info: PowerInfo` | AC power adapter was connected. |
| `ac-disconnected` | `info: PowerInfo` | AC power adapter was disconnected (now on battery). |
| `battery-low` | `info: PowerInfo` | Battery level dropped to 15% or below. |
| `charging` | `info: PowerInfo` | Battery started charging. |
| `discharging` | `info: PowerInfo` | Battery stopped charging (unplugged or fully charged). |
| `power-changed` | `info: PowerInfo` | Any power state change (generic catch-all event). |
| `error` | `err: Error` | An error occurred in the monitor. |

:::warning
The `battery-low` event fires when the battery reaches 15% or below. The exact timing depends on the system's power event reporting frequency — it is not polled at a fixed interval.
:::

:::warning
The `power-changed` event fires on **every** power state change. It will also fire alongside more specific events like `ac-connected` or `charging`. If you listen to both `power-changed` and a specific event, your handler may run twice for the same state change.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { PowerMonitor } from '@eisland/windows-power-helper';

// Create a new monitor instance (does not start listening yet)
const monitor = new PowerMonitor();

// Start monitoring — returns the initial power state snapshot
const initial = monitor.start();
console.log(`Battery: ${initial.remainingChargePercent}%`);

// Listen for AC power connection
monitor.on('ac-connected', (info) => {
  console.log('AC adapter connected');
});

// Listen for AC power disconnection (switching to battery)
monitor.on('ac-disconnected', (info) => {
  console.log('Running on battery');
});

// Listen for low battery warning (<=15%)
monitor.on('battery-low', (info) => {
  console.warn(`Battery low: ${info.remainingChargePercent}%`);
});

// Listen for charging state changes
monitor.on('charging', (info) => {
  console.log(`Charging: ${info.remainingChargePercent}%`);
});

// Listen for all power state changes (generic)
monitor.on('power-changed', (info) => {
  console.log(`Power changed: ${info.remainingChargePercent}%`);
});

// Listen for errors
monitor.on('error', (err) => {
  console.error('Power monitor error:', err);
});

// Stop monitoring when done — releases the FFI listener
monitor.stop();
```

@tab JavaScript

```js
const { PowerMonitor } = require('@eisland/windows-power-helper');

// Create a new monitor instance (does not start listening yet)
const monitor = new PowerMonitor();

// Start monitoring — returns the initial power state snapshot
const initial = monitor.start();
console.log(`Battery: ${initial.remainingChargePercent}%`);

// Listen for AC power connection
monitor.on('ac-connected', (info) => {
  console.log('AC adapter connected');
});

// Listen for AC power disconnection (switching to battery)
monitor.on('ac-disconnected', (info) => {
  console.log('Running on battery');
});

// Listen for low battery warning (<=15%)
monitor.on('battery-low', (info) => {
  console.warn(`Battery low: ${info.remainingChargePercent}%`);
});

// Listen for charging state changes
monitor.on('charging', (info) => {
  console.log(`Charging: ${info.remainingChargePercent}%`);
});

// Listen for all power state changes (generic)
monitor.on('power-changed', (info) => {
  console.log(`Power changed: ${info.remainingChargePercent}%`);
});

// Listen for errors
monitor.on('error', (err) => {
  console.error('Power monitor error:', err);
});

// Stop monitoring when done — releases the FFI listener
monitor.stop();
```

:::

## Notes

:::note
`PowerMonitor` extends Node.js `EventEmitter`. You can use all standard EventEmitter methods such as `once()`, `removeAllListeners()`, and `listenerCount()`.
:::

:::note
The `battery-low` threshold is fixed at 15%. There is no API to customize this value. If you need a different threshold, listen to `power-changed` and implement your own check against `remainingChargePercent`.
:::

:::tip
For desktop machines without a battery, `hasBattery` will be `false` and `remainingChargePercent` will be `100`. Battery-specific events (`battery-low`, `charging`, `discharging`) will not fire on such machines.
:::

## Danger Avoidance

:::danger
Always call `stop()` when you are done with the monitor. Failing to stop the monitor leaks the underlying FFI event subscription and the associated native resources. In an Electron app, this can prevent the process from exiting cleanly.
:::

:::danger
Do not create multiple `PowerMonitor` instances simultaneously unless you have a specific reason. Each instance opens its own FFI listener to the system `PowerManager`. Prefer a single shared instance per process to minimize native resource usage.
:::
