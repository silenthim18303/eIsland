---
watermark: true
title: getTemperature
icon: fa6-solid:code
---

# getTemperature

:::info Introduction
`getTemperature` is a synchronous function that returns a snapshot of all hardware temperature sensors reported by the LibreHardwareMonitor helper process. It reads CPU, GPU, motherboard, and storage temperatures and bundles them into a single [TemperatureSnapshot](temperature-snapshot.md) object. This is the primary way to poll real-time thermal data from eIsland plugins.
:::

## Signature

```typescript
function getTemperature(): TemperatureSnapshot
```

The function takes no parameters and returns immediately. All sensor data is collected from the LibreHardwareMonitor helper EXE's shared state, so the call is fast and non-blocking.

## Usage

`getTemperature` is designed for periodic polling. Call it on a timer (e.g., every 1-5 seconds) to build a temperature monitoring dashboard or trigger thermal warnings.

:::tip Best Practice
Call `getTemperature` at a fixed interval using `setInterval` or a framework-level scheduler. Avoid calling it in tight loops — while the call is fast, the underlying sensor data only updates at the helper process's refresh rate (typically once per second).
:::

:::note Snapshot Semantics
Each call returns a point-in-time snapshot. The `readings` array may change between calls as sensors appear or disappear. Always check `isAvailable` before accessing `readings`.
:::

Typical workflow:

1. Call `getTemperature()` to obtain a [TemperatureSnapshot](temperature-snapshot.md).
2. Check `isAvailable` — if `false`, the helper EXE is not running or no sensors were detected.
3. Iterate over `readings` to display per-sensor data, or use `maxTemperatureCelsius` for a single headline value.

## Return Value

Returns a [TemperatureSnapshot](temperature-snapshot.md) object with the following shape:

| Field | Type | Description |
| --- | --- | --- |
| `isAvailable` | `boolean` | `true` if the helper EXE is running and at least one sensor is reporting. |
| `readings` | [TemperatureReading[]](temperature-reading.md) | Array of individual sensor readings. Empty if `isAvailable` is `false`. |
| `maxTemperatureCelsius` | `number \| null` | The highest temperature across all sensors. `null` when `isAvailable` is `false` or no sensors report valid data. |

:::warning Null Safety
`maxTemperatureCelsius` can be `null`. Always guard against it before performing arithmetic or comparisons:
```typescript
const max = temp.maxTemperatureCelsius ?? 0;
```
:::

## Properties

### TemperatureReading

Each entry in the `readings` array is a [TemperatureReading](temperature-reading.md) object:

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier for the sensor (e.g., `'cpu-0'`, `'gpu-0'`). |
| `label` | `string` | Human-readable sensor name (e.g., `'CPU Core #1'`, `'GPU Core'`). |
| `category` | `TemperatureCategory` | One of `'cpu'`, `'gpu'`, `'motherboard'`, `'storage'`, or `'unknown'`. |
| `temperatureCelsius` | `number` | Current temperature in degrees Celsius. |
| `source` | `'libre-hardware-monitor'` | Data source — always `'libre-hardware-monitor'` for this plugin. |

:::tip Filtering by Category
Use the `category` field to group readings. For example, to show only CPU temperatures:
```typescript
const cpuTemps = temp.readings.filter(r => r.category === 'cpu');
```
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getTemperature } from '@eisland/windows-performance-monitor';
import type { TemperatureSnapshot } from '@eisland/windows-performance-monitor';

// Poll temperature every 2 seconds
setInterval(() => {
  // Get the current temperature snapshot
  const temp: TemperatureSnapshot = getTemperature();

  // Check if the helper EXE is available and sensors are reporting
  if (!temp.isAvailable) {
    console.warn('Temperature unavailable — ensure eIslandTemperatureReader.exe is running');
    return;
  }

  // Display the highest temperature across all sensors
  console.log(`Max: ${temp.maxTemperatureCelsius}°C`);

  // List each sensor reading with its category
  temp.readings.forEach(r => {
    console.log(`  ${r.label} [${r.category}]: ${r.temperatureCelsius}°C`);
  });
}, 2000);
```

@tab JavaScript

```js
const { getTemperature } = require('@eisland/windows-performance-monitor');

// Poll temperature every 2 seconds
setInterval(() => {
  // Get the current temperature snapshot
  const temp = getTemperature();

  // Check if the helper EXE is available and sensors are reporting
  if (!temp.isAvailable) {
    console.warn('Temperature unavailable — ensure eIslandTemperatureReader.exe is running');
    return;
  }

  // Display the highest temperature across all sensors
  console.log(`Max: ${temp.maxTemperatureCelsius}°C`);

  // List each sensor reading with its category
  temp.readings.forEach(r => {
    console.log(`  ${r.label} [${r.category}]: ${r.temperatureCelsius}°C`);
  });
}, 2000);
```

:::

## Notes

:::note Helper EXE Dependency
This function relies on the `eIslandTemperatureReader.exe` helper process. The helper uses LibreHardwareMonitor to access low-level hardware sensor data. If the helper is not running, `isAvailable` will be `false` and `readings` will be an empty array.
:::

:::note Sensor Availability Varies by Hardware
Not all systems expose the same set of sensors. Some machines may only report CPU temperatures; others may include GPU, motherboard, or storage sensors. The `category` field with value `'unknown'` indicates a sensor that LibreHardwareMonitor could not classify.
:::

:::tip Use maxTemperatureCelsius for Quick Checks
If you only need a single thermal headline value (e.g., for a floating widget badge), use `maxTemperatureCelsius` instead of iterating `readings`. It is pre-computed and avoids unnecessary array traversal.
:::

## Danger Avoidance

:::danger Do Not Access readings Without Checking isAvailable
If `isAvailable` is `false`, the `readings` array is empty and `maxTemperatureCelsius` is `null`. Skipping the `isAvailable` check will lead to `null` reference errors or silent failures downstream. Always check the flag first.
:::

:::danger Avoid Excessive Polling Frequency
Calling `getTemperature` in a tight loop (e.g., every 10ms) will not yield fresher data — the helper EXE updates at its own refresh rate. Excessive calls waste CPU cycles without benefit. A 1-5 second interval is sufficient for most UI use cases.
:::

:::danger Do Not Assume Specific Sensors Exist
Never hardcode assumptions about which sensor IDs or categories will be present. A system without a discrete GPU will have no `'gpu'` readings. Write defensive code that handles an empty `readings` array gracefully.
:::
