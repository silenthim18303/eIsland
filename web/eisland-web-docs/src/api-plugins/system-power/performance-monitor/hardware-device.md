---
watermark: true
title: HardwareDevice
icon: fa6-solid:table
---

# HardwareDevice

:::info
Information about a detected hardware device (CPU or GPU).
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique hardware identifier |
| `name` | `string` | Device name (e.g., "Intel Core i7-12700K") |
| `category` | `"cpu" \| "gpu"` | Device category |
| `hardwareType` | `string` | Hardware type string from LibreHardwareMonitor |
| `source` | `"libre-hardware-monitor"` | Data source identifier |
