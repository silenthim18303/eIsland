---
watermark: true
title: FullscreenWindowInfo
icon: fa6-solid:table
---

# FullscreenWindowInfo

:::info
`FullscreenWindowInfo` is an interface that describes a window currently occupying fullscreen mode on a display. It is the core data structure returned by [getFullscreenWindows](get-fullscreen-windows.md) and [getForegroundFullscreenWindow](get-foreground-fullscreen-window.md), providing the window's identity, geometry, and monitor context. You never construct instances of this interface yourself -- the detector functions produce them on each call.
:::

## Interface Introduction

You encounter `FullscreenWindowInfo` whenever you query for fullscreen windows. Each object in the result represents a single Win32 window that is currently covering an entire monitor. The interface bundles the window handle, its owning process, its screen bounds, which monitor it occupies, and whether it is the foreground (focused) window.

This interface also depends on two sub-types:
- [NativeRect](native-rect.md) -- the bounding rectangle of the window in screen coordinates.
- [NativeMonitorInfo](native-monitor-info.md) -- details about the monitor the window occupies, including resolution and whether it is the primary display.

## Usage

`FullscreenWindowInfo` objects are produced by the detector functions -- you never construct them yourself. A typical workflow:

1. Call [getFullscreenWindows](get-fullscreen-windows.md) to get all fullscreen windows across all monitors.
2. Inspect each entry's `title` or `processId` to identify the application.
3. Use `monitor` to determine which display the window occupies (important on multi-monitor setups).
4. Check `isForeground` to know whether the user is actively interacting with that fullscreen window.

If you only care about the single focused fullscreen window, use [getForegroundFullscreenWindow](get-foreground-fullscreen-window.md) instead to avoid iterating.

:::tip
Use [isAnyFullscreenWindow](is-any-fullscreen-window.md) as a lightweight boolean check first. Only call `getFullscreenWindows()` when you actually need the details -- `isAnyFullscreenWindow()` avoids allocating and populating the full array when you just need a yes/no answer.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `hwnd` | `string` | Window handle as a hex string (e.g. `"0x1A2B3C"`). Uniquely identifies the window in the current session. |
| `title` | `string` | The window's title bar text. May be empty for borderless or system windows. |
| `processId` | `number` | The PID of the process that owns this window. Useful for matching against known applications. |
| `bounds` | [NativeRect](native-rect.md) | The window's bounding rectangle in screen coordinates (left, top, right, bottom, width, height). |
| `monitor` | [NativeMonitorInfo](native-monitor-info.md) | The monitor the window occupies. Includes resolution, position, and whether it is the primary display. |
| `isForeground` | `boolean` | `true` if this window is the currently focused foreground window; `false` otherwise. |

:::note
The `title` property reads the Win32 window text, which may differ from the application name shown in Task Manager. Some windows (e.g. borderless games or UWP apps) may return an empty string. Always handle the empty case gracefully.
:::

:::note
The `bounds` and `monitor` rectangles both use [NativeRect](native-rect.md) coordinates, but they serve different purposes: `bounds` describes where the window sits on screen, while `monitor` describes the monitor's own resolution and position. On single-monitor setups the two will overlap; on multi-monitor setups they may differ significantly.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getFullscreenWindows, isAnyFullscreenWindow } from '@eisland/windows-fullscreen-detector';
// Import the query functions from the fullscreen-detector package

if (isAnyFullscreenWindow()) {
  // Only proceed when at least one fullscreen window exists
  const windows = getFullscreenWindows();
  // Returns an array of all windows currently in fullscreen mode

  windows.forEach((win) => {
    // Log the window title and its owning process ID
    console.log(`"${win.title}" (PID: ${win.processId})`);

    // Check if this window is the active foreground window
    console.log(`  Foreground: ${win.isForeground}`);

    // Display the monitor resolution this fullscreen window occupies
    console.log(`  Monitor: ${win.monitor.width}x${win.monitor.height}`);

    // Access the window bounds for precise geometry
    console.log(`  Bounds: left=${win.bounds.left}, top=${win.bounds.top}, ${win.bounds.width}x${win.bounds.height}`);
  });
} else {
  // No fullscreen windows detected on any monitor
  console.log('No fullscreen windows found.');
}
```

@tab JavaScript

```js
const { getFullscreenWindows, isAnyFullscreenWindow } = require('@eisland/windows-fullscreen-detector');
// Import the query functions from the fullscreen-detector package

if (isAnyFullscreenWindow()) {
  // Only proceed when at least one fullscreen window exists
  const windows = getFullscreenWindows();
  // Returns an array of all windows currently in fullscreen mode

  windows.forEach((win) => {
    // Log the window title and its owning process ID
    console.log(`"${win.title}" (PID: ${win.processId})`);

    // Check if this window is the active foreground window
    console.log(`  Foreground: ${win.isForeground}`);

    // Display the monitor resolution this fullscreen window occupies
    console.log(`  Monitor: ${win.monitor.width}x${win.monitor.height}`);

    // Access the window bounds for precise geometry
    console.log(`  Bounds: left=${win.bounds.left}, top=${win.bounds.top}, ${win.bounds.width}x${win.bounds.height}`);
  });
} else {
  // No fullscreen windows detected on any monitor
  console.log('No fullscreen windows found.');
}
```

:::

## Notes

:::note
The `hwnd` value is a hex string representation of the Win32 window handle (HWND). It is only valid for the lifetime of the current session -- do not persist it across application restarts, as handles are recycled by the OS.
:::

:::note
On multi-monitor setups, multiple `FullscreenWindowInfo` entries can be returned simultaneously -- one per monitor. Use the `monitor` field to distinguish which display each fullscreen window occupies.
:::

:::tip
If you only need to identify the foreground fullscreen window (e.g. to detect a game the user is actively playing), use [getForegroundFullscreenWindow](get-foreground-fullscreen-window.md) instead of `getFullscreenWindows()`. It returns a single object or `null`, which is more efficient and avoids filtering the full array.
:::

## Danger Avoidance

:::danger
Do not cache `FullscreenWindowInfo` objects for extended periods. Fullscreen state is transient -- windows can exit fullscreen at any time, and `hwnd` handles are recycled by Windows. Always re-query via [getFullscreenWindows](get-fullscreen-windows.md) or [getForegroundFullscreenWindow](get-foreground-fullscreen-window.md) when you need current data.
:::

:::danger
The `bounds` rectangle uses raw Win32 screen coordinates. On mixed-DPI multi-monitor setups, coordinates can be negative or non-contiguous. Do not assume `left` starts at 0 or that monitors are arranged side-by-side without gaps. Always read the `monitor` field to understand the coordinate space.
:::

:::danger
Avoid polling `getFullscreenWindows()` or `getForegroundFullscreenWindow()` in a tight loop without any delay. Each call queries the Win32 window manager, and excessive polling will consume CPU and may interfere with window enumeration performance. Use a reasonable interval (e.g. 500ms or longer) or rely on the [FullscreenDetector](./README.md) monitor for event-driven detection.
:::
