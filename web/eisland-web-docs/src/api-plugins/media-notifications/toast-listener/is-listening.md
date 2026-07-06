---
watermark: true
title: isListening
icon: fa6-solid:code
---

# isListening

:::info
`isListening` is a synchronous function that checks whether the Windows toast notification listener is currently active. It returns a boolean value indicating the listener's state, making it useful for polling, conditional logic, and UI state management.
:::

## Signature

```typescript
function isListening(): boolean
```

## Usage

Use `isListening` to determine whether the toast notification listener is running before performing operations that depend on active listening. Common scenarios include:

- Checking listener state before calling [stopListening](./stop-listening.md) to avoid unnecessary calls
- Updating UI elements to reflect the current listening status
- Implementing toggle logic that depends on the listener state

:::tip
Call `isListening` after invoking [startListening](./start-listening.md) or [stopListening](./stop-listening.md) to verify that the operation succeeded.
:::

:::note
This function queries the native module state synchronously and does not block the event loop.
:::

## Return Value

Returns `true` if the toast notification listener is currently active, `false` otherwise.

```typescript
// Return type
boolean
```

:::warning
This function only reports the listener state within the current Node.js process. It does not detect listeners started by other processes or instances.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import { isListening, startListening, stopListening } from '@eisland/windows-toast-listener';

// Check initial listener state (expected: false)
console.log(`Listening: ${isListening()}`); // false

// Start the listener with a callback
startListening((event) => {
  console.log(`Notification ${event.kind}: ID ${event.notificationId}`);
});

// Verify the listener is now active
console.log(`Listening: ${isListening()}`); // true

// Stop the listener
stopListening();

// Verify the listener has stopped
console.log(`Listening: ${isListening()}`); // false
```

@tab JavaScript

```javascript
const { isListening, startListening, stopListening } = require('@eisland/windows-toast-listener');

// Check initial listener state (expected: false)
console.log(`Listening: ${isListening()}`); // false

// Start the listener with a callback
startListening((event) => {
  console.log(`Notification ${event.kind}: ID ${event.notificationId}`);
});

// Verify the listener is now active
console.log(`Listening: ${isListening()}`); // true

// Stop the listener
stopListening();

// Verify the listener has stopped
console.log(`Listening: ${isListening()}`); // false
```

:::

## Notes

:::note
`isListening` returns the state of the listener within the current module instance. Multiple Node.js processes each maintain their own independent listener state.
:::

:::tip
Use `isListening` to implement a safe toggle pattern:

```typescript
function toggleListening(callback) {
  if (isListening()) {
    stopListening();
  } else {
    startListening(callback);
  }
}
```
:::

:::note
The listener state persists until [stopListening](./stop-listening.md) is explicitly called or the Node.js process exits. The state is not shared across process restarts.
:::

## Danger Avoidance

:::danger
Do not call [stopListening](./stop-listening.md) when `isListening()` returns `false`. While the function will return `false` to indicate failure, repeated unnecessary calls may cause unexpected behavior in the native module.
:::

:::danger
Do not rely on `isListening` for thread-safe synchronization in multi-threaded native addons. The native module state is per-process, and concurrent access from multiple threads without proper locking can lead to race conditions.
:::
