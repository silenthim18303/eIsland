---
watermark: true
title: Windows Application Icon Helper
icon: icons
---

# Windows Application Icon Helper

`@eisland/windows-application-icon-helper` · v26.0.0

:::info
Extract Windows application and process icons by name, PID, path, or shortcut via .NET NativeAOT DLL (koffi FFI).
:::

## API Reference

| Type | Name | Description |
|------|------|-------------|
| Interface | [IconResult](icon-result.md) | Icon data structure |
| Function | [getIconByProcessName](get-icon-by-process-name.md) | Get icon by running process name |
| Function | [getIconByPid](get-icon-by-pid.md) | Get icon by process ID |
| Function | [getIconByPath](get-icon-by-path.md) | Get icon by executable file path |
| Function | [getIconByShortcutPath](get-icon-by-shortcut-path.md) | Get icon by shortcut (.lnk) path |

:::tip
All functions return `IconResult | null`. The result contains PNG image data, size, and format. Returns `null` when the icon cannot be found or the target doesn't exist.
:::

:::note
For detailed usage examples with TypeScript and JavaScript code, see the individual function documentation linked above.
:::
