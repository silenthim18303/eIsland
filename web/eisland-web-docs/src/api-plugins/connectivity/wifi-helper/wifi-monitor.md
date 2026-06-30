---
watermark: true
title: WifiMonitor
icon: fa6-solid:cubes
---

# WifiMonitor

> Placeholder — content to be added.

```ts
class WifiMonitor extends EventEmitter {
  start(): WifiInfo;
  stop(): void;
  getWifiInfo(): WifiInfo | null;
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `wifi-connected` | `info: WifiInfo` | WiFi connected |
| `wifi-disconnected` | `info: WifiInfo` | WiFi disconnected |
| `signal-changed` | `info: WifiInfo` | Signal strength changed |
| `ssid-changed` | `info: WifiInfo` | SSID changed |
| `wifi-changed` | `info: WifiInfo` | WiFi state changed |
| `error` | `err: Error` | Monitor error |
