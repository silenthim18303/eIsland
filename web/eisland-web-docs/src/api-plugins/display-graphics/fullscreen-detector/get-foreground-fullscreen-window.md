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
