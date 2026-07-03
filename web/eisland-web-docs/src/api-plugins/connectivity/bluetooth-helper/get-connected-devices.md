---
watermark: true
title: getConnectedDevices
icon: fa6-solid:code
---

# getConnectedDevices

:::info
Returns all Bluetooth devices that are currently connected.
:::

## Signature

```typescript
function getConnectedDevices(): BluetoothDeviceInfo[]
```

## Return Value

Array of [BluetoothDeviceInfo](bluetooth-device-info.md) objects. Empty array if no connected devices.

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
]
```

## Example

```typescript
import { getConnectedDevices } from '@eisland/windows-bluetooth-helper';

const connected = getConnectedDevices();
if (connected.length === 0) {
  console.log('No Bluetooth devices currently connected');
} else {
  connected.forEach(d => {
    console.log(`${d.name} — signal: ${d.signalStrength ?? 'N/A'} dBm`);
  });
}
```
