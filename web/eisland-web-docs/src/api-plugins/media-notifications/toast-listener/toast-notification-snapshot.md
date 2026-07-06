---
watermark: true
title: ToastNotificationSnapshot
icon: fa6-solid:table
---

# ToastNotificationSnapshot

:::info
`ToastNotificationSnapshot` is an interface representing a frozen snapshot of a single Windows toast notification. It is the element type returned by `getNotifications()` and contains all relevant metadata — source app, title, body text, and creation timestamp — captured at the moment the notification was received.
:::

## Interface Introduction

You encounter `ToastNotificationSnapshot` whenever you query the current notification list via `getNotifications()`. Each entry represents one toast notification that the listener has captured. The snapshot is immutable once created; it reflects the notification state at capture time and does not update if the original notification changes on the system.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `number` | Unique numeric identifier assigned to this notification by the listener |
| `appUserModelId` | `string` | Application User Model ID of the source app (e.g. `Microsoft.WindowsTerminal_8wekyb3d8bbwe!App`) |
| `appDisplayName` | `string` | Human-readable display name of the source application |
| `title` | `string` | Primary title text of the toast notification |
| `body` | `string` | Main body text of the toast notification |
| `texts` | `string[]` | All text fields from the notification flattened into a single array for convenience |
| `createdAt` | `number` | Unix epoch timestamp in milliseconds indicating when the notification was captured |

:::note
The `createdAt` timestamp uses Unix epoch milliseconds, compatible with `new Date(createdAt)`. The `texts` array includes `title`, `body`, and any additional text fields, flattened for convenience — useful for full-text search across notification content.
:::

:::tip
Use `appUserModelId` for reliable app identification across sessions, as `appDisplayName` may vary depending on the system locale or app version.
:::

## Related Types

### ToastAccessStatus

```ts
type ToastAccessStatus = 'unspecified' | 'allowed' | 'denied' | 'unknown';
```

Indicates the current user permission status for reading toast notifications. Returned by `requestAccess()` and `getAccessStatus()`.

### ToastNotificationChangeKind

```ts
type ToastNotificationChangeKind = 'added' | 'removed' | 'unknown';
```

Describes the type of change that occurred to a notification in the listener.

### ToastNotificationChangedEvent

```ts
interface ToastNotificationChangedEvent {
  kind: ToastNotificationChangeKind;
  notificationId: number;
}
```

Event object passed to the callback registered with `startListening()`. The `notificationId` corresponds to the `id` field of a `ToastNotificationSnapshot`.

## Related Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getNotifications` | `() => ToastNotificationSnapshot[]` | Returns all currently captured notification snapshots |
| `requestAccess` | `() => ToastAccessStatus` | Requests user permission to read notifications |
| `getAccessStatus` | `() => ToastAccessStatus` | Queries the current access permission status |
| `startListening` | `(callback: (event: ToastNotificationChangedEvent) => void) => boolean` | Starts the notification listener with a change callback |
| `stopListening` | `() => boolean` | Stops the active notification listener |
| `isListening` | `() => boolean` | Returns whether the listener is currently active |
| `enableSuppression` | `() => boolean` | Enables toast notification suppression (hides toasts from Action Center) |
| `disableSuppression` | `() => boolean` | Disables toast notification suppression |
| `isSuppressionEnabled` | `() => boolean` | Returns whether suppression is currently enabled |

## Usage

The typical workflow is:

1. Call `requestAccess()` to obtain user permission.
2. Call `startListening()` with a callback to begin capturing notifications.
3. Use `getNotifications()` to retrieve all captured `ToastNotificationSnapshot` entries.
4. Call `stopListening()` when done.

:::tip
Call `getNotifications()` inside the `startListening` callback to always work with the latest snapshot list. The callback fires whenever a notification is added or removed.
:::

:::note
`getNotifications()` returns a snapshot of the current list at the moment of the call. If you need to react to changes in real time, use the `startListening` callback instead of polling.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import {
  requestAccess,
  getNotifications,
  startListening,
  stopListening,
} from '@eisland/windows-toast-listener';
import type {
  ToastAccessStatus,
  ToastNotificationSnapshot,
  ToastNotificationChangedEvent,
} from '@eisland/windows-toast-listener';

// Step 1: Request permission to read toast notifications
const status: ToastAccessStatus = requestAccess();
if (status !== 'allowed') {
  console.error(`Access denied: ${status}`);
  process.exit(1);
}

// Step 2: Start listening for notification changes
const started: boolean = startListening((event: ToastNotificationChangedEvent) => {
  // The event tells us what kind of change occurred
  console.log(`Notification ${event.kind}: ID ${event.notificationId}`);

  // Fetch the full snapshot list after each change
  const all: ToastNotificationSnapshot[] = getNotifications();
  console.log(`Total notifications: ${all.length}`);
});

if (!started) {
  console.error('Failed to start listener');
  process.exit(1);
}

// Step 3: Read all captured notifications
const notifications: ToastNotificationSnapshot[] = getNotifications();
notifications.forEach((n: ToastNotificationSnapshot) => {
  // Format the creation time for display
  const time: string = new Date(n.createdAt).toLocaleTimeString();
  console.log(`[${time}] ${n.appDisplayName}: ${n.title}`);
  console.log(`  ${n.body}`);
});

// Step 4: Stop listening when finished
stopListening();
```

@tab JavaScript

```js
const {
  requestAccess,
  getNotifications,
  startListening,
  stopListening,
} = require('@eisland/windows-toast-listener');

// Step 1: Request permission to read toast notifications
const status = requestAccess();
if (status !== 'allowed') {
  console.error(`Access denied: ${status}`);
  process.exit(1);
}

// Step 2: Start listening for notification changes
const started = startListening((event) => {
  // The event tells us what kind of change occurred
  console.log(`Notification ${event.kind}: ID ${event.notificationId}`);

  // Fetch the full snapshot list after each change
  const all = getNotifications();
  console.log(`Total notifications: ${all.length}`);
});

if (!started) {
  console.error('Failed to start listener');
  process.exit(1);
}

// Step 3: Read all captured notifications
const notifications = getNotifications();
notifications.forEach((n) => {
  // Format the creation time for display
  const time = new Date(n.createdAt).toLocaleTimeString();
  console.log(`[${time}] ${n.appDisplayName}: ${n.title}`);
  console.log(`  ${n.body}`);
});

// Step 4: Stop listening when finished
stopListening();
```

:::

## Notes

:::note
The `id` field is assigned by the listener internally and is unique within a single listening session. It does not correspond to any Windows system notification identifier and will reset if the listener is restarted.
:::

:::note
The `texts` array provides a flattened view of all text content in the notification. This includes `title`, `body`, and any additional text fields that Windows provides. The order of elements in the array follows the internal field order of the toast XML payload.
:::

:::tip
If you only need to display the most recent notifications, call `getNotifications()` and slice the result. The array is ordered chronologically by capture time.
:::

## Danger Avoidance

:::danger
Always call `stopListening()` when you are done. Failing to stop the listener leaks the native system resource handle, which can prevent other applications from properly managing notifications and may cause the process to hang on exit.
:::

:::danger
Do not call `startListening()` without first calling `requestAccess()` and verifying the status is `'allowed'`. On Windows, reading toast notifications requires explicit user consent. Starting the listener without permission will fail silently or return `false`, leaving you with an empty notification list.
:::

:::danger
Do not enable suppression (`enableSuppression()`) without understanding the side effect: it hides toast banners from the Windows Action Center. Users will not see any toast notifications while suppression is active. Always pair `enableSuppression()` with a corresponding `disableSuppression()` call when the suppression window ends.
:::
