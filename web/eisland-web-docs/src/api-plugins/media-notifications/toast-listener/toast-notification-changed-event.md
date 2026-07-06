---
watermark: true
title: ToastNotificationChangedEvent
icon: fa6-solid:table
---

# ToastNotificationChangedEvent

:::info
`ToastNotificationChangedEvent` is the event data interface passed to the callback registered with [startListening()](start-listening.md). It describes a single change — a notification being added or removed — in the Windows toast notification stream.
:::

## Interface Introduction

When you call [startListening()](start-listening.md) and supply a callback, the system invokes that callback each time a toast notification appears or disappears. Each invocation delivers a `ToastNotificationChangedEvent` object so your code can identify what changed and react accordingly.

This interface is purely a data carrier; you do not instantiate it yourself. It arrives from the native listener layer.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `kind` | [ToastNotificationChangeKind](toast-notification-change-kind.md) | The type of change: `'added'` when a new notification appears, `'removed'` when one is dismissed, or `'unknown'` for unclassified events. |
| `notificationId` | `number` | A unique numeric identifier for the affected notification. Use this ID to correlate with snapshot data from [getNotifications()](get-notifications.md). |

:::note
The `notificationId` is assigned by the Windows notification subsystem. It is only meaningful within the current listener session — do not persist it across app restarts.
:::

## Usage

The `ToastNotificationChangedEvent` is delivered inside the callback you pass to [startListening()](start-listening.md). A typical workflow:

1. Call [requestAccess()](request-access.md) and verify the user has granted notification access.
2. Call [startListening()](start-listening.md) with a callback that receives `ToastNotificationChangedEvent`.
3. Inside the callback, branch on `event.kind` to handle additions and removals.
4. Optionally call [getNotifications()](get-notifications.md) to obtain a full snapshot with rich data (title, body, app name, etc.) and match by `event.notificationId`.
5. Call [stopListening()](stop-listening.md) when you no longer need events.

:::tip
If you need the full notification content (title, body, app display name), do not try to extract it from this event. Call [getNotifications()](get-notifications.md) and look up the entry whose `id` matches `event.notificationId`.
:::

:::tip
Debounce or throttle your callback logic if you expect a burst of notifications (e.g. a chat application receiving many messages at once). The native listener fires synchronously for each event.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import {
  requestAccess,
  startListening,
  stopListening,
  getNotifications,
  ToastNotificationChangedEvent,
  ToastNotificationSnapshot,
} from '@eisland/windows-toast-listener';

// Step 1: Request permission to read toast notifications
const status = requestAccess();
if (status !== 'allowed') {
  console.error('Notification access denied:', status);
  process.exit(1);
}

// Step 2: Start listening for notification changes
const started = startListening((event: ToastNotificationChangedEvent) => {
  // Branch on the type of change
  if (event.kind === 'added') {
    // A new notification appeared — fetch full details
    const snapshots: ToastNotificationSnapshot[] = getNotifications();
    const match = snapshots.find((n) => n.id === event.notificationId);
    if (match) {
      console.log(`New notification from ${match.appDisplayName}: ${match.title}`);
    }
  } else if (event.kind === 'removed') {
    // A notification was dismissed
    console.log(`Notification dismissed — ID ${event.notificationId}`);
  }
});

if (!started) {
  console.error('Failed to start listener');
}

// Step 3: Stop listening when done (e.g. on app shutdown)
// stopListening();
```

@tab JavaScript

```js
const {
  requestAccess,
  startListening,
  stopListening,
  getNotifications,
} = require('@eisland/windows-toast-listener');

// Step 1: Request permission to read toast notifications
const status = requestAccess();
if (status !== 'allowed') {
  console.error('Notification access denied:', status);
  process.exit(1);
}

// Step 2: Start listening for notification changes
const started = startListening((event) => {
  // Branch on the type of change
  if (event.kind === 'added') {
    // A new notification appeared — fetch full details
    const snapshots = getNotifications();
    const match = snapshots.find((n) => n.id === event.notificationId);
    if (match) {
      console.log(`New notification from ${match.appDisplayName}: ${match.title}`);
    }
  } else if (event.kind === 'removed') {
    // A notification was dismissed
    console.log(`Notification dismissed — ID ${event.notificationId}`);
  }
});

if (!started) {
  console.error('Failed to start listener');
}

// Step 3: Stop listening when done (e.g. on app shutdown)
// stopListening();
```

:::

## Notes

:::note
The callback is invoked on the native event loop thread. Avoid performing heavy synchronous work inside it — offload processing to a queue or use `setTimeout`/`setImmediate` if needed.
:::

:::note
If [isSuppressionEnabled()](is-suppression-enabled.md) returns `true`, toast popups are suppressed at the OS level, but the listener still receives `'added'` and `'removed'` events. Suppression only hides the visual toast, not the event stream.
:::

:::tip
Call [isListening()](is-listening.md) before starting a second listener. Calling [startListening()](start-listening.md) while already listening returns `false` and does not replace the existing callback. Always [stopListening()](stop-listening.md) first if you need to swap callbacks.
:::

## Danger Avoidance

:::danger
**Never forget to call [stopListening()](stop-listening.md).** Each active listener holds a native handle to the Windows notification subsystem. Failing to stop the listener when it is no longer needed leaks that handle and keeps your process tethered to the OS event source. Always clean up on app exit or when the feature is disabled.
:::

:::danger
**Do not assume `notificationId` is globally unique across sessions.** The ID is assigned per listener session by Windows. Persisting it to disk and referencing it in a future session will produce incorrect matches or no match at all. Always use [getNotifications()](get-notifications.md) for fresh data.
:::

:::danger
**Notification access is a user-granted permission.** If [requestAccess()](request-access.md) returns anything other than `'allowed'`, the listener will not deliver events. Never call [startListening()](start-listening.md) without first verifying access status — the function may appear to succeed but the callback will never fire.
:::
