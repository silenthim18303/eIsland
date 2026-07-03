---
watermark: true
title: ToastNotificationSnapshot
icon: fa6-solid:table
---

# ToastNotificationSnapshot

:::info
Snapshot of a single toast notification.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique notification ID |
| `appUserModelId` | `string` | Source app identifier |
| `appDisplayName` | `string` | Display name of the source app |
| `title` | `string` | Notification title |
| `body` | `string` | Notification body text |
| `texts` | `string[]` | All text content as an array |
| `createdAt` | `number` | Creation timestamp (Unix ms) |

:::note
The `createdAt` timestamp uses Unix epoch milliseconds. The `texts` array contains all text fields flattened for convenience.
:::
