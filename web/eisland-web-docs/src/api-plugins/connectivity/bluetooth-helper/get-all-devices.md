---
watermark: true
title: getAllDevices
icon: fa6-solid:code
---

# getAllDevices

:::info Introduction
`getAllDevices` is a synchronous query function that returns all visible Bluetooth devices. This includes devices that are already paired, devices that are currently connected, and nearby BLE devices that are actively broadcasting. It performs a single snapshot scan — the result reflects the device state at the exact moment of invocation.
:::

## Signature

```typescript
function getAllDevices(): BluetoothDeviceInfo[]
```

- **Returns:** An array of [BluetoothDeviceInfo](bluetooth-device-info.md) objects.
- **Throws:** This function does not throw under normal operation.

## Usage

`getAllDevices` is the broadest query available in `@eisland/windows-bluetooth-helper`. It is ideal when you need a complete picture of the Bluetooth landscape around the user — for example, populating a device picker UI, performing a one-time environment scan, or building a quick diagnostics view.

For narrower queries, consider:
- [getPairedDevices](get-paired-devices.md) — only paired devices
- [getConnectedDevices](get-connected-devices.md) — only connected devices
- [getDevice](get-device.md) — single device by ID

:::tip When to prefer getAllDevices vs. a Monitor
`getAllDevices` gives you a one-time snapshot. If you need to react to devices appearing, disappearing, or changing connection state in real time, use [BluetoothMonitor](bluetooth-monitor.md) instead. Calling `getAllDevices` in a polling loop is less efficient than subscribing to monitor events.
:::

:::note Device discovery scope
The result includes **paired** devices (from the Windows Bluetooth settings cache), **connected** devices (actively linked), and **nearby BLE** devices (those currently advertising). Classic Bluetooth devices that are powered on but not paired and not discoverable will NOT appear.
:::

## Return Value

An array of [BluetoothDeviceInfo](bluetooth-device-info.md) objects. Each object contains the following fields:

| Property | Type | Description |
|---|---|---|
| `deviceId` | `string` | Windows DeviceInformation ID |
| `name` | `string \| null` | Friendly device name, or `null` if unavailable |
| `bluetoothAddress` | `string \| null` | MAC address as a hex string, or `null` |
| `isConnected` | `boolean` | Whether the device is currently connected |
| `isPaired` | `boolean` | Whether the device is paired with the system |
| `signalStrength` | `number \| null` | RSSI in dBm, or `null` if unavailable |
| `deviceClass` | `number \| null` | Class of Device (CoD) bitmask value |
| `appearance` | `number \| null` | BLE Appearance category value |
| `serviceUuids` | `string[]` | GATT service UUIDs the device advertises |
| `deviceType` | `string \| null` | Human-readable type derived from CoD or Appearance |
| `batteryLevel` | `number \| null` | Battery percentage (0-100), BLE devices only |

:::warning Null fields are common
Not every device exposes all fields. Classic Bluetooth devices typically have `appearance` as `null`, while BLE devices may have `deviceClass` as `null`. `batteryLevel` is only available on BLE devices that expose the Battery Service (UUID `0x180F`). Always null-check before using optional fields.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getAllDevices } from '@eisland/windows-bluetooth-helper';

// Query all visible Bluetooth devices (paired + nearby BLE)
const devices = getAllDevices();

// Iterate and log each device with its connection status
devices.forEach((d) => {
  // Determine human-readable status: connected, paired, or just discoverable
  const status = d.isConnected ? 'Connected' : d.isPaired ? 'Paired' : 'Discoverable';
  // Print device name (fall back to "Unknown" if name is null)
  console.log(`[${status}] ${d.name ?? 'Unknown'}`);
});

// Filter for only connected devices
const connected = devices.filter((d) => d.isConnected);
console.log(`Connected devices: ${connected.length}`);

// Filter for BLE devices that report battery level
const withBattery = devices.filter((d) => d.batteryLevel !== null);
withBattery.forEach((d) => {
  console.log(`${d.name}: ${d.batteryLevel}% battery`);
});
```

@tab JavaScript

```js
const { getAllDevices } = require('@eisland/windows-bluetooth-helper');

// Query all visible Bluetooth devices (paired + nearby BLE)
const devices = getAllDevices();

// Iterate and log each device with its connection status
devices.forEach((d) => {
  // Determine human-readable status: connected, paired, or just discoverable
  const status = d.isConnected ? 'Connected' : d.isPaired ? 'Paired' : 'Discoverable';
  // Print device name (fall back to "Unknown" if name is null)
  console.log(`[${status}] ${d.name ?? 'Unknown'}`);
});

// Filter for only connected devices
const connected = devices.filter((d) => d.isConnected);
console.log(`Connected devices: ${connected.length}`);

// Filter for BLE devices that report battery level
const withBattery = devices.filter((d) => d.batteryLevel !== null);
withBattery.forEach((d) => {
  console.log(`${d.name}: ${d.batteryLevel}% battery`);
});
```

:::

## Notes

:::note Snapshot behavior
`getAllDevices` returns a point-in-time snapshot. The array you receive is a plain JavaScript array — it will not auto-update. If a device connects or disconnects after the call, your data will be stale. For live updates, use [BluetoothMonitor](bluetooth-monitor.md).
:::

:::tip Combining with other queries
You can pass a `deviceId` from `getAllDevices` results directly to [getDevice](get-device.md) to refresh a single device's state without re-scanning everything.
:::

:::note BLE discovery timing
Nearby BLE devices appear only while they are actively advertising. If a BLE device stops broadcasting (e.g., enters sleep), it may disappear from subsequent `getAllDevices` calls even though it is still physically nearby.
:::

## Danger Avoidance

:::danger Do not poll aggressively
Calling `getAllDevices` in a tight loop (e.g., `setInterval(fn, 100)`) will repeatedly invoke the native Bluetooth stack, consuming CPU and potentially interfering with active Bluetooth connections. Use [BluetoothMonitor](bluetooth-monitor.md) for real-time updates instead. If you must poll, keep the interval at 5 seconds or longer.
:::

:::danger Bluetooth adapter must be enabled
If the system's Bluetooth adapter is disabled or absent, `getAllDevices` returns an empty array. It does not throw an error. If you receive an unexpectedly empty result, verify that Bluetooth is enabled in Windows Settings before assuming there are no nearby devices.
:::
