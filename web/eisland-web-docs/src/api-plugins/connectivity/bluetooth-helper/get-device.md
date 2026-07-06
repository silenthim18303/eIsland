---
watermark: true
title: getDevice
icon: fa6-solid:code
---

# getDevice

:::info
`getDevice` retrieves a real-time snapshot of a single Bluetooth device by its Windows DeviceInformation ID. It returns a [BluetoothDeviceInfo](bluetooth-device-info.md) object with the device's current connection state, signal strength, battery level, and other properties — or `null` if the device is no longer visible to the system.
:::

## Signature

```typescript
function getDevice(deviceId: string): BluetoothDeviceInfo | null
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `deviceId` | `string` | The Windows DeviceInformation ID of the target device (e.g. `'\\?\SWD#...'`). You typically obtain this from [getPairedDevices](get-paired-devices.md), [getConnectedDevices](get-connected-devices.md), [getAllDevices](get-all-devices.md), or the [BluetoothMonitor](bluetooth-monitor.md) events. |

:::tip
Store the `deviceId` from a previous query or event and reuse it with `getDevice` to poll a specific device's status without re-enumerating all devices.
:::

## Usage

`getDevice` is designed for on-demand queries about a single known device. Typical workflows include:

- **Status polling** — periodically check whether a specific device is still connected.
- **Refreshing stale data** — after receiving a `device-updated` event from [BluetoothMonitor](bluetooth-monitor.md), call `getDevice` to fetch the latest full snapshot.
- **Pre-action check** — verify a device's state before performing an operation (e.g. sending audio to a speaker).

:::note
Each call to `getDevice` queries the Windows device subsystem for a fresh snapshot. Avoid calling it in tight loops; use [BluetoothMonitor](bluetooth-monitor.md) for continuous monitoring instead.
:::

## Return Value

Returns a [BluetoothDeviceInfo](bluetooth-device-info.md) object, or `null` if the device with the given ID is not currently visible.

```typescript
// Example return value for an active AirPods Pro
{
  deviceId: '\\?\SWD#...',
  name: 'AirPods Pro',
  bluetoothAddress: 'A4:B1:C2:D3:E4:F5',
  isConnected: true,
  isPaired: true,
  signalStrength: -45,
  deviceClass: 2360344,
  appearance: 96,
  serviceUuids: ['0000110b-0000-1000-8000-00805f9b34fb'],
  deviceType: 'Headphones',
  batteryLevel: 85,
}
```

:::warning
`getDevice` returns `null` when the device ID is invalid, the device has been removed, or the Bluetooth adapter is disabled. Always null-check the result before accessing properties.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getDevice, getPairedDevices } from '@eisland/windows-bluetooth-helper';

// Get the list of all paired devices
const paired = getPairedDevices();

if (paired.length > 0) {
  // Store the ID of the first paired device
  const targetId: string = paired[0].deviceId;

  // Fetch a fresh snapshot for that specific device
  const snapshot = getDevice(targetId);

  // Null-check — the device may have disconnected since the list was fetched
  if (snapshot) {
    // Print the device name and its current connection status
    console.log(`${snapshot.name}: ${snapshot.isConnected ? 'Online' : 'Offline'}`);
  } else {
    console.log('Device no longer available.');
  }
}
```

@tab JavaScript

```js
const { getDevice, getPairedDevices } = require('@eisland/windows-bluetooth-helper');

// Get the list of all paired devices
const paired = getPairedDevices();

if (paired.length > 0) {
  // Store the ID of the first paired device
  const targetId = paired[0].deviceId;

  // Fetch a fresh snapshot for that specific device
  const snapshot = getDevice(targetId);

  // Null-check — the device may have disconnected since the list was fetched
  if (snapshot) {
    // Print the device name and its current connection status
    console.log(`${snapshot.name}: ${snapshot.isConnected ? 'Online' : 'Offline'}`);
  } else {
    console.log('Device no longer available.');
  }
}
```

:::

## Notes

:::note
The `deviceId` is a Windows DeviceInformation ID (e.g. `\\?\SWD#...`), not a Bluetooth MAC address. These IDs are stable across reboots for paired devices, but may change if a device is unpaired and re-paired.
:::

:::tip
If you need to monitor a device continuously (e.g. detect disconnections in real time), prefer [BluetoothMonitor](bluetooth-monitor.md) with its `device-connected` / `device-disconnected` events rather than polling `getDevice` repeatedly.
:::

:::note
The `batteryLevel` field is only available for BLE devices that expose a Battery Service (UUID `0x180F`). Classic Bluetooth devices will always report `batteryLevel: null`.
:::

## Danger Avoidance

:::danger
Do not call `getDevice` in a tight polling loop (e.g. `setInterval` with < 1000 ms). Each call queries the Windows device subsystem and creates a new snapshot. Excessive polling can cause high CPU usage and system instability. Use [BluetoothMonitor](bluetooth-monitor.md) for event-driven monitoring instead.
:::

:::danger
Do not assume a non-null return guarantees the device is still reachable. The snapshot reflects the state at the moment of the query. The device may disconnect between the `getDevice` call and any subsequent operation. Always handle failures gracefully when interacting with the device through other APIs.
:::
