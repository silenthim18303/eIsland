---
watermark: true
title: VisibleWindowBounds
icon: fa6-solid:table
---

# VisibleWindowBounds

:::info
Represents the bounding rectangle and metadata of a visible top-level window on the desktop. This interface is returned as elements of the array from the `getVisibleWindows` function. Each entry describes one window's position, size, and identity — used by the capture overlay to highlight and select windows for screenshot capture.
:::

## Interface Definition

```typescript
interface VisibleWindowBounds {
  hwnd: string;
  title: string;
  processId: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `hwnd` | `string` | Window handle as a hexadecimal string (e.g., `"1A2B3C"`) |
| `title` | `string` | Window title text, or empty string if untitled |
| `processId` | `number` | Process ID that owns the window |
| `x` | `number` | X coordinate of the window's left edge in screen pixels |
| `y` | `number` | Y coordinate of the window's top edge in screen pixels |
| `width` | `number` | Window width in pixels (excludes invisible borders when DWM extended frame bounds are available) |
| `height` | `number` | Window height in pixels |

## Usage

The `VisibleWindowBounds` interface is returned by the [getVisibleWindows](get-visible-windows.md) function. Each entry represents one visible, non-minimized, non-cloaked top-level window.

The capture overlay uses these bounds to highlight windows when the mouse hovers over them, enabling single-click window selection for screenshots.

:::note
The `hwnd` value is a hexadecimal string representation of the Win32 `HWND`. It is not a numeric value — compare it as a string, not a number.
:::

:::tip
The `x`, `y`, `width`, and `height` values use DWM extended frame bounds when available, which excludes the invisible resize border that Windows adds around windows. This produces tighter, more accurate capture regions than raw `GetWindowRect`.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getVisibleWindows, VisibleWindowBounds } from '@eisland/windows-screenshot-helper';

const windows: VisibleWindowBounds[] = getVisibleWindows();

for (const win of windows) {
  console.log(`[${win.hwnd}] "${win.title}" at (${win.x},${win.y}) ${win.width}x${win.height} (PID ${win.processId})`);
}

// Find a specific window by title
const browser = windows.find((w) => w.title.includes('Chrome'));
if (browser) {
  console.log(`Found browser at ${browser.x},${browser.y}`);
}
```

@tab JavaScript

```js
const { getVisibleWindows } = require('@eisland/windows-screenshot-helper');

const windows = getVisibleWindows();

for (const win of windows) {
  console.log(`[${win.hwnd}] "${win.title}" at (${win.x},${win.y}) ${win.width}x${win.height} (PID ${win.processId})`);
}

// Find a specific window by title
const browser = windows.find((w) => w.title.includes('Chrome'));
if (browser) {
  console.log(`Found browser at ${browser.x},${browser.y}`);
}
```

:::

## Notes

:::important
Windows smaller than 40x40 pixels are filtered out. Cloaked windows (hidden by the compositor, such as UWP suspended apps) and minimized windows are also excluded.
:::

:::warning
The bounds represent the window's position on the virtual screen. On multi-monitor setups, coordinates can be negative. The caller is responsible for mapping these coordinates to the correct display when performing region-based operations.
:::

## Danger Avoidance

:::danger
Do not assume the `title` property is unique or non-empty. Many windows share the same title, and some windows (e.g., tooltip hosts) return an empty string. Always use `hwnd` as the unique identifier when tracking specific windows.
:::
