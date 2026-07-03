---
watermark: true
title: BrightnessInfo
icon: fa6-solid:table
---

# BrightnessInfo

:::info
Screen brightness data returned by brightness query functions.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentBrightness` | `number` | Current brightness percentage (0–100) |
| `levels` | `number[] \| null` | Supported brightness levels (0–100), `null` if unavailable |
| `instanceName` | `string \| null` | Display monitor instance name |

:::tip
The `levels` array may be `null` on some displays that do not report supported brightness levels via WMI.
:::

## Example

```typescript
import { getBrightness } from '@eisland/windows-brightness-helper';

const info = getBrightness();
if (info) {
  console.log(`Brightness: ${info.currentBrightness}%`);
  if (info.levels) {
    console.log(`Supported levels: ${info.levels.join(', ')}`);
  }
}
```
