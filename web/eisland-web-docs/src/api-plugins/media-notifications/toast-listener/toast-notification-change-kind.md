---
watermark: true
title: ToastNotificationChangeKind
icon: fa6-solid:list
---

# ToastNotificationChangeKind

:::info
Type of change in a toast notification event.
:::

## Values

| Value | Description |
|-------|-------------|
| `"added"` | A new notification was added |
| `"removed"` | A notification was removed |
| `"unknown"` | Change type could not be determined |

:::note
This value is part of the [ToastNotificationChangedEvent](toast-notification-changed-event.md) passed to your listener callback.
:::

## Example

```typescript
import { startListening } from '@eisland/windows-toast-listener';

startListening((event) => {
  if (event.kind === 'added') {
    console.log(`New notification #${event.notificationId}`);
  } else if (event.kind === 'removed') {
    console.log(`Notification #${event.notificationId} removed`);
  }
});
```
