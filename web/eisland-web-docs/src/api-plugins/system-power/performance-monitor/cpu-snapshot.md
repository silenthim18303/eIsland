---
watermark: true
title: CpuSnapshot
icon: fa6-solid:table
---

# CpuSnapshot

:::info
CPU usage data returned by getCpu().
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `usagePercent` | `number` | CPU usage percentage (0–100) |
| `hasBaseline` | `boolean` | Whether a baseline measurement exists (first call establishes baseline) |

:::warning
The first call to `getCpu()` establishes a baseline and may return `hasBaseline: false` with an unreliable `usagePercent`. Call it twice with a short interval for accurate readings.
:::