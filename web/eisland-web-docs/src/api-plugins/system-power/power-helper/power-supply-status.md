---
watermark: true
title: PowerSupplyStatus
icon: fa6-solid:list
---

# PowerSupplyStatus

:::info
Power supply status values.
:::

## Values

| Value | Name | Description |
|-------|------|-------------|
| `0` | `NotPresent` | No power supply connected |
| `1` | `Adequate` | Adequate power (AC connected) |
| `2` | `Inadequate` | Insufficient power supply |
| `3` | `Unknown` | Power supply status unknown |

:::note
The `Inadequate` status may appear with underpowered USB-C chargers that cannot supply enough current.
:::
