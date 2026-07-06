---
watermark: true
title: getFullscreenWindows
icon: fa6-solid:code
---

# getFullscreenWindows

:::info Introduction
`getFullscreenWindows` scans all visible top-level windows on the system and returns those currently in fullscreen mode. Each result includes the window handle, title, process ID, screen bounds, the monitor it occupies, and whether it is the foreground window. It is the primary way to discover which applications are covering an entire monitor at any given moment.
:::

## Signature

```typescript
function getFullscreenWindows(): FullscreenWindowInfo[];
```

## Usage

Call `getFullscreenWindows` when you need to know which applications are currently covering an entire monitor. Typical scenarios include:

- **Media detection** — detecting video players or games in fullscreen so your overlay can adapt its behavior.
- **Focus management** — deciding whether to suppress notifications or adjust window z-order when a fullscreen app is active.
- **Multi-monitor awareness** — determining which monitors have fullscreen content, since each result carries its own [NativeMonitorInfo](fullscreen-window-info.md) reference.

:::tip Polling strategy
Instead of polling on a fixed timer, consider calling `getFullscreenWindows` in response to system events such as window focus changes or display resolution changes. This reduces unnecessary native calls while still keeping your state current.
:::

This function performs a synchronous native scan of all top-level windows. It is safe to call on an interval (e.g. every few seconds) but should not be called in a tight loop.

## Properties

Each [FullscreenWindowInfo](fullscreen-window-info.md) object returned in the array contains:

| Property | Type | Description |
| --- | --- | --- |
| `hwnd` | `string` | Hexadecimal window handle (e.g. `"00000000001A0B2C"`) |
| `title` | `string` | Window title bar text |
| `processId` | `number` | Owning process ID |
| `bounds` | [NativeRect](fullscreen-window-info.md) | Window position and size in screen coordinates |
| `monitor` | [NativeMonitorInfo](fullscreen-window-info.md) | The monitor the window occupies, including primary-monitor flag |
| `isForeground` | `boolean` | `true` if this window is the current foreground (focused) window |

:::note Foreground flag semantics
Multiple fullscreen windows can exist simultaneously on different monitors, but only one window can have `isForeground` set to `true`. If no fullscreen window is focused, all entries will have `isForeground: false`.
:::

## Return Value

Returns an array of [FullscreenWindowInfo](fullscreen-window-info.md) objects. If no windows are in fullscreen mode, the array is empty (length `0`).

:::warning Empty array vs. error
An empty array does not indicate an error — it simply means no window is currently in fullscreen mode. This function does not throw under normal conditions. If the native module fails to load, the error will occur at import time, not at call time.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getFullscreenWindows } from '@eisland/windows-fullscreen-detector';

// Scan all windows for fullscreen state
const windows = getFullscreenWindows();

if (windows.length > 0) {
  // Log each fullscreen window with its title and process ID
  console.log(`${windows.length} fullscreen window(s) detected:`);
  windows.forEach(w => {
    // Show the window title, PID, and which monitor it covers
    console.log(`  - "${w.title}" (PID ${w.processId}, monitor primary=${w.monitor.isPrimary})`);
  });
} else {
  // No window is currently covering an entire monitor
  console.log('No fullscreen windows detected.');
}

// Check if any fullscreen window is also the foreground window
const foregroundFullscreen = windows.find(w => w.isForeground);
if (foregroundFullscreen) {
  // A fullscreen app currently has focus — you may want to suppress overlays
  console.log(`Foreground fullscreen app: "${foregroundFullscreen.title}"`);
}
```

@tab JavaScript

```js
const { getFullscreenWindows } = require('@eisland/windows-fullscreen-detector');

// Scan all windows for fullscreen state
const windows = getFullscreenWindows();

if (windows.length > 0) {
  // Log each fullscreen window with its title and process ID
  console.log(`${windows.length} fullscreen window(s) detected:`);
  windows.forEach(w => {
    // Show the window title, PID, and which monitor it covers
    console.log(`  - "${w.title}" (PID ${w.processId}, monitor primary=${w.monitor.isPrimary})`);
  });
} else {
  // No window is currently covering an entire monitor
  console.log('No fullscreen windows detected.');
}

// Check if any fullscreen window is also the foreground window
const foregroundFullscreen = windows.find(w => w.isForeground);
if (foregroundFullscreen) {
  // A fullscreen app currently has focus — you may want to suppress overlays
  console.log(`Foreground fullscreen app: "${foregroundFullscreen.title}"`);
}
```

:::

## Notes

:::note Synchronous native call
`getFullscreenWindows` invokes a native C++ addon that enumerates top-level windows via the Win32 API. The call blocks the calling thread until enumeration completes. On typical systems this takes under 10 ms, but avoid calling it inside `requestAnimationFrame` or other tight rendering loops.
:::

:::note Window handle as string
The `hwnd` field is returned as a hexadecimal string rather than a raw integer. This avoids JavaScript number precision loss for large handle values. If you need to pass the handle to another native API, convert it appropriately.
:::

:::note Monitor information snapshot
The `monitor` property reflects the monitor's bounds at the time of the call. If the user changes display resolution or disconnects a monitor between calls, the cached monitor data may be stale. Call `getFullscreenWindows` again to get an up-to-date snapshot.
:::

:::tip Combining with other APIs
For a quick check of whether *any* fullscreen window exists (without needing details), prefer [isAnyFullscreenWindow](is-any-fullscreen-window.md) — it is cheaper since it can short-circuit on the first match. Use [getForegroundFullscreenWindow](get-foreground-fullscreen-window.md) when you only care about the focused fullscreen window.
:::

## Danger Avoidance

:::danger Do not poll at high frequency
Calling `getFullscreenWindows` in a tight loop (e.g. every frame or every few milliseconds) will consume significant CPU because each call enumerates every top-level window through the Win32 `EnumWindows` API. Use a reasonable interval such as 1000-5000 ms, or only call it in response to known system events (e.g. window focus changes).
:::

:::danger Thread safety
This function must be called from the same process that loaded the native module. The underlying Win32 `EnumWindows` call is not designed for cross-process use. Calling it from a Worker thread that did not load the addon may crash or return undefined results.
:::

:::danger Do not store results long-term
The returned `FullscreenWindowInfo` objects are snapshots. Window handles (`hwnd`) can be recycled by the OS, and window titles, positions, and fullscreen state change over time. Do not cache these results and assume they remain valid beyond the immediate call context. Always call `getFullscreenWindows` again for fresh data.
:::
