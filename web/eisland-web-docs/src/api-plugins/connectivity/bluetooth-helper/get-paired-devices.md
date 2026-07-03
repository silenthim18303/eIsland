---
watermark: true
title: getPairedDevices
icon: fa6-solid:code
---

# getPairedDevices

:::info
Returns all Bluetooth devices that are currently paired with the system.
:::

## Signature

```typescript
function getPairedDevices(): BluetoothDeviceInfo[]
```

## Return Value

Array of [BluetoothDeviceInfo](bluetooth-device-info.md) objects. Empty array if no paired devices.

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
    serviceUuids: ['0000110b-0000-1000-8000-00805f9b34fb'],
    deviceType: 'Headphones',
    batteryLevel: 85,
  },
]
```

## Example

```typescript
import { getPairedDevices } from '@eisland/windows-bluetooth-helper';

const paired = getPairedDevices();
console.log(`Found ${paired.length} paired device(s)`);

paired.forEach(d => {
  console.log(`- ${d.name ?? 'Unknown'} [${d.deviceType ?? 'Unknown type'}]`);
});
```
