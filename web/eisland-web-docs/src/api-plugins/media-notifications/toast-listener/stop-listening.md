---
watermark: true
title: stopListening
icon: fa6-solid:code
---

# stopListening

:::info
`stopListening` stops the toast notification listener that was previously started via [startListening](start-listening.md). It unregisters the underlying Windows notification observer so that no further `ToastNotificationChangedCallback` invocations occur. The function returns a boolean indicating whether a listener was actually active and successfully stopped.
:::

## Signature

```typescript
function stopListening(): boolean
```

## Usage

`stopListening` is the cleanup counterpart to [startListening](start-listening.md). After your application no longer needs to track toast notification changes, call this function to release the system resource held by the listener.

:::tip
Pair every `startListening` call with a corresponding `stopListening` call when the listener is no longer needed. In a Vue or React component, place the stop call inside the component's unmount lifecycle hook to prevent resource leaks.
:::

:::note
Calling `stopListening` when no listener is active is safe and simply returns `false`. There is no need to check [isListening](is-listening.md) before calling it, although you may do so if you need to branch on the result.
:::

## Return Value

| Type      | Description                                                        |
| --------- | ------------------------------------------------------------------ |
| `boolean` | `true` if a listener was active and has been stopped; `false` otherwise. |

:::warning
If the return value is `false`, it means no listener was running at the time of the call. This is not an error, but it does indicate that your application's listener state may be out of sync. Review your start/stop call pairing logic if this is unexpected.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { startListening, stopListening, isListening } from '@eisland/windows-toast-listener';

// Start a listener with a callback that logs notification events
const started = startListening((event) => {
  console.log(`Toast ${event.kind}: id=${event.notificationId}`);
});

// Later, when the listener is no longer needed, stop it
if (isListening()) {
  // stopListening returns true because the listener was active
  const stopped = stopListening();
  console.log('Listener stopped:', stopped); // true
}

// Calling stopListening again when nothing is active returns false
const alreadyStopped = stopListening();
console.log('Already stopped:', alreadyStopped); // false
```

@tab JavaScript

```js
const { startListening, stopListening, isListening } = require('@eisland/windows-toast-listener');

// Start a listener with a callback that logs notification events
const started = startListening((event) => {
  console.log(`Toast ${event.kind}: id=${event.notificationId}`);
});

// Later, when the listener is no longer needed, stop it
if (isListening()) {
  // stopListening returns true because the listener was active
  const stopped = stopListening();
  console.log('Listener stopped:', stopped); // true
}

// Calling stopListening again when nothing is active returns false
const alreadyStopped = stopListening();
console.log('Already stopped:', alreadyStopped); // false
```

:::

## Notes

:::note
The listener is a singleton resource managed at the module level. Only one listener can be active at a time for the entire process. Calling [startListening](start-listening.md) while a listener is already running will replace the previous callback; calling `stopListening` tears down whichever listener is currently active.
:::

:::tip
If you need to change the callback without a gap in listening, call [startListening](start-listening.md) with the new callback directly instead of stopping and restarting. This avoids a brief window where notification events could be missed.
:::

:::note
`stopListening` is a synchronous, blocking call. It completes before the function returns, so by the time you read the `true` return value, no further callback invocations will occur.
:::

## Danger Avoidance

:::danger
Never call `stopListening` from inside the callback you passed to [startListening](start-listening.md). Stopping the listener while a callback is being dispatched is an undefined-behavior scenario that may cause a native crash or leave the listener in a corrupted state. If you need to stop in response to a specific notification, schedule the stop call asynchronously (e.g., via `setTimeout` or `queueMicrotask`).
:::

:::danger
Do not assume that `stopListening` frees all associated memory if you have retained references to notification snapshots obtained via [getNotifications](get-notifications.md). Those snapshot objects are independent and will persist until garbage-collected. Holding stale snapshots indefinitely can cause unexpected memory growth.
:::
