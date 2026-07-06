---
watermark: true
title: BluetoothMonitor
icon: fa6-solid:cubes
---

# BluetoothMonitor

:::info
Real-time Bluetooth device change monitor. Uses a .NET NativeAOT DLL via koffi FFI to subscribe to WinRT `DeviceWatcher` events, notifying your application whenever a Bluetooth device is discovered, removed, connected, disconnected, or updated. This is the primary way to react to Bluetooth changes as they happen, rather than polling with query functions.
:::

## Constructor

```typescript
new BluetoothMonitor(): BluetoothMonitor
```

Creates a new `BluetoothMonitor` instance. The monitor does not start listening until you call `start()`.

## Usage

A `BluetoothMonitor` follows a simple lifecycle: **create**, **subscribe**, **start**, and later **stop**.

1. Instantiate the monitor.
2. Register event listeners for the device changes you care about.
3. Call `start()` to begin receiving events from the WinRT `DeviceWatcher`.
4. When done, call `stop()` to release the watcher and clean up resources.

:::tip
Call `start()` once and listen for events. Avoid polling `getAllDevices()` in a tight loop -- the event-driven approach is far more efficient and catches transient state changes that polling may miss.
:::

:::tip
Use the `getDevices()` method to retrieve a snapshot of all currently known devices at any point. This is useful for building an initial UI list before events start arriving.
:::

## Methods

| Method | Return | Description |
|--------|--------|-------------|
| `start()` | `void` | Start the device watcher. Idempotent -- calling it on an already-running monitor has no effect. |
| `stop()` | `void` | Stop the device watcher. Idempotent -- calling it on an already-stopped monitor has no effect. |
| `getDevices()` | `BluetoothDeviceInfo[]` | Returns a snapshot array of all currently known devices. |

:::note
`start()` and `stop()` are both idempotent. You can safely call `start()` multiple times without creating duplicate watchers, and `stop()` on an already-stopped monitor without error.
:::

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `device-added` | `device: BluetoothDeviceInfo` | A new device was discovered by the watcher. |
| `device-removed` | `deviceId: string` | A device has been removed from the visible range. The payload is the device ID string, not a full device object. |
| `device-connected` | `device: BluetoothDeviceInfo` | A device transitioned to the connected state. |
| `device-disconnected` | `deviceId: string` | A device transitioned to the disconnected state. The payload is the device ID string. |
| `device-updated` | `device: BluetoothDeviceInfo` | One or more properties of a known device changed (e.g. name, battery level, signal strength). |
| `error` | `err: Error` | An internal error occurred in the watcher or FFI layer. |

:::note
The `device-removed` and `device-disconnected` events emit a raw `deviceId` string, not a full [BluetoothDeviceInfo](bluetooth-device-info.md) object. If you need the last known device data, look it up from a locally maintained map or call `getDevice()` from the query functions before the device is fully gone.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { BluetoothMonitor, BluetoothDeviceInfo } from '@eisland/windows-bluetooth-helper';

// Create a new monitor instance
const monitor = new BluetoothMonitor();

// React to new device discovery
monitor.on('device-added', (device: BluetoothDeviceInfo) => {
  console.log(`Discovered: ${device.name ?? 'Unknown'} (${device.deviceType ?? 'N/A'})`);
});

// React to a device connecting
monitor.on('device-connected', (device: BluetoothDeviceInfo) => {
  console.log(`Connected: ${device.name}`);
});

// React to a device disconnecting — payload is the device ID string
monitor.on('device-disconnected', (deviceId: string) => {
  console.log(`Disconnected: ${deviceId}`);
});

// React to device property updates (e.g. battery level, name change)
monitor.on('device-updated', (device: BluetoothDeviceInfo) => {
  console.log(`Updated: ${device.name}, battery: ${device.batteryLevel}%`);
});

// Handle watcher errors
monitor.on('error', (err: Error) => {
  console.error('Bluetooth monitor error:', err);
});

// Start listening for events
monitor.start();

// Take a snapshot of all known devices at any time
const snapshot: BluetoothDeviceInfo[] = monitor.getDevices();
console.log(`Known devices: ${snapshot.length}`);

// Later, stop the monitor to release resources
monitor.stop();
```

@tab JavaScript

```js
const { BluetoothMonitor } = require('@eisland/windows-bluetooth-helper');

// Create a new monitor instance
const monitor = new BluetoothMonitor();

// React to new device discovery
monitor.on('device-added', (device) => {
  console.log(`Discovered: ${device.name ?? 'Unknown'} (${device.deviceType ?? 'N/A'})`);
});

// React to a device connecting
monitor.on('device-connected', (device) => {
  console.log(`Connected: ${device.name}`);
});

// React to a device disconnecting — payload is the device ID string
monitor.on('device-disconnected', (deviceId) => {
  console.log(`Disconnected: ${deviceId}`);
});

// React to device property updates (e.g. battery level, name change)
monitor.on('device-updated', (device) => {
  console.log(`Updated: ${device.name}, battery: ${device.batteryLevel}%`);
});

// Handle watcher errors
monitor.on('error', (err) => {
  console.error('Bluetooth monitor error:', err);
});

// Start listening for events
monitor.start();

// Take a snapshot of all known devices at any time
const snapshot = monitor.getDevices();
console.log(`Known devices: ${snapshot.length}`);

// Later, stop the monitor to release resources
monitor.stop();
```

:::

## Notes

:::note
The monitor internally uses a WinRT `DeviceWatcher` via a .NET NativeAOT DLL and koffi FFI. This means it requires the Windows Bluetooth stack to be available and functional. On systems with Bluetooth disabled at the hardware or driver level, the watcher may fail to start or emit no events.
:::

:::note
The `getDevices()` method returns a snapshot of devices currently known to the watcher. This list is populated incrementally as the watcher discovers devices after `start()` is called. Immediately after `start()`, the snapshot may be empty until discovery events arrive.
:::

:::tip
If you only need a one-time list of paired or connected devices without real-time updates, use the query functions (`getPairedDevices()`, `getConnectedDevices()`, `getAllDevices()`) instead of creating a `BluetoothMonitor`. The monitor is designed for continuous observation.
:::

## Danger Avoidance

:::danger
Always call `stop()` when you are done with the monitor. Failing to stop the monitor leaks the underlying WinRT `DeviceWatcher` and its associated native resources. In a long-running Electron application, repeatedly creating monitors without stopping them will accumulate leaked watchers and degrade system performance.
:::

:::danger
Do not call `start()` without registering at least an `error` event listener. If the watcher encounters an internal error (e.g. Bluetooth adapter removed, driver crash), the error will be emitted with no listener attached, which in Node.js triggers an unhandled `error` event and crashes the process.
:::
