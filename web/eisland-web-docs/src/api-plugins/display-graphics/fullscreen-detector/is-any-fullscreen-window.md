---
watermark: true
title: isAnyFullscreenWindow
icon: fa6-solid:code
---

# isAnyFullscreenWindow

:::info
A lightweight boolean check that determines whether any window on the system is currently in fullscreen mode. This function is optimized to return early on the first match, making it more efficient than calling `getFullscreenWindows()` and checking the array length. It scans all connected monitors in a single native invocation.
:::

## Signature

```typescript
function isAnyFullscreenWindow(): boolean
```

## Usage

Call `isAnyFullscreenWindow()` when you need a quick yes/no answer about fullscreen activity without requiring details about which specific windows are fullscreen. Common use cases include:

- **Overlay visibility toggling** — automatically hide a floating widget when any app enters fullscreen.
- **Game mode detection** — detect whether a game or media player has taken over the screen.
- **UI adaptation** — adjust your application's behavior when the user is in an immersive context.

If you need the actual window details (title, bounds, process ID, etc.), use [getFullscreenWindows](./get-fullscreen-windows.md) or [getForegroundFullscreenWindow](./get-foreground-fullscreen-window.md) instead.

:::tip Prefer over manual length check
Always use `isAnyFullscreenWindow()` instead of `getFullscreenWindows().length > 0`. The dedicated function returns early on the first match without allocating an array, which is both faster and more memory-efficient.
:::

## Return Value

Returns `true` if at least one window on any monitor is currently in fullscreen mode; `false` otherwise. The return value is always a valid boolean — it never returns `null` or `undefined`.

:::warning State is point-in-time
The returned boolean reflects the fullscreen state at the exact moment of the call. This state can change immediately after the function returns, so do not cache the result for extended periods if your logic depends on up-to-date fullscreen information.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { isAnyFullscreenWindow } from '@eisland/windows-fullscreen-detector';

// Check whether any window is currently fullscreen
const hasFullscreen = isAnyFullscreenWindow();

if (hasFullscreen) {
  // At least one window is fullscreen — hide the overlay to avoid obstruction
  console.log('Fullscreen window detected — hiding overlay');
} else {
  // No fullscreen window — it is safe to show the overlay
  console.log('No fullscreen window — showing overlay');
}
```

@tab JavaScript

```js
const { isAnyFullscreenWindow } = require('@eisland/windows-fullscreen-detector');

// Check whether any window is currently fullscreen
const hasFullscreen = isAnyFullscreenWindow();

if (hasFullscreen) {
  // At least one window is fullscreen — hide the overlay to avoid obstruction
  console.log('Fullscreen window detected — hiding overlay');
} else {
  // No fullscreen window — it is safe to show the overlay
  console.log('No fullscreen window — showing overlay');
}
```

:::

## Notes

:::note Lightweight check
This function performs a single native scan and returns immediately once a fullscreen window is found. It does not allocate an array or collect all matches, so prefer it over `getFullscreenWindows().length > 0` for simple boolean decisions.
:::

:::note Cross-monitor awareness
The check covers all connected monitors. A window fullscreen on a secondary display will also cause this function to return `true`.
:::

:::note No event-driven alternative
This API is polling-based. There is no built-in event or callback that fires when a window enters or exits fullscreen. If you need reactive behavior, poll at a reasonable interval and compare consecutive results to detect transitions.
:::

## Danger Avoidance

:::danger Do not poll at high frequency in a tight loop
Each call invokes a native Windows enumeration. Calling this function in a `setInterval` with a very short interval (e.g. under 100 ms) will place unnecessary load on the system. Use a reasonable polling interval (500 ms or more) or combine with event-driven approaches where possible.
:::

:::danger Do not assume the result is stable across async boundaries
Since fullscreen state can change at any time, do not call `isAnyFullscreenWindow()` once at startup and assume the result remains valid for the entire session. Always re-query when the result matters for a subsequent action, especially before toggling UI visibility or adjusting layout.
:::
