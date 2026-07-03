---
watermark: true
title: ConnectivityLevel
icon: fa6-solid:list
---

# ConnectivityLevel

:::info
Network connectivity level indicating the degree of internet access.
:::

## Values

| Value | Name | Description |
|-------|------|-------------|
| `0` | `None` | No network connection |
| `1` | `LocalAccess` | Local network access only (no internet) |
| `2` | `ConstrainedInternetAccess` | Limited internet access (captive portal) |
| `3` | `InternetAccess` | Full internet access |

:::note
The `ConstrainedInternetAccess` level typically indicates a captive portal (e.g., hotel WiFi login page).
:::

## Example

```typescript
import { getWifiInfo, ConnectivityLevel } from '@eisland/windows-wifi-helper';

const info = getWifiInfo();
if (info) {
  switch (info.connectivityLevel) {
    case ConnectivityLevel.InternetAccess:
      console.log('Full internet access');
      break;
    case ConnectivityLevel.ConstrainedInternetAccess:
      console.log('Captive portal detected — login may be required');
      break;
    case ConnectivityLevel.LocalAccess:
      console.log('Local network only — no internet');
      break;
    case ConnectivityLevel.None:
      console.log('No network connection');
      break;
  }
}
```
