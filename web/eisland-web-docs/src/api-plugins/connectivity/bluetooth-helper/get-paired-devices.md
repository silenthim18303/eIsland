---
watermark: true
title: getPairedDevices
icon: fa6-solid:code
---

# getPairedDevices

:::info Introduction
`getPairedDevices` is a synchronous query function that returns all Bluetooth devices currently paired with the Windows system. It scans the system's paired device registry and returns a snapshot of each device's status, including connection state, signal strength, device type, and battery level (for BLE devices).
:::

## Signature

```typescript
function getPairedDevices(): BluetoothDeviceInfo[]
```

This function takes no parameters and returns an array of [BluetoothDeviceInfo](bluetooth-device-info.md) objects.

## Usage

`getPairedDevices` is a one-shot query function — call it whenever you need a point-in-time snapshot of all paired Bluetooth devices. Common use cases:

- Building a UI that lists the user's paired devices
- Checking whether a specific device is paired before attempting other operations
- Monitoring paired device count changes by polling periodically

:::tip
If you need real-time updates when devices are added, removed, or change state, use the [BluetoothMonitor](bluetooth-monitor.md) class instead of polling this function repeatedly.
:::

:::note
This function returns only **paired** devices. Devices that are nearby but not paired will not appear. To include nearby BLE advertising devices, use [getAllDevices](get-all-devices.md) instead. To get only currently **connected** devices, use [getConnectedDevices](get-connected-devices.md).
:::

## Return Value

Returns an array of [BluetoothDeviceInfo](bluetooth-device-info.md) objects. Each object contains the device's ID, name, Bluetooth address, connection/pairing state, signal strength, device class, GATT services, inferred device type, and battery level.

Returns an **empty array** `[]` if no devices are paired with the system.

:::warning
Some properties may be `null` depending on the device type and available information. For example, `name` can be `null` if the device does not broadcast a friendly name, `batteryLevel` is only available on BLE devices, and `signalStrength` may be `null` if the RSSI reading is unavailable. Always perform null checks before using optional fields.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getPairedDevices } from '@eisland/windows-bluetooth-helper';

// Query all paired Bluetooth devices
const paired: BluetoothDeviceInfo[] = getPairedDevices();

// Log the total count of paired devices
console.log(`Found ${paired.length} paired device(s)`);

// Iterate and display each device's name and type
paired.forEach((device) => {
  // Use fallback for devices with no friendly name
  const name = device.name ?? 'Unknown Device';
  // Use fallback for devices with no inferred type
  const type = device.deviceType ?? 'Unknown Type';
  // Show connection status alongside device info
  console.log(`- ${name} [${type}] (connected: ${device.isConnected})`);
});
```

@tab JavaScript

```js
const { getPairedDevices } = require('@eisland/windows-bluetooth-helper');

// Query all paired Bluetooth devices
const paired = getPairedDevices();

// Log the total count of paired devices
console.log(`Found ${paired.length} paired device(s)`);

// Iterate and display each device's name and type
paired.forEach((device) => {
  // Use fallback for devices with no friendly name
  const name = device.name ?? 'Unknown Device';
  // Use fallback for devices with no inferred type
  const type = device.deviceType ?? 'Unknown Type';
  // Show connection status alongside device info
  console.log(`- ${name} [${type}] (connected: ${device.isConnected})`);
});
```

:::

## Notes

:::note
The returned array is a snapshot at the moment of the call. Paired devices are relatively stable, but if a user unpair a device between two calls, the results will differ. Do not cache the result for extended periods if accuracy matters.
:::

:::note
The `deviceType` field is inferred from BLE Appearance or Classic Bluetooth Class of Device (CoD). Common values include `"Headphones"`, `"Speaker"`, `"Phone"`, `"Printer"`, `"HID"`, `"Watch"`, etc. If the device type cannot be determined, this field is `null`.
:::

:::tip
Use the `deviceId` field as a stable identifier when referencing a specific device across multiple queries or when passing to [getDevice](get-device.md). The `deviceId` is the Windows `DeviceInformation.ID` string and remains consistent as long as the device stays paired.
:::

## Danger Avoidance

:::danger
Do **not** assume all properties in `BluetoothDeviceInfo` are non-null. Fields such as `name`, `bluetoothAddress`, `signalStrength`, `deviceClass`, `appearance`, `deviceType`, and `batteryLevel` can all be `null`. Accessing these without null checks (e.g., `device.name.length`) will throw a `TypeError` at runtime.
:::

:::danger
Do **not** call `getPairedDevices()` in a tight loop as a substitute for real-time monitoring. This function performs a system-level query each time and repeated rapid calls can cause unnecessary CPU and I/O overhead. For continuous device tracking, use the [BluetoothMonitor](bluetooth-monitor.md) class which relies on efficient OS-level event notifications.
:::
