---
watermark: true
title: FullscreenWindowInfo
icon: fa6-solid:table
---

# FullscreenWindowInfo

:::info
Details about a window that is currently in fullscreen mode.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `hwnd` | `string` | Window handle (hex string) |
| `title` | `string` | Window title text |
| `processId` | `number` | Owning process ID |
| `bounds` | [NativeRect](native-rect.md) | Window bounding rectangle |
| `monitor` | [NativeMonitorInfo](native-monitor-info.md) | Monitor the window occupies |
| `isForeground` | `boolean` | Whether the window is the foreground window |

:::note
The `hwnd` value is a hex string representation of the Win32 window handle (HWND).
:::

## Example

```typescript
import { getFullscreenWindows } from '@eisland/windows-fullscreen-detector';

const windows = getFullscreenWindows();
windows.forEach(win => {
  console.log(`"${win.title}" (PID: ${win.processId})`);
  console.log(`  Foreground: ${win.isForeground}`);
  console.log(`  Monitor: ${win.monitor.width}×${win.monitor.height}`);
});
```
