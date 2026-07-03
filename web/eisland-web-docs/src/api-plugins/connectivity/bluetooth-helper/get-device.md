---
watermark: true
title: getDevice
icon: fa6-solid:code
---

# getDevice

:::info
Returns a snapshot of a single Bluetooth device by its Windows DeviceInformation ID.
:::

## Signature

```typescript
function getDevice(deviceId: string): BluetoothDeviceInfo | null
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `deviceId` | `string` | Windows DeviceInformation ID of the target device |

## Return Value

[BluetoothDeviceInfo](bluetooth-device-info.md) object, or `null` if the device was not found.

```typescript
// Example return value
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

## Example

```typescript
import { getDevice, getPairedDevices } from '@eisland/windows-bluetooth-helper';

// Get a specific device by ID
const paired = getPairedDevices();
if (paired.length > 0) {
  const snapshot = getDevice(paired[0].deviceId);
  if (snapshot) {
    console.log(`${snapshot.name}: ${snapshot.isConnected ? 'Online' : 'Offline'}`);
  }
}
```
