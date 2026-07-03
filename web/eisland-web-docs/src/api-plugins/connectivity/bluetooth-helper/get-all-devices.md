---
watermark: true
title: getAllDevices
icon: fa6-solid:code
---

# getAllDevices

:::info
Returns all visible Bluetooth devices (paired, connected, and discoverable).
:::

## Signature

```typescript
function getAllDevices(): BluetoothDeviceInfo[]
```

## Return Value

Array of [BluetoothDeviceInfo](bluetooth-device-info.md) objects.

```typescript
// Example return value
[
  {
    deviceId: '\\?\SWD#...',
    name: 'AirPods Pro',
    bluetoothAddress: 'A4:B1:C2:D3:E4:F5',
    isConnected: true,
    isPaired: true,
    signalStrength: -45,
    deviceClass: 2360344,
    appearance: 96,
    serviceUuids: [],
    deviceType: 'Headphones',
    batteryLevel: 85,
  },
  {
    deviceId: '\\?\SWD#...',
    name: 'MX Master 3',
    bluetoothAddress: null,
    isConnected: false,
    isPaired: true,
    signalStrength: null,
    deviceClass: 1344,
    appearance: null,
    serviceUuids: [],
    deviceType: 'Mouse',
    batteryLevel: null,
  },
]
```

## Example

```typescript
import { getAllDevices } from '@eisland/windows-bluetooth-helper';

// Get all visible Bluetooth devices (paired + discoverable)
const devices = getAllDevices();
devices.forEach(d => {
  const status = d.isConnected ? 'Connected' : d.isPaired ? 'Paired' : 'Discoverable';
  console.log(`[${status}] ${d.name ?? 'Unknown'}`);
});
```
