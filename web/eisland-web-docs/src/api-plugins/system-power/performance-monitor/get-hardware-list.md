---
watermark: true
title: getHardwareList
icon: fa6-solid:code
---

# getHardwareList

:::info Introduction
`getHardwareList` is a synchronous function that queries the list of detected CPUs and GPUs on the system via the LibreHardwareMonitor helper EXE. It returns a [HardwareListSnapshot](hardware-list-snapshot.md) containing categorized [HardwareDevice](hardware-device.md) arrays, which can be used to enumerate available hardware before performing per-device temperature or performance queries.
:::

## Signature

```typescript
function getHardwareList(): HardwareListSnapshot
```

## Usage

`getHardwareList` is the entry point for discovering which CPU and GPU devices are visible to the LibreHardwareMonitor backend. Call it once at startup (or when you need to refresh the device list) to obtain the identifiers and names of all detected hardware.

:::tip
Store the returned snapshot and reuse the `id` fields from each [HardwareDevice](hardware-device.md) when you need to correlate temperature readings ([TemperatureReading](temperature-reading.md)) back to specific hardware components.
:::

:::note
This function is fully synchronous and does not perform any I/O beyond invoking the helper EXE. It is safe to call at any point in your application lifecycle, but avoid calling it in a tight loop since it spawns a child process each time.
:::

## Return Value

Returns a [HardwareListSnapshot](hardware-list-snapshot.md) object with the following structure:

| Property | Type | Description |
|---|---|---|
| `isAvailable` | `boolean` | `true` if the LibreHardwareMonitor helper EXE responded successfully. |
| `cpus` | [HardwareDevice[]](hardware-device.md) | Array of detected CPU devices. |
| `gpus` | [HardwareDevice[]](hardware-device.md) | Array of detected GPU devices. |

:::warning
If the LibreHardwareMonitor helper EXE is not installed or fails to respond, `isAvailable` will be `false` and both `cpus` and `gpus` will be empty arrays. Always check `isAvailable` before accessing the device arrays.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getHardwareList } from '@eisland/windows-performance-monitor';

// Query the list of detected CPUs and GPUs
const hw = getHardwareList();

// Check if the helper EXE is available before accessing device data
if (hw.isAvailable) {
  console.log('=== Detected Hardware ===');

  // Iterate over each detected CPU
  hw.cpus.forEach((cpu) => {
    // Print the CPU name and its hardware type identifier
    console.log(`  CPU: ${cpu.name} (${cpu.hardwareType})`);
  });

  // Iterate over each detected GPU
  hw.gpus.forEach((gpu) => {
    // Print the GPU name and its hardware type identifier
    console.log(`  GPU: ${gpu.name} (${gpu.hardwareType})`);
  });
} else {
  // The helper EXE was unavailable; no hardware data is accessible
  console.warn('LibreHardwareMonitor helper is not available.');
}
```

@tab JavaScript

```js
const { getHardwareList } = require('@eisland/windows-performance-monitor');

// Query the list of detected CPUs and GPUs
const hw = getHardwareList();

// Check if the helper EXE is available before accessing device data
if (hw.isAvailable) {
  console.log('=== Detected Hardware ===');

  // Iterate over each detected CPU
  hw.cpus.forEach((cpu) => {
    // Print the CPU name and its hardware type identifier
    console.log(`  CPU: ${cpu.name} (${cpu.hardwareType})`);
  });

  // Iterate over each detected GPU
  hw.gpus.forEach((gpu) => {
    // Print the GPU name and its hardware type identifier
    console.log(`  GPU: ${gpu.name} (${gpu.hardwareType})`);
  });
} else {
  // The helper EXE was unavailable; no hardware data is accessible
  console.warn('LibreHardwareMonitor helper is not available.');
}
```

:::

## Notes

:::note
The `source` field on every [HardwareDevice](hardware-device.md) is always the literal string `'libre-hardware-monitor'`. This indicates the data originated from the LibreHardwareMonitor backend and may change if additional backends are added in the future.
:::

:::note
The `hardwareType` field contains the raw hardware type string reported by LibreHardwareMonitor (e.g. `'Cpu'`, `'GpuNvidia'`, `'GpuAmd'`). Use this value if you need to distinguish between GPU vendors or apply vendor-specific logic.
:::

:::tip
If you only need CPU information, filter `hw.cpus`; if you only need GPU information, filter `hw.gpus`. The snapshot separates them by category so you do not need to filter by `category` yourself.
:::

## Danger Avoidance

:::danger
Do not call `getHardwareList()` inside a tight loop or on every animation frame. Each invocation spawns a child process to communicate with the LibreHardwareMonitor helper EXE, which is expensive. Cache the result and refresh it only when necessary (e.g. on user action or a periodic timer with a reasonable interval such as 30 seconds).
:::

:::danger
Never access `cpus` or `gpus` array elements without first checking `isAvailable`. When the helper EXE is unavailable, the arrays are empty, but relying on this implicit behavior is fragile. Always guard with `if (hw.isAvailable)` to avoid silent failures and confusing downstream errors.
:::
