---
watermark: true
title: startListening
icon: fa6-solid:code
---

# startListening

:::info
Starts listening for notification changes. The callback is invoked from a background poll thread via a thread-safe bridge.
:::

## Signature

```typescript
function startListening(callback: ToastNotificationChangedCallback): boolean
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | [ToastNotificationChangedCallback](toast-notification-changed-event.md) | Function called on each notification change |

## Return Value

`true` if listening started, `false` if already listening.

:::note
The callback is invoked from a background poll thread via a thread-safe bridge. Only one listener can be active at a time.
:::
