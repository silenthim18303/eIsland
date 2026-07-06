---
watermark: true
title: getNotifications
icon: fa6-solid:code
---

# getNotifications

:::info Introduction
`getNotifications` is a synchronous function that returns all current toast notifications visible in the Windows Action Center as an array of [ToastNotificationSnapshot](toast-notification-snapshot.md) objects. Use this function to query the present notification state without setting up a listener.
:::

## Signature

```typescript
function getNotifications(): ToastNotificationSnapshot[]
```

## Usage

Call `getNotifications` when you need a one-time snapshot of all active toast notifications. This is useful for displaying notification counts, building a notification inbox UI, or inspecting which apps have pending notifications.

:::tip
If you need real-time updates as notifications arrive or disappear, use [startListening](start-listening.md) with a callback instead of polling `getNotifications`.
:::

:::note
This function requires prior access permission. Call [requestAccess](request-access.md) before using `getNotifications`. If access has not been granted, the function may return an empty array.
:::

:::warning
When notification suppression is enabled via [enableSuppression](enable-suppression.md), this function always returns an empty array. Call [isSuppressionEnabled](is-suppression-enabled.md) to check the current state if you get unexpected results.
:::

## Return Value

Returns an array of [ToastNotificationSnapshot](toast-notification-snapshot.md) objects. Each snapshot captures the notification's ID, originating app, display content, and creation timestamp.

If no notifications are present (or suppression is enabled), returns an empty array `[]`.

## Example

::: code-tabs

@tab TypeScript

```ts
import { getNotifications, requestAccess } from '@eisland/windows-toast-listener';

// Ensure we have permission to read notifications
const status = requestAccess();
if (status !== 'allowed') {
  console.log('Notification access denied');
} else {
  // Query all current toast notifications
  const notifications = getNotifications();
  console.log(`${notifications.length} notification(s) found`);

  // Iterate and display each notification
  notifications.forEach((n) => {
    console.log(`  [${n.appDisplayName}] ${n.title}: ${n.body}`);
  });
}
```

@tab JavaScript

```js
const { getNotifications, requestAccess } = require('@eisland/windows-toast-listener');

// Ensure we have permission to read notifications
const status = requestAccess();
if (status !== 'allowed') {
  console.log('Notification access denied');
} else {
  // Query all current toast notifications
  const notifications = getNotifications();
  console.log(`${notifications.length} notification(s) found`);

  // Iterate and display each notification
  notifications.forEach((n) => {
    console.log(`  [${n.appDisplayName}] ${n.title}: ${n.body}`);
  });
}
```

:::

## Notes

:::note
The `texts` field in each snapshot is a flattened array of all text content (title and body included), which is useful when you need to search across all text without caring about the structure.
:::

:::note
The `createdAt` field is a Unix timestamp in milliseconds. Use `new Date(n.createdAt)` to convert it to a JavaScript `Date` object.
:::

:::tip
The returned array is a copy of the current state. Modifications to the returned array do not affect the internal notification store.
:::

## Danger Avoidance

:::danger
Do not call `getNotifications` in a tight polling loop (e.g. `setInterval` with small intervals). Each call queries the Windows notification subsystem synchronously. Excessive polling can degrade system performance. Use [startListening](start-listening.md) for event-driven monitoring instead.
:::

:::danger
Do not assume `getNotifications` returns persistent data. Notifications can be dismissed by the user or the system at any time. The snapshot returned reflects the moment of the call; subsequent calls may return different results.
:::
