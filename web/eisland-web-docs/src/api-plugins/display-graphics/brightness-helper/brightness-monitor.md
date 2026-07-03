---
watermark: true
title: BrightnessMonitor
icon: fa6-solid:cubes
---

# BrightnessMonitor

:::info
Real-time screen brightness monitor. Uses WMI WmiMonitorBrightnessEvent to detect brightness changes.
:::

## Constructor

```typescript
constructor()
```

## Methods

| Method | Return | Description |
|--------|--------|-------------|
| `start()` | `void` | Start monitoring (idempotent) |
| `stop()` | `void` | Stop monitoring (idempotent) |
| `isRunning()` | `boolean` | Whether the monitor is currently active |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `brightness-changed` | `brightness: number, timestamp: number` | Brightness value changed |
| `error` | `err: Error` | Monitor error |

:::tip
Uses WMI WmiMonitorBrightnessEvent for real-time detection. No polling required — brightness changes are pushed as events.
:::

## Example

```typescript
import { BrightnessMonitor } from '@eisland/windows-brightness-helper';

const monitor = new BrightnessMonitor();

monitor.on('brightness-changed', (brightness, timestamp) => {
  console.log(`Brightness changed to ${brightness}% at ${new Date(timestamp)}`);
});

monitor.on('error', (err) => {
  console.error('Brightness monitor error:', err);
});

monitor.start();
console.log(`Monitoring: ${monitor.isRunning()}`);

// ... later
monitor.stop();
```
