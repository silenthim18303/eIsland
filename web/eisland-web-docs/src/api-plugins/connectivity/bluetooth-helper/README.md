---
watermark: true
title: Windows Bluetooth Helper
icon: server
---

# Windows Bluetooth Helper

`@eisland/windows-bluetooth-helper` · v26.0.0

:::info
Bluetooth device management and monitoring via .NET NativeAOT DLL (koffi FFI).
:::

## API Reference

| Type | Name | Description |
|------|------|-------------|
| Interface | [BluetoothDeviceInfo](bluetooth-device-info.md) | Bluetooth device data structure |
| Function | [getPairedDevices](get-paired-devices.md) | Get all paired devices |
| Function | [getConnectedDevices](get-connected-devices.md) | Get currently connected devices |
| Function | [getAllDevices](get-all-devices.md) | Get all visible devices |
| Function | [getDevice](get-device.md) | Get single device snapshot |
| Class | [BluetoothMonitor](bluetooth-monitor.md) | Real-time device change monitor |
