---
watermark: true
title: getAccessStatus
icon: fa6-solid:code
---

# getAccessStatus

:::info
Returns the current notification listener access status without prompting the user.
:::

## Signature

```typescript
function getAccessStatus(): ToastAccessStatus
```

## Return Value

[ToastAccessStatus](toast-access-status.md).

## Example

```typescript
import { getAccessStatus } from '@eisland/windows-toast-listener';

const status = getAccessStatus();
console.log(`Notification access: ${status}`);
// "allowed" | "denied" | "unspecified" | "unknown"
```
