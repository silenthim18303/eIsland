---
watermark: true
title: getConnectedDevices
icon: fa6-solid:code
---

# getConnectedDevices

:::info Introduction
`getConnectedDevices` is a synchronous query function that returns all Bluetooth devices currently in a connected state. It scans both classic Bluetooth and BLE connections, returning an array of [BluetoothDeviceInfo](bluetooth-device-info.md) snapshots. This is useful for checking which peripherals (headphones, keyboards, mice, etc.) are actively linked to the system right now.
:::

## Signature

```typescript
function getConnectedDevices(): BluetoothDeviceInfo[];
```

## Usage

`getConnectedDevices` is a point-in-time snapshot query. Call it whenever you need to check what is currently connected — for example, before displaying a status indicator, deciding whether to route audio, or verifying a specific device is still linked.

:::tip
Unlike [BluetoothMonitor](bluetooth-monitor.md), which streams live events, `getConnectedDevices` gives you a single snapshot. If your UI needs real-time updates, prefer the monitor. If you just need a one-time check, this function is simpler and cheaper.
:::

:::note
This function only returns devices that are **actively connected**. Paired devices that are powered off or out of range will not appear. Use [getPairedDevices](get-paired-devices.md) if you need the full list of paired devices regardless of connection state.
:::

## Return Value

Returns an array of [BluetoothDeviceInfo](bluetooth-device-info.md) objects. The array is empty if no Bluetooth devices are currently connected.

Each object contains detailed information including device name, Bluetooth address, signal strength, device class, supported GATT services, and battery level (for BLE devices).

```typescript
// Example return value — one connected device
[
  {
    deviceId: '\\?\SWD#...',         // Windows DeviceInformation ID
    name: 'AirPods Pro',             // Human-readable device name
    bluetoothAddress: 'A4:B1:C2:D3:E4:F5', // MAC address in hex
    isConnected: true,               // Always true for results from this function
    isPaired: true,                  // Whether the device is paired
    signalStrength: -45,             // RSSI in dBm
    deviceClass: 2360344,            // Class of Device (CoD) bitmask
    appearance: 96,                  // BLE Appearance value
    serviceUuids: [],                // GATT service UUIDs the device advertises
    deviceType: 'Headphones',        // Derived type label
    batteryLevel: 85,                // Battery percentage (BLE only, null if unavailable)
  },
]
```

:::warning
Some fields may be `null` depending on the device type and Bluetooth transport. Classic Bluetooth devices typically lack `appearance`, `serviceUuids`, and `batteryLevel`. BLE devices may lack `bluetoothAddress` and `deviceClass`. Always null-check fields before using them.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getConnectedDevices, BluetoothDeviceInfo } from '@eisland/windows-bluetooth-helper';

// Query all currently connected Bluetooth devices
const connected: BluetoothDeviceInfo[] = getConnectedDevices();

if (connected.length === 0) {
  // No devices are connected right now
  console.log('No Bluetooth devices currently connected');
} else {
  // Iterate over each connected device and print its info
  connected.forEach((d: BluetoothDeviceInfo) => {
    // Print device name and signal strength (null-safe with ?? operator)
    console.log(`${d.name ?? 'Unknown Device'} — signal: ${d.signalStrength ?? 'N/A'} dBm`);

    // Print battery level if available (BLE devices only)
    if (d.batteryLevel !== null) {
      console.log(`  Battery: ${d.batteryLevel}%`);
    }
  });
}
```

@tab JavaScript

```js
const { getConnectedDevices } = require('@eisland/windows-bluetooth-helper');

// Query all currently connected Bluetooth devices
const connected = getConnectedDevices();

if (connected.length === 0) {
  // No devices are connected right now
  console.log('No Bluetooth devices currently connected');
} else {
  // Iterate over each connected device and print its info
  connected.forEach((d) => {
    // Print device name and signal strength (null-safe with ?? operator)
    console.log(`${d.name ?? 'Unknown Device'} — signal: ${d.signalStrength ?? 'N/A'} dBm`);

    // Print battery level if available (BLE devices only)
    if (d.batteryLevel !== null) {
      console.log(`  Battery: ${d.batteryLevel}%`);
    }
  });
}
```

:::

## Notes

:::note
The returned array is a **snapshot**, not a live view. The connected state can change at any moment — a device may disconnect immediately after this call returns. Do not cache the result for extended periods if you need accurate state.
:::

:::tip
To get a specific device by its ID instead of filtering the full list, use [getDevice(deviceId)](get-device.md) which is more efficient for single-device lookups.
:::

:::note
The `isConnected` field in the returned objects will always be `true` since this function only includes connected devices. If you need to distinguish connected from paired-but-disconnected devices, use [getAllDevices](get-all-devices.md) or [getPairedDevices](get-paired-devices.md) instead.
:::

## Danger Avoidance

:::danger
Do not call this function in a tight loop as a polling mechanism to detect connection changes. Each call performs a full device enumeration via the Windows Runtime, which is expensive. For real-time monitoring, use [BluetoothMonitor](bluetooth-monitor.md) with event listeners (`device-connected`, `device-disconnected`) instead.
:::

:::danger
The `deviceId` field is a Windows DeviceInformation ID and is **not stable across reboots or re-pairings**. Never persist it as a long-term device identifier in a database. If you need stable identification, use `bluetoothAddress` (MAC) where available, but be aware that some BLE devices randomize their addresses.
:::
