---
watermark: true
title: TemperatureSnapshot
icon: fa6-solid:table
---

# TemperatureSnapshot

:::info
Collection of temperature readings from all available sensors.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isAvailable` | `boolean` | Whether temperature data is available (requires LibreHardwareMonitor) |
| `readings` | [TemperatureReading](temperature-reading.md)`[]` | Array of sensor readings |
| `maxTemperatureCelsius` | `number \| null` | Highest temperature across all sensors, `null` if no readings |
