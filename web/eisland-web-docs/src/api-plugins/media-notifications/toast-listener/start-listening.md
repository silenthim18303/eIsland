---
watermark: true
title: startListening
icon: fa6-solid:code
---

# startListening

:::info Introduction
`startListening` registers a callback that is invoked every time a Windows toast notification is added or removed. It starts a background poll thread that monitors the system notification queue and delivers changes through a thread-safe bridge to your Node.js application.
:::

## Signature

```typescript
function startListening(callback: ToastNotificationChangedCallback): boolean
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | [ToastNotificationChangedCallback](toast-notification-changed-event.md) | Function called on each notification change event |

**Return value:** `boolean` — `true` if listening started successfully, `false` if a listener is already active.

## Usage

`startListening` is the entry point for real-time notification monitoring. Once called, the library spawns a background thread that polls the Windows notification system and invokes your callback whenever a notification is added or removed.

:::tip
Before calling `startListening`, always verify that notification access is granted using [requestAccess](request-access.md) or [getAccessStatus](get-access-status.md). Starting the listener without access will succeed but no events will be delivered.
:::

Typical workflow:

1. Call [requestAccess](request-access.md) to ensure the app has permission to read notifications.
2. Call `startListening` with your event handler callback.
3. Inside the callback, use [getNotifications](get-notifications.md) to fetch the latest snapshot when a notification is added.
4. Call [stopListening](stop-listening.md) when monitoring is no longer needed.

:::note
Only one listener can be active at a time. Calling `startListening` while already listening returns `false` and does not replace the existing callback. Call [stopListening](stop-listening.md) first if you need to restart with a new callback.
:::

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | [ToastNotificationChangedCallback](toast-notification-changed-event.md) | A function that receives a [ToastNotificationChangedEvent](toast-notification-changed-event.md) object each time a notification is added or removed |

:::note
The callback is invoked from a background poll thread via a thread-safe bridge. Avoid performing heavy synchronous work inside the callback to prevent blocking the event loop.
:::

## Return Value

Returns `true` if the listener started successfully. Returns `false` if a listener is already active (only one listener is permitted at a time).

:::warning
If `startListening` returns `false`, no listener is registered and your callback will not be called. Always check the return value before assuming the listener is active.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { startListening, getNotifications, requestAccess, stopListening } from '@eisland/windows-toast-listener';
import type { ToastNotificationChangedEvent } from '@eisland/windows-toast-listener';

// Request permission to read system notifications
const access = requestAccess();

// Verify access was granted before proceeding
if (access !== 'allowed') {
  console.error(`Notification access status: ${access}`);
  process.exit(1);
}

// Define the callback that handles notification changes
const onNotificationChanged = (event: ToastNotificationChangedEvent): void => {
  // Only process newly added notifications
  if (event.kind === 'added') {
    // Fetch all current notifications to find the one that triggered this event
    const notifs = getNotifications();
    const latest = notifs.find(n => n.id === event.notificationId);
    if (latest) {
      // Display the notification title and body
      console.log(`New notification: ${latest.title} - ${latest.body}`);
    }
  }
};

// Start listening for notification changes
const started = startListening(onNotificationChanged);

// Verify the listener was registered
console.log(`Listener active: ${started}`);

// Stop listening when done (e.g., on app shutdown)
// stopListening();
```

@tab JavaScript

```js
const { startListening, getNotifications, requestAccess, stopListening } = require('@eisland/windows-toast-listener');

// Request permission to read system notifications
const access = requestAccess();

// Verify access was granted before proceeding
if (access !== 'allowed') {
  console.error(`Notification access status: ${access}`);
  process.exit(1);
}

// Define the callback that handles notification changes
const onNotificationChanged = (event) => {
  // Only process newly added notifications
  if (event.kind === 'added') {
    // Fetch all current notifications to find the one that triggered this event
    const notifs = getNotifications();
    const latest = notifs.find(n => n.id === event.notificationId);
    if (latest) {
      // Display the notification title and body
      console.log(`New notification: ${latest.title} - ${latest.body}`);
    }
  }
};

// Start listening for notification changes
const started = startListening(onNotificationChanged);

// Verify the listener was registered
console.log(`Listener active: ${started}`);

// Stop listening when done (e.g., on app shutdown)
// stopListening();
```

:::

## Notes

:::note
The callback is invoked from a background poll thread via a thread-safe bridge. The polling interval is managed internally by the native addon and is not configurable through the public API.
:::

:::tip
If you only need to check the current notification state without real-time monitoring, use [getNotifications](get-notifications.md) directly instead of starting a listener. This avoids spawning an unnecessary background thread.
:::

:::note
The `notificationId` in the [ToastNotificationChangedEvent](toast-notification-changed-event.md) corresponds to the `id` field in the [ToastNotificationSnapshot](toast-notification-snapshot.md) objects returned by [getNotifications](get-notifications.md). Use it to look up the full notification details.
:::

## Danger Avoidance

:::danger
Always call [stopListening](stop-listening.md) when your application no longer needs notification monitoring. Failing to stop the listener leaks a background thread that continues polling indefinitely, consuming CPU and memory resources.
:::

:::danger
Do not call `startListening` without first calling [requestAccess](request-access.md). Without notification access permission, the background thread will run but will never receive any events, silently wasting resources. Always check the access status before starting the listener.
:::
