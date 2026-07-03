---
watermark: true
title: TimelineProps
icon: fa6-solid:table
---

# TimelineProps

:::info
Simplified timeline position and duration for SmtcMonitor events.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | `number` | Current playback position in seconds |
| `duration` | `number` | Total duration in seconds |

:::tip
This is a simplified version of [TimelineProperties](timeline-properties.md) used by SmtcMonitor events. Use `getStatus()` for full timeline data.
:::
