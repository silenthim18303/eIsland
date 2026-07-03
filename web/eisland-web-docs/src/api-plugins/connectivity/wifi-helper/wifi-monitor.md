---
watermark: true
title: WifiMonitor
icon: fa6-solid:cubes
---

# WifiMonitor

:::info
Real-time WiFi connection status monitor. Uses .NET NativeAOT DLL via koffi FFI to subscribe to WinRT NetworkInformation.NetworkStatusChanged events.
:::

## Constructor

```typescript
constructor()
```

## Methods

| Method | Return | Description |
|--------|--------|-------------|
| `start()` | [WifiInfo](wifi-info.md) | Start monitoring (idempotent), returns initial state |
| `stop()` | `void` | Stop monitoring (idempotent) |
| `getWifiInfo()` | [WifiInfo](wifi-info.md) `\| null` | Get current WiFi status snapshot |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `wifi-connected` | `info: WifiInfo` | WiFi connection established |
| `wifi-disconnected` | `info: WifiInfo` | WiFi connection lost |
| `signal-changed` | `info: WifiInfo` | Signal strength changed |
| `ssid-changed` | `info: WifiInfo` | Connected network changed |
| `wifi-changed` | `info: WifiInfo` | Any WiFi state change (generic) |
| `error` | `err: Error` | Monitor error |

:::tip
The `start()` method returns the initial WiFi state immediately. Use this snapshot to initialize your UI before events arrive.
:::

:::note
The `wifi-changed` event fires on any state change. Use specific events (`wifi-connected`, `signal-changed`, etc.) for targeted handling.
:::
