---
watermark: true
title: BatteryStatus
icon: fa6-solid:list
---

# BatteryStatus

:::info
Battery charge status values.
:::

## Values

| Value | Name | Description |
|-------|------|-------------|
| `0` | `NotPresent` | No battery present (desktop systems) |
| `1` | `Discharging` | Battery is discharging |
| `2` | `Idle` | Battery fully charged, AC connected |
| `3` | `Charging` | Battery is charging |

:::note
Desktop systems without a battery report `NotPresent`. The `Idle` state means the battery is full and AC is connected.
:::
