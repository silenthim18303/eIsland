---
watermark: true
title: NativeRect
icon: fa6-solid:table
---

# NativeRect

:::info
Rectangle bounds structure representing a window or monitor area.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `left` | `number` | Left edge coordinate (pixels) |
| `top` | `number` | Top edge coordinate (pixels) |
| `right` | `number` | Right edge coordinate (pixels) |
| `bottom` | `number` | Bottom edge coordinate (pixels) |
| `width` | `number` | Width in pixels (`right - left`) |
| `height` | `number` | Height in pixels (`bottom - top`) |

:::note
Coordinates are in screen pixels. `width` and `height` are convenience fields derived from `right - left` and `bottom - top`.
:::

## Example

```typescript
import { getForegroundFullscreenWindow } from '@eisland/windows-fullscreen-detector';

const win = getForegroundFullscreenWindow();
if (win) {
  const { bounds } = win;
  console.log(`Window bounds: ${bounds.width}×${bounds.height}`);
  console.log(`Position: (${bounds.left}, ${bounds.top})`);
}
```
