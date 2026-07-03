---
watermark: true
title: TemperatureCategory
icon: fa6-solid:list
---

# TemperatureCategory

:::info
Classification of hardware temperature sensor readings.
:::

## Values

| Value | Description |
|-------|-------------|
| `"cpu"` | CPU temperature sensor |
| `"gpu"` | GPU temperature sensor |
| `"motherboard"` | Motherboard chipset sensor |
| `"storage"` | Storage device (HDD/SSD) sensor |
| `"unknown"` | Unclassified sensor |

:::note
Categories are determined by the LibreHardwareMonitor library based on hardware sensor metadata.
:::
