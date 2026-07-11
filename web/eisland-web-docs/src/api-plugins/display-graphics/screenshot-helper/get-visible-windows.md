---
watermark: true
title: getVisibleWindows
icon: fa6-solid:code
---

# getVisibleWindows

:::info
Enumerates all visible top-level windows and returns their bounding rectangles. This function calls into the Native AOT DLL which uses Win32 APIs (`EnumWindows`, `DwmGetWindowAttribute`, `GetWindowRect`) to collect window positions. Returns an array of [VisibleWindowBounds](visible-window-bounds.md) objects, or an empty array if no windows are found or the DLL is unavailable.
:::

## Signature

```typescript
function getVisibleWindows(): VisibleWindowBounds[];
```

## Parameters

This function takes no parameters.

## Usage

The `getVisibleWindows` function provides window geometry data for the capture overlay. It enables window recognition during screenshot selection — the overlay highlights windows on hover and allows single-click selection.

Typical workflow:

1. Call `getVisibleWindows()` before or during the capture overlay display.
2. Pass the returned array to the capture window along with the screenshot image.
3. The overlay maps window bounds to display coordinates and uses them for hit-testing.
4. When the user hovers over a window region, the overlay draws a highlight border.
5. A single click selects the entire window region for capture.

:::note
The function filters out minimized windows, cloaked windows (hidden by the DWM compositor), windows smaller than 40x40 pixels, and the caller's own process windows. Only visible, meaningful application windows are returned.
:::

:::tip
Call `getVisibleWindows` after the main window is hidden but before sending the capture image to the overlay. This ensures the window list reflects the desktop state at capture time without the eIsland main window appearing in the results.
:::

## Return Value

| Type | Description |
|------|-------------|
| `VisibleWindowBounds[]` | Array of visible window bounds, or empty array on failure |

Returns an array of [VisibleWindowBounds](visible-window-bounds.md) objects. Each object contains the window handle, title, process ID, and bounding rectangle. Returns an empty array `[]` if the DLL is unavailable, no visible windows are found, or an error occurs.

:::warning
The returned bounds are in virtual screen coordinates. On multi-monitor setups, coordinates may be negative or extend beyond a single display's resolution. Use the `display.bounds` from Electron's `screen.getPrimaryDisplay()` to map coordinates to the capture overlay's coordinate space.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getVisibleWindows, VisibleWindowBounds } from '@eisland/windows-screenshot-helper';

const windows: VisibleWindowBounds[] = getVisibleWindows();

if (windows.length > 0) {
  console.log(`Found ${windows.length} visible windows`);
  windows.forEach((w) => {
    console.log(`  [${w.hwnd}] "${w.title}" — ${w.width}x${w.height} at (${w.x},${w.y})`);
  });
} else {
  console.log('No visible windows found');
}
```

@tab JavaScript

```js
const { getVisibleWindows } = require('@eisland/windows-screenshot-helper');

const windows = getVisibleWindows();

if (windows.length > 0) {
  console.log(`Found ${windows.length} visible windows`);
  windows.forEach((w) => {
    console.log(`  [${w.hwnd}] "${w.title}" — ${w.width}x${w.height} at (${w.x},${w.y})`);
  });
} else {
  console.log('No visible windows found');
}
```

:::

## Notes

:::note
The function calls `sc_get_visible_windows` via koffi FFI. The DLL enumerates windows using `EnumWindows`, checks visibility and cloaking state via `DwmGetWindowAttribute`, and returns a JSON array. The FFI loader parses the JSON into a JavaScript array of objects.
:::

:::tip
The function returns an empty array (not `null`) on failure, so it is safe to call without null-checking. However, always verify `windows.length > 0` before using the results.
:::

:::important
This plugin is Windows-only (`os: ['win32']`). On non-Windows platforms, `getVisibleWindows` is not available. The main process wrapper in `screenshotHelper.ts` handles this gracefully by returning an empty array.
:::

## Danger Avoidance

:::danger
Do not call `getVisibleWindows` in a tight loop. Each call enumerates all top-level windows via `EnumWindows` and queries DWM attributes for each one. Rapid successive calls can cause noticeable CPU overhead. Cache the results and refresh only when the desktop state changes (e.g., before showing the capture overlay).
:::
