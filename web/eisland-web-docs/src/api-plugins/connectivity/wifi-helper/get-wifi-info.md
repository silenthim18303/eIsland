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

```typescript
// Example return value
{
  isConnected: true,
  ssid: 'MyHomeWiFi',
  signalBars: 4,
  connectivityLevel: 3, // ConnectivityLevel.InternetAccess
  adapterName: 'Intel Wi-Fi 6E AX211',
  isWifiAdapter: true,
}
```

:::warning
Returns `null` on systems without a WiFi adapter (e.g., desktop with Ethernet only).
:::

## Example

```typescript
import { getWifiInfo } from '@eisland/windows-wifi-helper';

const info = getWifiInfo();
if (!info) {
  console.log('No WiFi adapter found');
} else if (info.isConnected) {
  console.log(`Connected to ${info.ssid} (${info.signalBars}/5 bars)`);
} else {
  console.log('WiFi is disconnected');
}
```
