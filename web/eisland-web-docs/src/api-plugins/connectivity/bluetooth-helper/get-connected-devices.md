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
