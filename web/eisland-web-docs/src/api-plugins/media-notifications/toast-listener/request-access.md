---
watermark: true
title: requestAccess
icon: fa6-solid:code
---

# requestAccess

:::info
`requestAccess()` requests permission from the Windows operating system to listen for toast notifications from other applications. This is a synchronous, blocking call that may trigger a system permission dialog shown to the user. It returns a [ToastAccessStatus](toast-access-status.md) indicating whether access was granted, denied, or left in an unknown state.
:::

## Signature

```typescript
function requestAccess(): ToastAccessStatus
```

## Usage

`requestAccess()` should be called early in your application lifecycle, before attempting to call [startListening()](start-listening.md). It is the entry point for acquiring the OS-level permission required to observe toast notifications from other apps.

:::tip
Always call [getAccessStatus()](get-access-status.md) first to check whether access is already granted before invoking `requestAccess()`. This avoids re-showing the system permission dialog unnecessarily on subsequent app launches.
:::

:::note
This function is synchronous and blocks the calling thread until the user responds to the permission dialog or the system resolves the request. On systems where the permission is already granted (or denied), it returns immediately without showing a dialog.
:::

Typical workflow:

1. Call [getAccessStatus()](get-access-status.md) to check the current state.
2. If the status is not `'allowed'`, call `requestAccess()`.
3. Inspect the returned status to decide whether to proceed with [startListening()](start-listening.md).

## Return Value

Returns a [ToastAccessStatus](toast-access-status.md) — one of `'allowed'`, `'denied'`, `'unspecified'`, or `'unknown'`.

:::warning
A return value of `'denied'` does not necessarily mean the user actively refused. Some system configurations or group policies may deny access silently. If you receive `'denied'` or `'unspecified'`, do not assume the user was prompted — consider providing a fallback experience in your application.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { requestAccess, getAccessStatus, startListening } from '@eisland/windows-toast-listener';

// Check if access is already granted to avoid showing the dialog again
const currentStatus = getAccessStatus();

if (currentStatus !== 'allowed') {
  // Request permission — this may show a system dialog to the user
  const status = requestAccess();

  if (status === 'allowed') {
    console.log('Access granted');
    // Now safe to start listening for notifications
    startListening((event) => {
      console.log(`Notification ${event.kind}: id=${event.notificationId}`);
    });
  } else {
    // Access was not granted — handle accordingly
    console.log(`Access not granted: ${status}`);
  }
} else {
  // Access was already granted from a previous session
  console.log('Access already granted, starting listener');
  startListening((event) => {
    console.log(`Notification ${event.kind}: id=${event.notificationId}`);
  });
}
```

@tab JavaScript

```js
const { requestAccess, getAccessStatus, startListening } = require('@eisland/windows-toast-listener');

// Check if access is already granted to avoid showing the dialog again
const currentStatus = getAccessStatus();

if (currentStatus !== 'allowed') {
  // Request permission — this may show a system dialog to the user
  const status = requestAccess();

  if (status === 'allowed') {
    console.log('Access granted');
    // Now safe to start listening for notifications
    startListening((event) => {
      console.log(`Notification ${event.kind}: id=${event.notificationId}`);
    });
  } else {
    // Access was not granted — handle accordingly
    console.log(`Access not granted: ${status}`);
  }
} else {
  // Access was already granted from a previous session
  console.log('Access already granted, starting listener');
  startListening((event) => {
    console.log(`Notification ${event.kind}: id=${event.notificationId}`);
  });
}
```

:::

## Notes

:::note
The permission granted by this API is scoped to the current Windows user session. Access status may persist across application restarts depending on the OS version and user configuration, but you should always verify with [getAccessStatus()](get-access-status.md) rather than assuming persistence.
:::

:::note
On Windows systems with group policy restrictions or managed enterprise environments, this call may return `'denied'` without ever showing a dialog to the user. There is no programmatic way to override this — the user must adjust their system settings manually.
:::

:::tip
If your application only needs to check whether access is available without prompting the user, use [getAccessStatus()](get-access-status.md) instead. Reserve `requestAccess()` for the case where you are ready to actively prompt the user.
:::

## Danger Avoidance

:::danger
Do not call `requestAccess()` in a tight loop or on every application startup without first checking [getAccessStatus()](get-access-status.md). Each call may trigger a system dialog, and repeatedly prompting the user can lead to a poor experience or cause the OS to suppress future prompts entirely.
:::

:::danger
Do not assume that a return value of `'allowed'` means you can immediately access notification content. You must still call [startListening()](start-listening.md) and handle the callback to actually receive notification events. Calling [getNotifications()](get-notifications.md) without an active listener will return an empty array.
:::
