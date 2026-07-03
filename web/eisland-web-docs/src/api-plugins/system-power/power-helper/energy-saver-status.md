---
watermark: true
title: EnergySaverStatus
icon: fa6-solid:list
---

# EnergySaverStatus

:::info
Windows energy saver (battery saver) mode status.
:::

## Values

| Value | Name | Description |
|-------|------|-------------|
| `0` | `Disabled` | Energy saver is disabled by policy |
| `1` | `Off` | Energy saver is off |
| `2` | `On` | Energy saver is active |

:::note
Energy saver mode is managed by Windows and typically activates at low battery levels. `Disabled` means a policy has override it.
:::
