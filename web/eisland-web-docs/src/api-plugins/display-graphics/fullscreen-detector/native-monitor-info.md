---
watermark: true
title: NativeMonitorInfo
icon: fa6-solid:table
---

# NativeMonitorInfo

:::info
`NativeMonitorInfo` describes the physical display monitor on which a fullscreen window resides. It extends [NativeRect](native-rect.md) with a primary-monitor flag, giving you both the screen geometry and monitor identity in a single object. This interface is provided by the `@eisland/windows-fullscreen-detector` package and is returned as part of every [FullscreenWindowInfo](fullscreen-window-info.md) object.
:::

## Interface Introduction

`NativeMonitorInfo` is a data structure you encounter when working with [FullscreenWindowInfo](fullscreen-window-info.md). Every fullscreen window returned by the fullscreen-detector API carries a `monitor` property of this type, so you can determine which display the window occupies and whether that display is the system's primary monitor.

## Usage

You do not create `NativeMonitorInfo` objects yourself. They are provided as part of the response from the fullscreen-detector functions:

- [getFullscreenWindows()](get-fullscreen-windows.md) returns an array of `FullscreenWindowInfo`, each containing a `monitor` field.
- [getForegroundFullscreenWindow()](get-foreground-fullscreen-window.md) returns a single `FullscreenWindowInfo` (or `null`), also with a `monitor` field.
- [isAnyFullscreenWindow()](is-any-fullscreen-window.md) returns only a boolean, but the other two functions let you inspect the monitor details.

Typical workflow: call a fullscreen-detection function, then read `monitor` to learn which display is involved and `monitor.isPrimary` to branch on primary vs. secondary screens.

:::tip Multi-monitor branching
Use `isPrimary` to apply different logic for primary and secondary displays. For example, you might show notifications only on the primary monitor, or adjust overlay positioning differently on ultrawide secondary screens.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isPrimary` | `boolean` | `true` if this monitor is the system's primary display |
| _(inherits)_ | | All properties from [NativeRect](native-rect.md) (`left`, `top`, `right`, `bottom`, `width`, `height`) |

:::note Inherited geometry
The `left`, `top`, `right`, `bottom`, `width`, and `height` values describe the monitor's rectangle in the Windows virtual-screen coordinate space. See [NativeRect](native-rect.md) for full details on each field.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getFullscreenWindows } from '@eisland/windows-fullscreen-detector';

// Retrieve all currently fullscreen windows
const windows = getFullscreenWindows();

for (const win of windows) {
  // Determine whether the window is on the primary monitor
  const label = win.monitor.isPrimary ? 'primary' : 'secondary';

  // Display the monitor dimensions inherited from NativeRect
  console.log(`"${win.title}" on ${label} monitor (${win.monitor.width}x${win.monitor.height})`);
}
```

@tab JavaScript

```js
const { getFullscreenWindows } = require('@eisland/windows-fullscreen-detector');

// Retrieve all currently fullscreen windows
const windows = getFullscreenWindows();

for (const win of windows) {
  // Determine whether the window is on the primary monitor
  const label = win.monitor.isPrimary ? 'primary' : 'secondary';

  // Display the monitor dimensions inherited from NativeRect
  console.log(`"${win.title}" on ${label} monitor (${win.monitor.width}x${win.monitor.height})`);
}
```

:::

## Notes

:::note Source of data
`NativeMonitorInfo` is always populated by the native fullscreen-detector module. You never instantiate it manually. If you need standalone monitor information without a fullscreen window context, use the Windows display APIs exposed by other eIsland plugins.
:::

:::note Coordinate system
The `left`, `top`, `right`, and `bottom` values use the Windows virtual-screen coordinate space. On multi-monitor setups these values can be negative (e.g. a monitor to the left of the primary). See [NativeRect](native-rect.md) for details.
:::

:::tip Checking monitor identity
If you need to compare monitor identity across multiple calls, compare the `left`/`top` coordinate pair rather than relying on `isPrimary`. The primary monitor designation can theoretically change if the user reconfigures their display settings, but the monitor's position in the virtual screen remains stable as long as the physical setup is unchanged.
:::

## Danger Avoidance

:::danger Do not assume a single monitor
Always handle the possibility that `isPrimary` is `false`. Code that blindly assumes the primary monitor will produce wrong layout or incorrect UI positioning when the user has a multi-monitor setup. Branch on `isPrimary` or check `monitor` dimensions explicitly before making display decisions.
:::

:::danger Stale monitor data
Monitor information is a snapshot captured at the moment the detection function was called. If the user connects or disconnects a display, or changes resolution, the previously returned `NativeMonitorInfo` becomes stale. Re-query the fullscreen-detection functions whenever you detect a display-change event rather than caching old results indefinitely.
:::
