---
watermark: true
title: getPowerInfo
icon: fa6-solid:code
---

# getPowerInfo

:::info
Returns a snapshot of the current power status.
:::

## Signature

```typescript
function getPowerInfo(): PowerInfo | null
```

## Return Value

[PowerInfo](power-info.md) object, or `null` if power info cannot be read.

:::warning
Returns `null` if the power status cannot be read from the system.
:::
