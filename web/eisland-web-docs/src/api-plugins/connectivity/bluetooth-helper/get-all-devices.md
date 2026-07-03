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
