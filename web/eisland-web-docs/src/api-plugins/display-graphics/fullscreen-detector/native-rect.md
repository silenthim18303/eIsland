---
watermark: true
title: NativeRect
icon: fa6-solid:table
---

# NativeRect

:::info
`NativeRect` is an interface representing a rectangular region on screen using pixel coordinates. It is the fundamental building block for describing the bounds of windows and monitors within the `@eisland/windows-fullscreen-detector` module. Every spatial query in the module ultimately produces or consumes a `NativeRect`.
:::

## Interface Introduction

`NativeRect` describes a rectangular area on screen using the Windows GDI coordinate convention: `left`/`top` define the upper-left corner, and `right`/`bottom` define the lower-right corner. The `width` and `height` fields are pre-calculated convenience values so you do not need to compute them manually.

You will encounter `NativeRect` as part of other types in this module:

- The `bounds` property of [`FullscreenWindowInfo`](fullscreen-window-info.md) is a `NativeRect` describing the window's screen rectangle.
- The [`NativeMonitorInfo`](native-monitor-info.md) interface **extends** `NativeRect`, inheriting all six fields and adding its own `isPrimary` flag.

## Usage

You never construct a `NativeRect` directly. Instead, you receive one as part of the return value from the module's query functions: [`getForegroundFullscreenWindow`](get-foreground-fullscreen-window.md), [`getFullscreenWindows`](get-fullscreen-windows.md), or [`isAnyFullscreenWindow`](is-any-fullscreen-window.md).

:::tip Prefer `width` and `height` over manual arithmetic
Always use the `width` and `height` properties rather than computing `right - left` or `bottom - top` yourself. They are pre-calculated by the native layer and guaranteed to be consistent with the edge coordinates.
:::

:::tip Combine with monitor info for relative positioning
When a fullscreen window's `NativeRect` origin does not start at `(0, 0)`, subtract the owning monitor's `left`/`top` (available via [`NativeMonitorInfo`](native-monitor-info.md)) to get coordinates relative to that monitor.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `left` | `number` | Left edge coordinate in physical screen pixels |
| `top` | `number` | Top edge coordinate in physical screen pixels |
| `right` | `number` | Right edge coordinate in physical screen pixels (exclusive) |
| `bottom` | `number` | Bottom edge coordinate in physical screen pixels (exclusive) |
| `width` | `number` | Width in pixels, equal to `right - left` |
| `height` | `number` | Height in pixels, equal to `bottom - top` |

:::note `right` and `bottom` are exclusive edges
Following the Windows RECT convention, `right` and `bottom` are exclusive — the pixel at column `right` and row `bottom` is **outside** the rectangle. This is consistent with how `width = right - left` and `height = bottom - top` are derived.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getForegroundFullscreenWindow } from '@eisland/windows-fullscreen-detector';

// Query the currently focused fullscreen window (null if none)
const win = getForegroundFullscreenWindow();
if (win) {
  // Destructure the bounds (NativeRect) from the window info
  const { bounds } = win;

  // Read the pre-calculated dimensions
  console.log(`Window size: ${bounds.width}x${bounds.height}`);

  // Read the top-left corner position
  console.log(`Position: (${bounds.left}, ${bounds.top})`);

  // Access the owning monitor's origin for relative coordinates
  const relativeX = bounds.left - win.monitor.left;
  const relativeY = bounds.top - win.monitor.top;
  console.log(`Relative to monitor: (${relativeX}, ${relativeY})`);
}
```

@tab JavaScript

```js
const { getForegroundFullscreenWindow } = require('@eisland/windows-fullscreen-detector');

// Query the currently focused fullscreen window (null if none)
const win = getForegroundFullscreenWindow();
if (win) {
  // Destructure the bounds (NativeRect) from the window info
  const { bounds } = win;

  // Read the pre-calculated dimensions
  console.log(`Window size: ${bounds.width}x${bounds.height}`);

  // Read the top-left corner position
  console.log(`Position: (${bounds.left}, ${bounds.top})`);

  // Access the owning monitor's origin for relative coordinates
  const relativeX = bounds.left - win.monitor.left;
  const relativeY = bounds.top - win.monitor.top;
  console.log(`Relative to monitor: (${relativeX}, ${relativeY})`);
}
```

:::

## Notes

:::note Physical pixel coordinates, not logical
All coordinates are in **physical screen pixels** as reported by Windows. On high-DPI displays, these are the raw pixel values, not the logical or scaled coordinates your Electron app may use internally. If your app runs with a DPI scale factor other than 100%, you may need to divide by the scale factor before comparing with Electron's `screen` API values.
:::

:::note Consistency guarantee
The `width` and `height` fields are always exactly equal to `right - left` and `bottom - top` respectively. The native module computes them in the same call that produces the edge values, so you can rely on them without performing your own arithmetic or worrying about rounding differences.
:::

:::note Coordinate origin on multi-monitor setups
On a multi-monitor setup, the primary monitor's top-left corner is typically `(0, 0)`, but secondary monitors can have negative `left` or `top` values (e.g., a monitor positioned to the left of the primary). Always treat coordinates as signed integers.
:::

## Danger Avoidance

:::danger Do not assume coordinates are zero-based or within a single screen
The `left` and `top` values are absolute screen coordinates across the entire virtual desktop. On multi-monitor setups, `left` can be negative (for monitors to the left of the primary) or exceed the primary monitor's resolution. **Never** use `NativeRect` values as array indices, and **never** assume the origin is `(0, 0)`.
:::

:::danger Do not use NativeRect for hit-testing without DPI awareness
If you compare a `NativeRect` against mouse coordinates from Electron's `screen.getCursorScreenPoint()`, be aware that Electron returns **logical** (scaled) coordinates on high-DPI systems, while `NativeRect` values are **physical** pixels. Failing to account for the DPI scale factor will cause your hit-test to miss by the scale factor, producing incorrect results on any display above 100% scaling.
:::
