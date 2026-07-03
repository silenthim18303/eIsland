---
watermark: true
title: getFullscreenWindows
icon: fa6-solid:code
---

# getFullscreenWindows

:::info
Returns all windows that are currently in fullscreen mode.
:::

## Signature

```typescript
function getFullscreenWindows(): FullscreenWindowInfo[]
```

## Return Value

Array of [FullscreenWindowInfo](fullscreen-window-info.md) objects. Empty array if no windows are fullscreen.

```typescript
// Example return value
[
  {
    hwnd: '00000000001A0B2C',
    title: 'Cyberpunk 2077',
    processId: 12345,
    bounds: { left: 0, top: 0, right: 2560, bottom: 1440, width: 2560, height: 1440 },
    monitor: { left: 0, top: 0, right: 2560, bottom: 1440, width: 2560, height: 1440, isPrimary: true },
    isForeground: true,
  },
]
```

## Example

```typescript
import { getFullscreenWindows } from '@eisland/windows-fullscreen-detector';

const windows = getFullscreenWindows();
if (windows.length > 0) {
  console.log(`${windows.length} fullscreen window(s):`);
  windows.forEach(w => console.log(`  - "${w.title}" (PID ${w.processId})`));
} else {
  console.log('No fullscreen windows');
}
```
