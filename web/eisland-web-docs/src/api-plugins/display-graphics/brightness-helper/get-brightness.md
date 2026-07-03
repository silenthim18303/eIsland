---
watermark: true
title: getBrightness
icon: fa6-solid:code
---

# getBrightness

:::info
Returns the current screen brightness via WMI query.
:::

## Signature

```typescript
function getBrightness(): BrightnessInfo | null
```

## Return Value

[BrightnessInfo](brightness-info.md) object, or `null` if brightness cannot be read.

:::warning
Returns `null` if the system has no WMI-compatible display or the brightness query fails.
:::

## Example

```typescript
import { getBrightness } from '@eisland/windows-brightness-helper';

const info = getBrightness();
if (info) {
  console.log(`Current brightness: ${info.currentBrightness}%`);
} else {
  console.log('Unable to read brightness — no WMI-compatible display found');
}
```
