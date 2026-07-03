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

## Example

```typescript
import { WifiMonitor } from '@eisland/windows-wifi-helper';

const monitor = new WifiMonitor();

// Start returns the initial state immediately
const initial = monitor.start();
console.log(`Initial state: ${initial.isConnected ? initial.ssid : 'Disconnected'}`);

monitor.on('wifi-connected', (info) => {
  console.log(`Connected to ${info.ssid}`);
});

monitor.on('wifi-disconnected', () => {
  console.log('WiFi disconnected');
});

monitor.on('signal-changed', (info) => {
  console.log(`Signal: ${info.signalBars}/5 bars`);
});

monitor.on('error', (err) => {
  console.error('WiFi monitor error:', err);
});

// ... later
monitor.stop();
```
