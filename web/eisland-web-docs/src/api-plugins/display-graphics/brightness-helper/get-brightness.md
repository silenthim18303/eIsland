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
