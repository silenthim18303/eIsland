---
watermark: true
title: WifiMonitor
icon: fa6-solid:cubes
---

# WifiMonitor

:::info
`WifiMonitor` is a real-time WiFi connection status monitor for Windows. It uses a .NET NativeAOT DLL via koffi FFI to subscribe to WinRT `NetworkInformation.NetworkStatusChanged` events, providing granular callbacks for connection, disconnection, signal strength changes, and SSID changes. It extends Node.js `EventEmitter`, so the standard `on` / `off` / `once` patterns apply.
:::

## Constructor

```typescript
new WifiMonitor(): WifiMonitor
```

The constructor takes no arguments. After instantiation, call [`start()`](#methods) to begin listening for WiFi status changes.

## Usage

The typical lifecycle is: **create -> start -> listen -> stop**.

1. Instantiate `WifiMonitor`.
2. Register event listeners for the events you care about.
3. Call `start()` to begin monitoring. It returns the current [WifiInfo](wifi-info.md) snapshot immediately, which is useful for initializing UI before any events fire.
4. Call `stop()` when monitoring is no longer needed.

:::tip
Call `start()` **after** registering your event listeners. This way you won't miss any events that fire between the `start()` call and your listener registration. The returned initial snapshot from `start()` covers the gap.
:::

:::tip
Both `start()` and `stop()` are **idempotent** -- calling `start()` when already started, or `stop()` when already stopped, is a no-op. This makes cleanup code simpler since you don't need extra state tracking.
:::

## Methods

| Method | Return | Description |
|--------|--------|-------------|
| `start()` | [WifiInfo](wifi-info.md) | Start monitoring. Idempotent. Returns the current WiFi state snapshot. |
| `stop()` | `void` | Stop monitoring and release the underlying FFI subscription. Idempotent. |
| `getWifiInfo()` | [WifiInfo](wifi-info.md) `\| null` | Get a point-in-time snapshot of the current WiFi status. Returns `null` if no WiFi adapter is present. |

:::note
`getWifiInfo()` queries the OS on every call. If you only need the state at monitoring start, use the return value of `start()` instead of calling `getWifiInfo()` separately.
:::

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `wifi-connected` | `info: WifiInfo` | WiFi connection established (transition from disconnected to connected). |
| `wifi-disconnected` | `info: WifiInfo` | WiFi connection lost (transition from connected to disconnected). |
| `signal-changed` | `info: WifiInfo` | Signal strength (signalBars) changed. |
| `ssid-changed` | `info: WifiInfo` | Connected network SSID changed (e.g., roaming between access points). |
| `wifi-changed` | `info: WifiInfo` | Any WiFi state change. Fires alongside more specific events. |
| `error` | `err: Error` | An error occurred in the monitoring subsystem. |

:::note
The `wifi-changed` event fires on **every** state change. If you register both `wifi-changed` and `wifi-connected`, both will fire when WiFi connects. Use specific events for targeted handling, and `wifi-changed` as a catch-all for logging or debugging.
:::

## Return Value

`start()` returns a [WifiInfo](wifi-info.md) object representing the current WiFi state at the moment monitoring begins. `getWifiInfo()` returns `WifiInfo | null` -- it returns `null` when no WiFi adapter is available on the system.

:::warning
`getWifiInfo()` can return `null` if the system has no WiFi adapter (e.g., a desktop with only Ethernet). Always check for `null` before accessing properties. The `start()` method also returns `WifiInfo` but will reflect a disconnected state (`isConnected: false`, `ssid: null`) in this scenario rather than returning `null`.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { WifiMonitor } from '@eisland/windows-wifi-helper';

// Create a new monitor instance
const monitor = new WifiMonitor();

// Register event listeners before starting
monitor.on('wifi-connected', (info) => {
  // Fired when WiFi transitions to connected
  console.log(`Connected to ${info.ssid}`);
});

monitor.on('wifi-disconnected', () => {
  // Fired when WiFi transitions to disconnected
  console.log('WiFi disconnected');
});

monitor.on('signal-changed', (info) => {
  // Fired when signal strength changes; signalBars ranges 0-5
  console.log(`Signal: ${info.signalBars}/5 bars`);
});

monitor.on('ssid-changed', (info) => {
  // Fired when the connected network SSID changes
  console.log(`Switched to network: ${info.ssid}`);
});

monitor.on('error', (err) => {
  // Handle monitoring errors
  console.error('WiFi monitor error:', err);
});

// Start monitoring; returns the current WiFi state immediately
const initial = monitor.start();
console.log(`Initial state: ${initial.isConnected ? initial.ssid : 'Disconnected'}`);

// Later, stop monitoring to release resources
monitor.stop();
```

@tab JavaScript

```js
const { WifiMonitor } = require('@eisland/windows-wifi-helper');

// Create a new monitor instance
const monitor = new WifiMonitor();

// Register event listeners before starting
monitor.on('wifi-connected', (info) => {
  // Fired when WiFi transitions to connected
  console.log(`Connected to ${info.ssid}`);
});

monitor.on('wifi-disconnected', () => {
  // Fired when WiFi transitions to disconnected
  console.log('WiFi disconnected');
});

monitor.on('signal-changed', (info) => {
  // Fired when signal strength changes; signalBars ranges 0-5
  console.log(`Signal: ${info.signalBars}/5 bars`);
});

monitor.on('ssid-changed', (info) => {
  // Fired when the connected network SSID changes
  console.log(`Switched to network: ${info.ssid}`);
});

monitor.on('error', (err) => {
  // Handle monitoring errors
  console.error('WiFi monitor error:', err);
});

// Start monitoring; returns the current WiFi state immediately
const initial = monitor.start();
console.log(`Initial state: ${initial.isConnected ? initial.ssid : 'Disconnected'}`);

// Later, stop monitoring to release resources
monitor.stop();
```

:::

## Notes

:::note
The monitor internally subscribes to WinRT events through a .NET NativeAOT DLL via koffi FFI. This means it has a native footprint beyond pure JavaScript -- each active `WifiMonitor` instance holds an FFI subscription to the Windows networking subsystem.
:::

:::note
`signalBars` uses a 0-5 scale where 0 means no signal and 5 means maximum signal. A value of `-1` indicates that signal strength information is unavailable (e.g., when disconnected or when the adapter does not report signal strength).
:::

:::tip
For scenarios where you only need a one-time WiFi status check (not continuous monitoring), prefer the standalone `getWifiInfo()` function exported from `@eisland/windows-wifi-helper` instead of creating a `WifiMonitor` instance. This avoids setting up an FFI subscription unnecessarily.
:::

## Danger Avoidance

:::danger
Always call `monitor.stop()` when you are done monitoring. Each `WifiMonitor` instance holds a native FFI subscription to the Windows networking subsystem. Failing to call `stop()` will **leak the native subscription**, preventing the underlying resources from being garbage collected. In long-running applications (e.g., Electron main process), this can accumulate and degrade system performance over time.
:::

:::danger
Do not create multiple `WifiMonitor` instances for the same purpose. Each instance registers its own FFI callback with the OS. If you need to observe WiFi state from multiple parts of your application, share a single `WifiMonitor` instance or use a single `start()` return value with your own event bus. Excessive instances waste native resources and multiply event firings.
:::
