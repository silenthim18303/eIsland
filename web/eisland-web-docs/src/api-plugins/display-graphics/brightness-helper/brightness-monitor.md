---
title: BrightnessMonitor
icon: circle-info
---

# BrightnessMonitor

> Placeholder — content to be added.

```ts
class BrightnessMonitor extends EventEmitter {
  start(): void;
  stop(): void;
  isRunning(): boolean;
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `brightness-changed` | `brightness: number, timestamp: number` | Brightness value changed |
| `error` | `err: Error` | Monitor error |
