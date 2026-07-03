---
watermark: true
title: BluetoothMonitor
icon: fa6-solid:cubes
---

# BluetoothMonitor

:::info
Real-time Bluetooth device change monitor. Uses .NET NativeAOT DLL via koffi FFI to subscribe to WinRT Bluetooth device watcher events.
:::

## Constructor

```typescript
constructor()
```

## Methods

| Method | Return | Description |
|--------|--------|-------------|
| `start()` | `void` | Start monitoring (idempotent) |
| `stop()` | `void` | Stop monitoring (idempotent) |
| `isRunning()` | `boolean` | Whether the monitor is currently active |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `device-added` | `device: BluetoothDeviceInfo` | New device discovered |
| `device-removed` | `deviceId: string` | Device removed from range |
| `device-connected` | `device: BluetoothDeviceInfo` | Device connected |
| `device-disconnected` | `deviceId: string` | Device disconnected |
| `device-updated` | `device: BluetoothDeviceInfo` | Device info updated |
| `error` | `err: Error` | Monitor error |

:::tip
The monitor uses a Bluetooth DeviceWatcher internally. Call `start()` once and listen for events — do not poll with `getAllDevices()` in a loop.
:::

:::note
The `isRunning()` method returns the current monitoring state. Calling `start()` on an already-running monitor is a no-op.
:::

## Example

```typescript
import { BluetoothMonitor } from '@eisland/windows-bluetooth-helper';

const monitor = new BluetoothMonitor();

monitor.on('device-added', (device) => {
  console.log(`Discovered: ${device.name ?? 'Unknown'} (${device.deviceType ?? 'N/A'})`);
});

monitor.on('device-connected', (device) => {
  console.log(`Connected: ${device.name}`);
});

monitor.on('device-disconnected', (deviceId) => {
  console.log(`Disconnected: ${deviceId}`);
});

monitor.on('error', (err) => {
  console.error('Bluetooth monitor error:', err);
});

monitor.start();
// ... later
monitor.stop();
```
