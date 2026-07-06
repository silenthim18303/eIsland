---
watermark: true
title: getAccessStatus
icon: fa6-solid:code
---

# getAccessStatus

:::info
Returns the current Windows notification listener access status without prompting the user. This is a non-blocking, read-only check — it never shows a permission dialog. Use it to inspect the current permission state before deciding whether to call [requestAccess()](request-access.md).
:::

## Signature

```typescript
function getAccessStatus(): ToastAccessStatus
```

## Usage

Call `getAccessStatus()` to inspect whether notification listener permission has already been granted, denied, or not yet determined. Unlike [requestAccess()](request-access.md), this function never blocks and never triggers a system dialog.

A typical workflow is: check with `getAccessStatus()` first, and only call [requestAccess()](request-access.md) if the status is `"unspecified"` or `"denied"`.

:::tip Recommended Pre-listener Check
Always call `getAccessStatus()` before [startListening()](start-listening.md) to avoid attempting to listen without permission. This avoids unnecessary system prompts when access is already granted.
:::

:::note Synchronous Nature
This function executes synchronously and returns immediately. It reads the cached permission state from the OS, so there is no async overhead or callback needed.
:::

## Return Value

Returns a [ToastAccessStatus](toast-access-status.md) string indicating the current permission state.

| Value | Meaning |
|-------|---------|
| `"unspecified"` | Permission has not been requested yet |
| `"allowed"` | Permission granted — notification listening is available |
| `"denied"` | Permission denied by the user or by system policy |
| `"unknown"` | Unable to determine the current access status |

```typescript
// Example return value
'allowed'
```

:::warning Handling `"unknown"` and `"denied"` Status
A return value of `"unknown"` may indicate a system-level issue (e.g., the notification listener service is unavailable). A `"denied"` status means the user or a group policy explicitly refused access. In both cases, retrying [requestAccess()](request-access.md) may not succeed — handle these gracefully.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getAccessStatus, requestAccess, startListening, ToastAccessStatus } from '@eisland/windows-toast-listener';

// Check current access status without prompting the user
const status: ToastAccessStatus = getAccessStatus();

if (status === 'allowed') {
  // Permission already granted — safe to start listening
  console.log('Access granted, starting listener...');
  startListening((event) => {
    console.log(`Notification ${event.kind}: id=${event.notificationId}`);
  });
} else if (status === 'unspecified') {
  // Never requested — prompt the user now
  const result = requestAccess();
  console.log(`Request result: ${result}`);
} else {
  // "denied" or "unknown" — cannot proceed
  console.log(`Cannot listen: access status is "${status}"`);
}
```

@tab JavaScript

```js
const { getAccessStatus, requestAccess, startListening } = require('@eisland/windows-toast-listener');

// Check current access status without prompting the user
const status = getAccessStatus();

if (status === 'allowed') {
  // Permission already granted — safe to start listening
  console.log('Access granted, starting listener...');
  startListening((event) => {
    console.log(`Notification ${event.kind}: id=${event.notificationId}`);
  });
} else if (status === 'unspecified') {
  // Never requested — prompt the user now
  const result = requestAccess();
  console.log(`Request result: ${result}`);
} else {
  // "denied" or "unknown" — cannot proceed
  console.log(`Cannot listen: access status is "${status}"`);
}
```

:::

## Notes

:::note No Side Effects
`getAccessStatus()` is purely a read operation. It does not modify any system state, does not cache results internally, and does not influence subsequent calls to [requestAccess()](request-access.md). Each call queries the OS for the live permission state.
:::

:::tip Use Before `requestAccess()`
Since `requestAccess()` is a blocking call that may show a system dialog, always check `getAccessStatus()` first. If the status is already `"allowed"`, you can skip the prompt entirely and proceed directly to [startListening()](start-listening.md).
:::

:::note Status Persistence
The access status is managed by the Windows OS and persists across application restarts. If the user grants permission once, `getAccessStatus()` will return `"allowed"` in future sessions until the user or a policy revokes it.
:::

## Danger Avoidance

:::danger Do Not Assume `"allowed"` Without Checking
Never skip the `getAccessStatus()` check and assume permission is granted. The user may have revoked notification access at the OS level between sessions. Always verify the status before calling [startListening()](start-listening.md) — starting a listener without permission will fail silently or return `false`.
:::

:::danger Do Not Poll in a Tight Loop
`getAccessStatus()` is synchronous and cheap, but calling it in a tight loop (e.g., `while (getAccessStatus() !== 'allowed')`) will block the event loop and freeze your application. If you need to wait for a status change, use an interval with a reasonable delay (e.g., 1000ms) or rely on [requestAccess()](request-access.md) to block until the user responds.
:::
