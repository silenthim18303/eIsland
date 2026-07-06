---
watermark: true
title: enableSuppression
icon: fa6-solid:code
---

# enableSuppression

:::info
Enables toast notification suppression on the system. When suppression is active, incoming toast notifications are silently consumed and [getNotifications()](get-notifications.md) returns an empty array. This is useful for building distraction-free modes or temporary "do not disturb" features in your application.
:::

## Signature

```typescript
function enableSuppression(): boolean
```

## Usage

Call `enableSuppression()` when you want to silence all toast notifications. Suppression remains active until you explicitly call [disableSuppression()](disable-suppression.md). You can check the current state at any time with [isSuppressionEnabled()](is-suppression-enabled.md).

:::tip
Pair suppression with a UI toggle so users can opt in and out. Always provide a visible way to restore notifications.
:::

:::note
Suppression is a global setting. It affects all toast notifications across the system, not just those from your application.
:::

## Return Value

Returns `true` if suppression was successfully enabled. Returns `false` if suppression was already active (i.e., no state change occurred).

:::warning
Do not assume the return value means the system is in a brand-new suppressed state. A `false` return simply means suppression was already on. Use [isSuppressionEnabled()](is-suppression-enabled.md) to query the actual current state if needed.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { enableSuppression, isSuppressionEnabled, getNotifications } from '@eisland/windows-toast-listener';

// Enable toast notification suppression
const enabled = enableSuppression();

// Check if suppression was newly activated
if (enabled) {
  console.log('Suppression enabled');
} else {
  console.log('Suppression was already active');
}

// Verify the current suppression state
console.log('Suppression active:', isSuppressionEnabled());

// Notifications list is now empty while suppression is on
const notifs = getNotifications();
console.log('Notification count:', notifs.length); // 0
```

@tab JavaScript

```js
const { enableSuppression, isSuppressionEnabled, getNotifications } = require('@eisland/windows-toast-listener');

// Enable toast notification suppression
const enabled = enableSuppression();

// Check if suppression was newly activated
if (enabled) {
  console.log('Suppression enabled');
} else {
  console.log('Suppression was already active');
}

// Verify the current suppression state
console.log('Suppression active:', isSuppressionEnabled());

// Notifications list is now empty while suppression is on
const notifs = getNotifications();
console.log('Notification count:', notifs.length); // 0
```

:::

## Notes

:::note
Suppression persists as long as your process holds it. If your application crashes or exits without calling [disableSuppression()](disable-suppression.md), the system may restore normal notification behavior automatically, but this is not guaranteed on all Windows versions.
:::

:::tip
If you only need to temporarily hide notifications during a specific operation, call [enableSuppression()](enable-suppression.md) before the operation and [disableSuppression()](disable-suppression.md) immediately after. Avoid leaving suppression on indefinitely without a clear user-facing reason.
:::

:::note
The [startListening()](start-listening.md) callback still receives change events while suppression is active, but the notification content is not available through [getNotifications()](get-notifications.md).
:::

## Danger Avoidance

:::danger
Never leave suppression enabled indefinitely without giving the user a way to restore notifications. Silent suppression can cause users to miss critical alerts (e.g., security warnings, calendar reminders). Always pair with a visible UI control or a timeout mechanism.
:::

:::danger
Do not call `enableSuppression()` in a tight loop or on every render cycle. The function modifies global system state and may have performance implications if invoked repeatedly. Call it once when entering "do not disturb" mode, not continuously.
:::
