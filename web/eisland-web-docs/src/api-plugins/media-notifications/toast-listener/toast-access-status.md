---
watermark: true
title: ToastAccessStatus
icon: fa6-solid:list
---

# ToastAccessStatus

:::info
`ToastAccessStatus` is a string literal union type that represents the current permission state of the Windows notification listener. Every function that reads or requests notification access — such as [getAccessStatus()](get-access-status.md) and [requestAccess()](request-access.md) — returns a value of this type. You must check it before attempting to call [startListening()](start-listening.md).
:::

## Interface Introduction

`ToastAccessStatus` is not an object or class — it is a union of four string literals:

```typescript
type ToastAccessStatus = 'unspecified' | 'allowed' | 'denied' | 'unknown';
```

You will encounter this type as the return value of [requestAccess()](request-access.md) and [getAccessStatus()](get-access-status.md). It tells you whether the current process has permission to receive Windows toast notifications through the listener.

## Usage

The typical workflow is to query the access status first, request permission if needed, and only then start listening.

:::tip Recommended Access Pattern
Always check `ToastAccessStatus` before calling [startListening()](start-listening.md). If the status is `'unspecified'`, call [requestAccess()](request-access.md) to prompt the user. If the status is `'denied'`, the listener cannot function and you should inform the user accordingly.
:::

:::note Status Transitions
The status transitions from `'unspecified'` to `'allowed'` or `'denied'` after [requestAccess()](request-access.md) is called. Once the user has made a choice, subsequent calls to [requestAccess()](request-access.md) will return the same result without prompting again (unless the user revokes permission through Windows Settings).
:::

## Values

| Value | Description |
|-------|-------------|
| `"unspecified"` | Access status has not yet been determined. This is the initial state before [requestAccess()](request-access.md) is called. |
| `"allowed"` | Access is granted — the listener can read toast notifications. You may proceed to call [startListening()](start-listening.md). |
| `"denied"` | Access is denied by the user or by a system/group policy. The listener cannot function in this state. |
| `"unknown"` | The system was unable to determine the access status. Treat this as a failure case. |

:::note `"unknown"` vs `"denied"`
The `"unknown"` status indicates an unexpected system failure when querying permission, not an explicit user rejection. If you receive `"unknown"`, consider retrying [requestAccess()](request-access.md) or logging a diagnostic message — the underlying Windows API may have returned an unrecognized HRESULT.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import { getAccessStatus, requestAccess, startListening, ToastAccessStatus } from '@eisland/windows-toast-listener';

// Query current access status without prompting the user
let status: ToastAccessStatus = getAccessStatus();

// If status is 'unspecified', the user has not been prompted yet
if (status === 'unspecified') {
  // Prompt the user for notification access permission
  status = requestAccess();
}

// Only start listening if access is allowed
if (status === 'allowed') {
  // Register a callback for notification changes and start listening
  const started = startListening((event) => {
    console.log(`Notification ${event.kind}: ID ${event.notificationId}`);
  });
  console.log('Listening started:', started);
} else {
  // Log the denial reason — could be 'denied' or 'unknown'
  console.log(`Cannot listen — access status: ${status}`);
}
```

@tab JavaScript

```javascript
const { getAccessStatus, requestAccess, startListening } = require('@eisland/windows-toast-listener');

// Query current access status without prompting the user
let status = getAccessStatus();

// If status is 'unspecified', the user has not been prompted yet
if (status === 'unspecified') {
  // Prompt the user for notification access permission
  status = requestAccess();
}

// Only start listening if access is allowed
if (status === 'allowed') {
  // Register a callback for notification changes and start listening
  const started = startListening((event) => {
    console.log(`Notification ${event.kind}: ID ${event.notificationId}`);
  });
  console.log('Listening started:', started);
} else {
  // Log the denial reason — could be 'denied' or 'unknown'
  console.log(`Cannot listen — access status: ${status}`);
}
```

:::

## Notes

:::tip Checking Before Listening
Call [getAccessStatus()](get-access-status.md) (no side effects) before [requestAccess()](request-access.md) (may prompt the user). If [getAccessStatus()](get-access-status.md) already returns `"allowed"`, you can skip the prompt entirely.
:::

:::note Windows Version Dependency
Toast notification access requires Windows 10 build 17763 (October 2018 Update) or later. On older builds, the status may return `"unknown"` because the underlying Windows API is unavailable.
:::

:::tip Combining with Suppression
If you plan to use [enableSuppression()](enable-suppression.md) to hide notifications from the Windows Action Center while your app reads them, you still need `"allowed"` status first. Suppression is an additional layer on top of access permission.
:::

## Danger Avoidance

:::danger Do Not Skip Access Checks
Calling [startListening()](start-listening.md) without first verifying `ToastAccessStatus === "allowed"` will silently fail — the listener will not register, and [isListening()](is-listening.md) will return `false`. Always gate your listener startup on the access status.
:::

:::danger Do Not Assume Status Persists Across Sessions
The access status is determined at runtime by the Windows notification subsystem. A user can revoke notification access through **Windows Settings > Privacy & security > Notifications** at any time. If your application caches the status and skips re-checking, it may attempt to listen without permission after a revoke, resulting in silent failures. Re-check [getAccessStatus()](get-access-status.md) on each application startup.
:::
