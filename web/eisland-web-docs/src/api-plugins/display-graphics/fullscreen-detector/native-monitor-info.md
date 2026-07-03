---
watermark: true
title: NativeMonitorInfo
icon: fa6-solid:table
---

# NativeMonitorInfo

:::info
Monitor information including display bounds. Extends [NativeRect](native-rect.md).
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isPrimary` | `boolean` | Whether this is the primary display monitor |
| _(inherits)_ | | All properties from [NativeRect](native-rect.md) |

:::info
Extends [NativeRect](native-rect.md) with monitor identification.
:::

## Example

```typescript
import { getFullscreenWindows } from '@eisland/windows-fullscreen-detector';

const windows = getFullscreenWindows();
for (const win of windows) {
  console.log(`"${win.title}" on ${win.monitor.isPrimary ? 'primary' : 'secondary'} monitor`);
  console.log(`  Monitor: ${win.monitor.width}×${win.monitor.height}`);
}
```
