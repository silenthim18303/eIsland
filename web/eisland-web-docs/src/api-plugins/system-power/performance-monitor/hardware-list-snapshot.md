---
watermark: true
title: HardwareListSnapshot
icon: fa6-solid:table
---

# HardwareListSnapshot

:::info
List of detected CPU and GPU hardware devices.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isAvailable` | `boolean` | Whether hardware data is available |
| `cpus` | [HardwareDevice](hardware-device.md)`[]` | Detected CPUs |
| `gpus` | [HardwareDevice](hardware-device.md)`[]` | Detected GPUs |
