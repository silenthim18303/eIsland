---
watermark: true
title: getForegroundFullscreenWindow
icon: fa6-solid:code
---

# getForegroundFullscreenWindow

:::info
Checks whether the current foreground window is occupying the entire screen (fullscreen mode) and returns detailed information about it. This is useful for detecting when a user is immersed in a game, video player, or presentation, allowing your application to behave accordingly -- for example, suppressing notifications or reducing background activity. Returns `null` when no foreground fullscreen window is detected.
:::

## Signature

```typescript
function getForegroundFullscreenWindow(): FullscreenWindowInfo | null
```

## Usage

Call this function whenever you need to know if the user is currently focused on a fullscreen application. Typical use cases include:

- **Notification suppression** -- pause or hide toast notifications while the user is gaming or watching a video.
- **Resource throttling** -- reduce background CPU usage when a fullscreen app is detected.
- **UI adaptation** -- change the behavior of your floating widget (e.g., auto-hide) when the user enters fullscreen mode.

:::tip Optimal polling pattern
This function performs a synchronous Win32 API query each time it is called. For continuous monitoring, pair it with [isAnyFullscreenWindow()](is-any-fullscreen-window.md) for a lightweight boolean check first, then call this function only when the boolean check returns `true`. This avoids the heavier query cost on every poll cycle.
:::

:::tip Multi-monitor awareness
The returned object includes a `monitor` field describing which display the fullscreen window occupies. Use `monitor.isPrimary` to distinguish between primary and secondary displays when your application needs to behave differently depending on which screen is being used.
:::

## Return Value

Returns a [FullscreenWindowInfo](fullscreen-window-info.md) object if the foreground window is in fullscreen mode, or `null` otherwise.

A window is considered fullscreen when its bounds exactly match the dimensions of the monitor it resides on.

| Property | Type | Description |
| --- | --- | --- |
| `hwnd` | `string` | Hexadecimal window handle of the fullscreen window |
| `title` | `string` | Window title text |
| `processId` | `number` | PID of the owning process |
| `bounds` | [NativeRect](native-rect.md) | Position and size of the window on screen |
| `monitor` | [NativeMonitorInfo](native-monitor-info.md) | Information about the monitor the window occupies, including whether it is the primary display |
| `isForeground` | `boolean` | Always `true` for results from this function (the window is by definition the foreground window) |

:::warning Null return is normal
A `null` return does not indicate an error -- it simply means the foreground window is not currently in fullscreen mode. Always check for `null` before accessing properties on the result.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import { getForegroundFullscreenWindow } from '@eisland/windows-fullscreen-detector';

// Query the current foreground window for fullscreen status
const win = getForegroundFullscreenWindow();

if (win) {
  // The foreground window is in fullscreen mode
  console.log(`Fullscreen app detected: "${win.title}"`);
  // Log the owning process ID
  console.log(`  Process ID: ${win.processId}`);
  // Log the window dimensions
  console.log(`  Resolution: ${win.bounds.width}x${win.bounds.height}`);
  // Log which monitor it is on
  console.log(`  Monitor: ${win.monitor.isPrimary ? 'Primary' : 'Secondary'}`);
} else {
  // The foreground window is not fullscreen
  console.log('No fullscreen window in foreground');
}
```

@tab JavaScript

```javascript
const { getForegroundFullscreenWindow } = require('@eisland/windows-fullscreen-detector');

// Query the current foreground window for fullscreen status
const win = getForegroundFullscreenWindow();

if (win) {
  // The foreground window is in fullscreen mode
  console.log(`Fullscreen app detected: "${win.title}"`);
  // Log the owning process ID
  console.log(`  Process ID: ${win.processId}`);
  // Log the window dimensions
  console.log(`  Resolution: ${win.bounds.width}x${win.bounds.height}`);
  // Log which monitor it is on
  console.log(`  Monitor: ${win.monitor.isPrimary ? 'Primary' : 'Secondary'}`);
} else {
  // The foreground window is not fullscreen
  console.log('No fullscreen window in foreground');
}
```

:::

## Notes

:::note Foreground only
This function only inspects the **foreground** window. If a fullscreen window exists but is not in the foreground (e.g., another window is layered on top), this function will return `null`. Use [getFullscreenWindows()](get-fullscreen-windows.md) to detect all fullscreen windows across all monitors.
:::

:::note Hexadecimal handle format
The `hwnd` field is returned as a hexadecimal string (e.g., `"00000000001A0B2C"`). If you need to pass it to other Win32 APIs that expect a numeric handle, you will need to parse it accordingly.
:::

:::note Polling interval recommendation
Each call triggers a native Win32 query. In a tight polling loop, prefer a reasonable interval (e.g., 500ms-1000ms) to avoid unnecessary system load.
:::

## Danger Avoidance

:::danger Do not call in a tight loop
Do not call this function in a tight loop without any delay. Each invocation performs a synchronous native Win32 API call (via `GetForegroundWindow` and `GetWindowRect`). Calling it hundreds of times per second will create measurable CPU overhead and may cause UI stuttering in your application. Always throttle calls to a reasonable polling interval.
:::

:::danger Do not cache results
Do not cache the returned `FullscreenWindowInfo` object for extended periods. The fullscreen state can change at any time as the user switches applications or exits fullscreen mode. Always re-query when you need the current state rather than relying on a stale result.
:::

:::danger Environment compatibility
This function relies on Win32 APIs that may behave unexpectedly under Remote Desktop (RDP) sessions, virtual machines, or when accessibility tools are active. If your application's correctness depends on fullscreen detection, test these scenarios before shipping.
:::
