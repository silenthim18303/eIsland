---
watermark: true
title: ToastNotificationChangeKind
icon: fa6-solid:list
---

# ToastNotificationChangeKind

:::info
`ToastNotificationChangeKind` is a string literal union type that describes the kind of change reported by a toast notification event. It indicates whether a notification was added, removed, or could not be classified. You encounter this type as the `kind` field on every [ToastNotificationChangedEvent](toast-notification-changed-event.md) delivered to your listener callback.
:::

## Interface Introduction

`ToastNotificationChangeKind` is defined as a TypeScript string literal union:

```typescript
type ToastNotificationChangeKind = 'added' | 'removed' | 'unknown';
```

This type is not something you construct yourself. It is provided by the system on each [ToastNotificationChangedEvent](toast-notification-changed-event.md) that arrives through the callback registered with [startListening](start-listening.md). Use it to determine what action triggered the event and respond accordingly.

## Values

| Value | Description |
|-------|-------------|
| `"added"` | A new toast notification was posted by an application. |
| `"removed"` | An existing toast notification was dismissed or expired. |
| `"unknown"` | The change type could not be determined by the listener. |

:::note
The `"unknown"` value can appear when the underlying Windows notification subsystem reports a change that does not map cleanly to add or remove. Treat it as a fallback and log it for diagnostics rather than ignoring it.
:::

## Usage

The typical workflow for using `ToastNotificationChangeKind` is:

1. Call [startListening](start-listening.md) with a callback to begin receiving notification events.
2. Inside the callback, switch on `event.kind` to branch your logic for added, removed, or unknown events.
3. Use `event.notificationId` together with [getNotifications](get-notifications.md) if you need the full notification snapshot.

:::tip
If you only care about new notifications, filter on `event.kind === 'added'` and ignore the rest. This keeps your handler lean and avoids unnecessary work.
:::

:::tip
When processing `"removed"` events, you can use the `event.notificationId` to clean up any per-notification state your application maintains.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import {
  startListening,
  ToastNotificationChangedEvent,
  ToastNotificationChangeKind,
} from '@eisland/windows-toast-listener';

// Register a listener callback that receives every notification change
startListening((event: ToastNotificationChangedEvent) => {
  // Extract the change kind from the event
  const kind: ToastNotificationChangeKind = event.kind;

  // Handle each possible change kind
  if (kind === 'added') {
    // A new notification appeared — log its ID
    console.log(`Notification added: #${event.notificationId}`);
  } else if (kind === 'removed') {
    // A notification was dismissed or expired
    console.log(`Notification removed: #${event.notificationId}`);
  } else {
    // The change kind could not be determined
    console.warn(`Unknown change for notification #${event.notificationId}`);
  }
});
```

@tab JavaScript

```javascript
const { startListening } = require('@eisland/windows-toast-listener');

// Register a listener callback that receives every notification change
startListening((event) => {
  // Extract the change kind from the event
  const kind = event.kind;

  // Handle each possible change kind
  if (kind === 'added') {
    // A new notification appeared — log its ID
    console.log(`Notification added: #${event.notificationId}`);
  } else if (kind === 'removed') {
    // A notification was dismissed or expired
    console.log(`Notification removed: #${event.notificationId}`);
  } else {
    // The change kind could not be determined
    console.warn(`Unknown change for notification #${event.notificationId}`);
  }
});
```

:::

## Notes

:::note
`ToastNotificationChangeKind` is a read-only value supplied by the listener subsystem. You never assign or construct it yourself; it is always part of the [ToastNotificationChangedEvent](toast-notification-changed-event.md) delivered to your callback.
:::

:::note
The `"unknown"` kind is a valid and expected value, not an error. The underlying Windows toast notification API can report change types that do not map to a simple add or remove. Always handle it explicitly rather than assuming only `"added"` and `"removed"` will occur.
:::

:::tip
When building UI that reacts to notification changes, you can use this kind to animate elements in (on `"added"`) or out (on `"removed"`), providing a responsive feel to your notification dashboard.
:::

## Danger Avoidance

:::danger
Do not ignore the `"unknown"` kind. If your callback only handles `"added"` and `"removed"`, the `"unknown"` case silently falls through and your application will have inconsistent state. Always include an explicit fallback branch.
:::

:::danger
Never call [stopListening](stop-listening.md) from inside the callback based on a specific `ToastNotificationChangeKind` value without careful consideration. Stopping the listener mid-callback can cause race conditions if the system queues additional events. If you need to stop listening, do so after the callback returns, for example by scheduling it with `setTimeout` or a flag check on the next tick.
:::
