---
watermark: true
title: ToastNotificationChangedEvent
icon: fa6-solid:table
---

# ToastNotificationChangedEvent

:::info
Event data passed to the callback registered with startListening().
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `kind` | [ToastNotificationChangeKind](toast-notification-change-kind.md) | Type of change |
| `notificationId` | `number` | ID of the affected notification |

:::info
This event is passed to the callback registered with [startListening()](start-listening.md).
:::
