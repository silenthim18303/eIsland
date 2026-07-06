---
watermark: true
title: isSuppressionEnabled
icon: fa6-solid:code
---

# isSuppressionEnabled

:::info Introduction
`isSuppressionEnabled` is a synchronous function from `@eisland/windows-toast-listener` that checks whether toast notification suppression is currently active. When suppression is enabled, incoming toast notifications are intercepted and hidden from the user by the Windows system, while still being captured by the listener for programmatic processing.
:::

## Signature

```typescript
function isSuppressionEnabled(): boolean
```

This is a query-only function with no side effects. It reads the current suppression state without modifying it. Use it alongside [enableSuppression](enable-suppression.md) and [disableSuppression](disable-suppression.md) to inspect and control the suppression lifecycle.

## Usage

:::tip Typical Workflow
Call `isSuppressionEnabled` to check the current suppression state before performing actions that depend on whether notifications are being silenced. This is useful for building toggle UIs, logging, or conditional logic that should behave differently based on the suppression setting.
:::

The typical usage pattern involves checking the state, then toggling it as needed:

1. Call `isSuppressionEnabled()` to read the current state.
2. Based on the result, call `enableSuppression()` or `disableSuppression()` to change the state if needed.
3. Optionally re-check with `isSuppressionEnabled()` to confirm the change took effect.

:::note No Access Requirement
Unlike [requestAccess](request-access.md) and [getAccessStatus](get-access-status.md), `isSuppressionEnabled` does not require the user to grant notification access. The suppression state is an independent flag managed entirely by your application logic.
:::

## Return Value

Returns a `boolean`:

- `true` — suppression is currently active; incoming toast notifications are intercepted and hidden from the user.
- `false` — suppression is not active; toast notifications are displayed normally.

:::warning Default State
The suppression state defaults to `false`. It only becomes `true` after an explicit call to [enableSuppression](enable-suppression.md). If you need suppression active at startup, call `enableSuppression` during your application's initialization phase.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import {
  isSuppressionEnabled,
  enableSuppression,
  disableSuppression,
} from '@eisland/windows-toast-listener';

// Check the current suppression state (defaults to false)
console.log(`Suppressed: ${isSuppressionEnabled()}`);
// Output: Suppressed: false

// Enable suppression to hide toast notifications from the user
enableSuppression();

// Verify suppression is now active
console.log(`Suppressed: ${isSuppressionEnabled()}`);
// Output: Suppressed: true

// Disable suppression to restore normal toast behavior
disableSuppression();

// Confirm suppression is deactivated
console.log(`Suppressed: ${isSuppressionEnabled()}`);
// Output: Suppressed: false
```

@tab JavaScript

```js
const {
  isSuppressionEnabled,
  enableSuppression,
  disableSuppression,
} = require('@eisland/windows-toast-listener');

// Check the current suppression state (defaults to false)
console.log(`Suppressed: ${isSuppressionEnabled()}`);
// Output: Suppressed: false

// Enable suppression to hide toast notifications from the user
enableSuppression();

// Verify suppression is now active
console.log(`Suppressed: ${isSuppressionEnabled()}`);
// Output: Suppressed: true

// Disable suppression to restore normal toast behavior
disableSuppression();

// Confirm suppression is deactivated
console.log(`Suppressed: ${isSuppressionEnabled()}`);
// Output: Suppressed: false
```

:::

## Notes

:::note Read-Only Query
`isSuppressionEnabled` is purely a read operation. It does not trigger any native-side state transitions, does not send messages to the Windows notification subsystem, and has no performance cost. It is safe to call as frequently as needed.
:::

:::tip Use in Toggle Controls
This function is well-suited for driving UI toggle switches or status indicators. Since it is synchronous and side-effect-free, it can be called directly in a render function or computed property without concern for async delays or stale data.
:::

:::note Suppression vs. Listening
Suppression and listening are independent concerns. Suppression controls whether notifications are hidden from the user. Listening (see [startListening](start-listening.md) and [isListening](is-listening.md)) controls whether your application receives notification events. You can have suppression enabled without listening, or listen without suppressing.
:::

## Danger Avoidance

:::danger Do Not Assume Suppression Grants Access
Enabling suppression does **not** imply that your application has notification access. If [getAccessStatus](get-access-status.md) returns anything other than `'allowed'`, your listener will not receive notification events regardless of the suppression state. Always verify access status separately using [requestAccess](request-access.md) before relying on the listener for notification data.
:::

:::danger State Is Ephemeral
The suppression state is held in memory for the lifetime of the native module. It is **not** persisted across application restarts. If your application crashes or exits without calling [disableSuppression](disable-suppression.md), the state resets to `false` on the next launch. Do not rely on `isSuppressionEnabled` to survive application lifecycle events — re-enable suppression explicitly on startup if needed.
:::
