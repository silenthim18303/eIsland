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
