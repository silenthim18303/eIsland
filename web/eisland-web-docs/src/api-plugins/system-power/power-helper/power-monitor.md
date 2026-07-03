---
watermark: true
title: PowerMonitor
icon: fa6-solid:cubes
---

# PowerMonitor

:::info
Real-time power status monitor. Uses .NET NativeAOT DLL via koffi FFI to subscribe to WinRT PowerManager events.
:::

## Constructor

```typescript
constructor()
```

## Methods

| Method | Return | Description |
|--------|--------|-------------|
| `start()` | [PowerInfo](power-info.md) | Start monitoring (idempotent), returns initial state |
| `stop()` | `void` | Stop monitoring (idempotent) |
| `getPowerInfo()` | [PowerInfo](power-info.md) `\| null` | Get current power status snapshot |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `ac-connected` | `info: PowerInfo` | AC power adapter connected |
| `ac-disconnected` | `info: PowerInfo` | AC power adapter disconnected |
| `battery-low` | `info: PowerInfo` | Battery level dropped to ≤15% |
| `charging` | `info: PowerInfo` | Battery started charging |
| `discharging` | `info: PowerInfo` | Battery started discharging |
| `power-changed` | `info: PowerInfo` | Any power state change (generic) |
| `error` | `err: Error` | Monitor error |

:::tip
The `start()` method returns the initial power state immediately. Use this snapshot to initialize your UI before events arrive.
:::

:::warning
The `battery-low` event fires when battery drops to ≤15%. Monitor frequency depends on the system power event rate.
:::

## Example

```typescript
import { PowerMonitor } from '@eisland/windows-power-helper';

const monitor = new PowerMonitor();

// Start returns initial state
const initial = monitor.start();
console.log(`Battery: ${initial.remainingChargePercent}%`);

monitor.on('ac-connected', (info) => {
  console.log('AC adapter connected');
});

monitor.on('ac-disconnected', (info) => {
  console.log('Running on battery');
});

monitor.on('battery-low', (info) => {
  console.warn(`Battery low: ${info.remainingChargePercent}%`);
});

monitor.on('charging', (info) => {
  console.log(`Charging: ${info.remainingChargePercent}%`);
});

monitor.on('power-changed', (info) => {
  console.log(`Power changed: ${info.remainingChargePercent}%`);
});

monitor.on('error', (err) => {
  console.error('Power monitor error:', err);
});

// ... later
monitor.stop();
```
