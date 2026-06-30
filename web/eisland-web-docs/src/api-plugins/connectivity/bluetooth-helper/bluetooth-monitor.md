---
title: BluetoothMonitor
icon: circle-info
---

# BluetoothMonitor

> Placeholder — content to be added.

```ts
class BluetoothMonitor extends EventEmitter {
  start(): void;
  stop(): void;
  getDevices(): BluetoothDeviceInfo[];
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `device-added` | `device: BluetoothDeviceInfo` | New device discovered |
| `device-removed` | `deviceId: string` | Device removed |
| `device-connected` | `device: BluetoothDeviceInfo` | Device connected |
| `device-disconnected` | `deviceId: string` | Device disconnected |
| `device-updated` | `device: BluetoothDeviceInfo` | Device info updated |
| `error` | `err: Error` | Monitor error |
