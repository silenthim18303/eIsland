---
watermark: true
title: isAnyFullscreenWindow
icon: fa6-solid:code
---

# isAnyFullscreenWindow

:::info
Quick boolean check for any fullscreen window. More efficient than calling getFullscreenWindows().length > 0.
:::

## Signature

```typescript
function isAnyFullscreenWindow(): boolean
```

## Return Value

`true` if at least one window is fullscreen, `false` otherwise.

:::tip
This is more efficient than `getFullscreenWindows().length > 0` as it returns early on the first match.
:::

## Example

```typescript
import { isAnyFullscreenWindow } from '@eisland/windows-fullscreen-detector';

// Quick check — useful for toggling overlay visibility
if (isAnyFullscreenWindow()) {
  console.log('A window is fullscreen — hiding overlay');
} else {
  console.log('No fullscreen window — showing overlay');
}
```
