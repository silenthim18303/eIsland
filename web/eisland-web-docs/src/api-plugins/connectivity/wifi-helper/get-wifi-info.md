---
watermark: true
title: getWifiInfo
icon: fa6-solid:code
---

# getWifiInfo

:::info
Returns a snapshot of the current WiFi connection status.
:::

## Signature

```typescript
function getWifiInfo(): WifiInfo | null
```

## Return Value

[WifiInfo](wifi-info.md) object, or `null` if no WiFi adapter is present.

:::warning
Returns `null` on systems without a WiFi adapter (e.g., desktop with Ethernet only).
:::
