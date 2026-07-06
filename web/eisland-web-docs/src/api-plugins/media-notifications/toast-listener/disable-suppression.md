---
watermark: true
title: disableSuppression
icon: fa6-solid:code
---

# disableSuppression

:::info Introduction
`disableSuppression` restores normal toast notification behavior on Windows. When the toast listener's suppression mode is active, the system notification center hides incoming toasts from the user — calling this function turns that off so notifications appear again. It returns a boolean indicating whether the state actually changed.
:::

## Signature

```typescript
function disableSuppression(): boolean
```

## Usage

Call `disableSuppression` when you want to end the suppressed-notification state that was previously activated via [enableSuppression](enable-suppression.md). This is typically part of a toggle pattern: suppress during a focused session, then restore when the session ends.

:::tip Checking before toggling
Use [isSuppressionEnabled](is-suppression-enabled.md) first to avoid redundant calls. While `disableSuppression` is safe to call when suppression is already off, checking the state beforehand makes your intent clearer and avoids unnecessary native calls.
:::

:::note Return value semantics
The function returns `true` only when the suppression state actually changed (was enabled, now disabled). If suppression was already disabled, it returns `false`. Use this return value to update UI state or skip downstream logic.
:::

## Return Value

| Type | Description |
|------|-------------|
| `boolean` | `true` if suppression was successfully disabled; `false` if suppression was already disabled |

:::warning State verification
A `false` return does not indicate an error — it simply means suppression was already off. If you need to confirm the current state after calling this function, follow up with [isSuppressionEnabled](is-suppression-enabled.md).
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import {
  disableSuppression,
  isSuppressionEnabled,
  enableSuppression,
  getNotifications,
} from '@eisland/windows-toast-listener';

// Check if suppression is currently active
if (isSuppressionEnabled()) {
  // Disable suppression so notifications appear normally again
  const changed = disableSuppression();
  console.log(`Suppression disabled: ${changed}`); // true — state changed
}

// Suppression is now off; notifications will be visible
const notifs = getNotifications();
console.log(`Visible notifications: ${notifs.length}`);
```

@tab JavaScript

```js
const {
  disableSuppression,
  isSuppressionEnabled,
  enableSuppression,
  getNotifications,
} = require('@eisland/windows-toast-listener');

// Check if suppression is currently active
if (isSuppressionEnabled()) {
  // Disable suppression so notifications appear normally again
  const changed = disableSuppression();
  console.log(`Suppression disabled: ${changed}`); // true — state changed
}

// Suppression is now off; notifications will be visible
const notifs = getNotifications();
console.log(`Visible notifications: ${notifs.length}`);
```

:::

## Notes

:::note Relationship to enableSuppression
`disableSuppression` is the direct counterpart of [enableSuppression](enable-suppression.md). Together they form a toggle pair. The suppression state persists across calls to [startListening](start-listening.md) / [stopListening](stop-listening.md) — stopping the listener does not automatically restore suppression.
:::

:::tip Combining with listener lifecycle
A common pattern is to suppress notifications while your listener is active (to avoid duplicate display) and disable suppression before stopping. This ensures the user sees their notifications once your app no longer handles them.
:::

:::note Native side-effect
This function makes a native IPC call to the Windows toast notification subsystem. While the call is fast, avoid calling it in tight loops or high-frequency timers.
:::

## Danger Avoidance

:::danger Do not forget to disable suppression
If you call [enableSuppression](enable-suppression.md) but never call `disableSuppression`, the user will not see any toast notifications until the system is rebooted or your process exits. Always pair enable/disable calls — consider using a `try/finally` block to guarantee cleanup.
:::

:::danger Suppression affects the entire system
Toast suppression is a system-wide setting for the notification listener. It is not scoped to your application. While suppression is active, all toast notifications handled by this listener are hidden. Ensure this is the intended behavior before enabling it, and disable it promptly when no longer needed.
:::
