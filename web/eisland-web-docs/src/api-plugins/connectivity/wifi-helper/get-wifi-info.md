---
watermark: true
title: getWifiInfo
icon: fa6-solid:code
---

# getWifiInfo

:::info Introduction
`getWifiInfo` is a synchronous query function that returns a snapshot of the current WiFi connection status. It reads the system's WiFi adapter state at the instant it is called, providing information such as connection status, SSID, signal strength, and connectivity level. This is a lightweight, non-blocking call suitable for one-time checks — for continuous monitoring, use [WifiMonitor](wifi-monitor.md) instead.
:::

## Signature

```typescript
function getWifiInfo(): WifiInfo | null
```

## Usage

Call `getWifiInfo` when you need a one-time check of the current WiFi state. Common use cases include:

- Displaying the current network status in a UI widget at startup
- Checking connectivity before performing a network-dependent operation
- Logging the WiFi state for diagnostics

:::tip Best Practice
`getWifiInfo` is a synchronous snapshot — it does not block and returns instantly. However, if you need to react to WiFi changes in real time (e.g., updating a UI when the user moves between networks), prefer [WifiMonitor](wifi-monitor.md) which fires events on state changes.
:::

:::note WiFi Adapter Detection
The function queries the system's network adapters for one matching IANA type 71 (wireless LAN). If the system has no WiFi adapter (e.g., a desktop with only Ethernet), the function returns `null`. The `isWifiAdapter` field in the result always indicates whether the detected adapter is a WiFi adapter.
:::

## Return Value

Returns a [WifiInfo](wifi-info.md) object with the current WiFi state, or `null` if no WiFi adapter is present on the system.

```typescript
// Example return value when connected
{
  isConnected: true,                   // WiFi is connected
  ssid: 'MyHomeWiFi',                  // Network name (SSID)
  signalBars: 4,                       // Signal strength: 0-5 bars
  connectivityLevel: 3,                // ConnectivityLevel.InternetAccess
  adapterName: 'Intel Wi-Fi 6E AX211', // Adapter hardware name
  isWifiAdapter: true,                 // Confirmed as WiFi adapter (IANA type 71)
}
```

:::warning Null Return
Returns `null` on systems without a WiFi adapter (e.g., desktop machines with Ethernet only). Always check for `null` before accessing properties on the result to avoid runtime errors.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import { getWifiInfo, ConnectivityLevel } from '@eisland/windows-wifi-helper';

// Query current WiFi connection status
const info = getWifiInfo();

// Handle the case where no WiFi adapter exists
if (!info) {
  console.log('No WiFi adapter found on this system');
} else if (info.isConnected) {
  // Display connection details when connected
  console.log(`Connected to ${info.ssid} (${info.signalBars}/5 bars)`);
  // Check if the connection has full internet access
  if (info.connectivityLevel === ConnectivityLevel.InternetAccess) {
    console.log('Full internet access available');
  }
} else {
  // WiFi adapter exists but is not connected
  console.log('WiFi is disconnected');
}
```

@tab JavaScript

```javascript
const { getWifiInfo, ConnectivityLevel } = require('@eisland/windows-wifi-helper');

// Query current WiFi connection status
const info = getWifiInfo();

// Handle the case where no WiFi adapter exists
if (!info) {
  console.log('No WiFi adapter found on this system');
} else if (info.isConnected) {
  // Display connection details when connected
  console.log(`Connected to ${info.ssid} (${info.signalBars}/5 bars)`);
  // Check if the connection has full internet access
  if (info.connectivityLevel === ConnectivityLevel.InternetAccess) {
    console.log('Full internet access available');
  }
} else {
  // WiFi adapter exists but is not connected
  console.log('WiFi is disconnected');
}
```

:::

## Notes

:::note Snapshot Nature
The returned [WifiInfo](wifi-info.md) is a point-in-time snapshot. The WiFi state may change immediately after the call returns. Do not cache the result for extended periods if accuracy matters — call `getWifiInfo` again when you need fresh data.
:::

:::note Connectivity Levels
The `connectivityLevel` field uses the [ConnectivityLevel](connectivity-level.md) enum. A WiFi connection can be active (`isConnected: true`) while having only local access (`connectivityLevel: 1`) or no internet access at all. Always check `connectivityLevel` in addition to `isConnected` when determining if the network is usable.
:::

:::tip Adapter Name
The `adapterName` field contains the hardware name of the WiFi adapter (e.g., `"Intel Wi-Fi 6E AX211"`). This can be useful for diagnostics or displaying adapter-specific information in a settings UI. It is `null` only when no WiFi adapter is detected.
:::

## Danger Avoidance

:::danger Do Not Assume Non-Null
Never access properties on the return value without a `null` check. On systems without a WiFi adapter (virtual machines, Ethernet-only desktops, servers), `getWifiInfo()` returns `null`. Accessing `info.ssid` on a `null` value will throw a `TypeError` and crash your application.
:::

:::danger Do Not Use for Real-Time Monitoring
`getWifiInfo` is designed for one-time queries. Polling it in a loop (e.g., `setInterval(getWifiInfo, 1000)`) is wasteful and will miss rapid state transitions between polls. Use [WifiMonitor](wifi-monitor.md) for real-time monitoring — it hooks into the OS-level `NetworkStatusChanged` event and reacts immediately to changes without polling.
:::
