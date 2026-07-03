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

## Example

```typescript
import { getPairedDevices } from '@eisland/windows-bluetooth-helper';

const paired = getPairedDevices();
console.log(`Found ${paired.length} paired device(s)`);

paired.forEach(d => {
  console.log(`- ${d.name ?? 'Unknown'} [${d.deviceType ?? 'Unknown type'}]`);
});
```
