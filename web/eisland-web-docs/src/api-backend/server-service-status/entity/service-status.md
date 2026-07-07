---
title: ServiceStatus
---

# ServiceStatus

:::info
Serializable entity representing the availability status of an API endpoint.
:::

## Overview

`ServiceStatus` maps to the `service_status` table. Each row records whether a named API endpoint is currently available, along with a human-readable message and optional remark.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `apiName` | `String` | Unique API endpoint name |
| `status` | `Boolean` | Availability flag (`true` = available, `false` = unavailable) |
| `message` | `String` | Human-readable status description |
| `remark` | `String` | Additional notes or context |
| `updatedAt` | `LocalDateTime` | Last update timestamp |

:::tip
The entity implements `Serializable` for Spring Cache compatibility.
:::
