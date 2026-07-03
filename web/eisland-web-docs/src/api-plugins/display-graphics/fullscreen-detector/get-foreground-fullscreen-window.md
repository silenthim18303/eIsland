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
