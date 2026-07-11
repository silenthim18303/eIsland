---
watermark: true
title: Windows Screenshot Helper
icon: camera
---

# Windows Screenshot Helper

`@eisland/windows-screenshot-helper` · v26.0.0

:::info
Capture the primary display as PNG and enumerate visible windows via .NET Native AOT DLL (koffi FFI).
:::

## API Reference

| Type | Name | Description |
|------|------|-------------|
| Interface | [ScreenshotResult](screenshot-result.md) | Screenshot data structure |
| Interface | [VisibleWindowBounds](visible-window-bounds.md) | Visible window bounding rectangle and metadata |
| Function | [capturePrimaryDisplayPng](capture-primary-display-png.md) | Capture the primary display as PNG |
| Function | [getVisibleWindows](get-visible-windows.md) | Enumerate visible windows and return their bounds |
| Function | [getLastError](get-last-error.md) | Get the last error message from the DLL |

:::tip
All capture operations return `ScreenshotResult | null`. The result contains PNG image data, size, and format. Returns `null` when the capture fails.
:::

:::note
For detailed usage examples with TypeScript and JavaScript code, see the individual function documentation linked above.
:::
