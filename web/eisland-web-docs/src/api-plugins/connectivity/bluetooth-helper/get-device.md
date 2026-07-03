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
