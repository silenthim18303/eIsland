---
title: PowerMonitor
icon: circle-info
---

# PowerMonitor

> Placeholder — content to be added.

```ts
class PowerMonitor extends EventEmitter {
  start(): PowerInfo;
  stop(): void;
  getPowerInfo(): PowerInfo | null;
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ac-connected` | `info: PowerInfo` | AC power connected |
| `ac-disconnected` | `info: PowerInfo` | AC power disconnected |
| `battery-low` | `info: PowerInfo` | Battery level low |
| `charging` | `info: PowerInfo` | Battery charging |
| `discharging` | `info: PowerInfo` | Battery discharging |
| `power-changed` | `info: PowerInfo` | Power state changed |
| `error` | `err: Error` | Monitor error |
