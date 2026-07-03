---
watermark: true
title: ProcessFailure
icon: fa6-solid:table
---

# ProcessFailure

:::info
Details about a single process termination failure.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `pid` | `number` | Process ID that failed to terminate |
| `name` | `string` | Process name |
| `errorCode` | `number` | Windows error code from the termination attempt |
