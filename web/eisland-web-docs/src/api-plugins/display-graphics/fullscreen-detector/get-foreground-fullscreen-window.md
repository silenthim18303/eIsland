---
watermark: true
title: getForegroundFullscreenWindow
icon: fa6-solid:code
---

# getForegroundFullscreenWindow

:::info
Returns the foreground window if it is currently in fullscreen mode.
:::

## Signature

```typescript
function getForegroundFullscreenWindow(): FullscreenWindowInfo | null
```

## Return Value

[FullscreenWindowInfo](fullscreen-window-info.md) object, or `null` if the foreground window is not fullscreen.

```typescript
// Example return value
{
  hwnd: '00000000001A0B2C',
  title: 'Cyberpunk 2077',
  processId: 12345,
  bounds: { left: 0, top: 0, right: 2560, bottom: 1440, width: 2560, height: 1440 },
  monitor: { left: 0, top: 0, right: 2560, bottom: 1440, width: 2560, height: 1440, isPrimary: true },
  isForeground: true,
}
```

:::tip
Returns `null` if the foreground window is not fullscreen. Use [isAnyFullscreenWindow()](is-any-fullscreen-window.md) for a quick boolean check.
:::

## Example

```typescript
import { getForegroundFullscreenWindow } from '@eisland/windows-fullscreen-detector';

const win = getForegroundFullscreenWindow();
if (win) {
  console.log(`Foreground fullscreen: "${win.title}"`);
  console.log(`  Process: ${win.processId}`);
  console.log(`  Size: ${win.bounds.width}×${win.bounds.height}`);
} else {
  console.log('No fullscreen window in foreground');
}
```
