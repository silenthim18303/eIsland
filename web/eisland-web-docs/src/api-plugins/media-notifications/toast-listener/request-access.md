---
watermark: true
title: requestAccess
icon: fa6-solid:code
---

# requestAccess

:::info
Requests access to the Windows notification listener. This is a blocking call that waits until the user grants or denies access.
:::

## Signature

```typescript
function requestAccess(): ToastAccessStatus
```

## Return Value

[ToastAccessStatus](toast-access-status.md) indicating the outcome.

:::warning
This is a blocking call. The system may show a permission dialog to the user. Call [getAccessStatus()](get-access-status.md) first to check if access is already granted.
:::
