---
watermark: true
title: enableSuppression
icon: fa6-solid:code
---

# enableSuppression

:::info
Enables toast notification suppression. While active, getNotifications() returns an empty array.
:::

## Signature

```typescript
function enableSuppression(): boolean
```

## Return Value

`true` if suppression was enabled, `false` if already enabled.

:::warning
While suppression is active, [getNotifications()](get-notifications.md) returns an empty array. Call [disableSuppression()](disable-suppression.md) to restore normal behavior.
:::
