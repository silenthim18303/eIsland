---
watermark: true
title: startListening
icon: fa6-solid:code
---

# startListening

:::info
Starts listening for notification changes. The callback is invoked from a background poll thread via a thread-safe bridge.
:::

## Signature

```typescript
function startListening(callback: ToastNotificationChangedCallback): boolean
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | [ToastNotificationChangedCallback](toast-notification-changed-event.md) | Function called on each notification change |

## Return Value

`true` if listening started, `false` if already listening.

```typescript
// Example return value
true
```

:::note
The callback is invoked from a background poll thread via a thread-safe bridge. Only one listener can be active at a time.
:::

## Example

```typescript
import { startListening, getNotifications, requestAccess } from '@eisland/windows-toast-listener';

// Ensure access is granted
if (requestAccess() !== 'allowed') {
  console.error('Notification access denied');
  process.exit(1);
}

const started = startListening((event) => {
  if (event.kind === 'added') {
    const notifs = getNotifications();
    const latest = notifs.find(n => n.id === event.notificationId);
    if (latest) {
      console.log(`🔔 ${latest.title}: ${latest.body}`);
    }
  }
});

console.log(`Listening: ${started}`);
```
