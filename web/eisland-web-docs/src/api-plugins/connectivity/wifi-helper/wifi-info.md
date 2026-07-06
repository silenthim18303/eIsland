---
watermark: true
title: WifiInfo
icon: fa6-solid:table
---

# WifiInfo

:::info
`WifiInfo` is the core data interface representing a snapshot of the current WiFi connection status. It is returned by the [`getWifiInfo()`](get-wifi-info.md) function and emitted as the payload of all [`WifiMonitor`](wifi-monitor.md) events. Every property on this interface reflects a real-time Windows network state queried through WinRT `NetworkInformation`.
:::

## Interface Introduction

`WifiInfo` is the single data structure you will encounter throughout the `@eisland/windows-wifi-helper` API. Whether you query WiFi status once via [`getWifiInfo()`](get-wifi-info.md) or subscribe to real-time changes via [`WifiMonitor`](wifi-monitor.md), the data you receive is always a `WifiInfo` object.

This interface tells you four key things at a glance:
- **Connection state** -- whether WiFi is connected (`isConnected`) and to which network (`ssid`)
- **Signal quality** -- how strong the connection is (`signalBars`)
- **Internet reachability** -- whether the connection actually reaches the internet (`connectivityLevel`)
- **Adapter identity** -- which hardware adapter is active (`adapterName`, `isWifiAdapter`)

## Usage

You never construct a `WifiInfo` object yourself. It is always provided to you by the API:

- **One-time query**: Call [`getWifiInfo()`](get-wifi-info.md) to get the current status. Returns `null` if no WiFi adapter exists.
- **Continuous monitoring**: Create a [`WifiMonitor`](wifi-monitor.md) instance and listen for events. Every event callback receives a `WifiInfo` payload.

:::tip Recommended pattern
Use [`getWifiInfo()`](get-wifi-info.md) for one-shot checks (e.g., verifying connectivity before a network request). Use [`WifiMonitor`](wifi-monitor.md) when you need to react to changes in real time (e.g., updating a UI indicator).
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | `boolean` | `true` if WiFi is currently connected to a network |
| `ssid` | `string \| null` | The network name (SSID). `null` when disconnected or when the adapter is not WiFi |
| `signalBars` | `number` | Signal strength as a bar count from `0` to `5`. `-1` if no signal information is available |
| `connectivityLevel` | [`ConnectivityLevel`](connectivity-level.md) | Degree of internet access. Maps to the [`ConnectivityLevel`](connectivity-level.md) enum |
| `adapterName` | `string \| null` | The network adapter identifier string (e.g., `'Intel Wi-Fi 6E AX211'`). `null` if no WiFi adapter is present |
| `isWifiAdapter` | `boolean` | `true` if the active adapter is a WiFi adapter (IANA interface type 71). `false` for Ethernet or other adapter types |

:::note
When `isConnected` is `false`, the `ssid` field is always `null`. Do not assume `ssid` is non-null without first checking `isConnected`.
:::

:::note
The `signalBars` value uses Windows signal strength reporting: 0 means very weak, 5 means excellent. A value of `-1` indicates that signal information is not available for the current adapter (e.g., Ethernet connections).
:::

:::tip
The `connectivityLevel` field is the most reliable way to determine actual internet reachability. A WiFi connection with `connectivityLevel` set to `LocalAccess` means you are connected to a router but cannot reach the internet.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import { getWifiInfo } from '@eisland/windows-wifi-helper';

// Query the current WiFi status as a one-time snapshot
const info = getWifiInfo();

// Handle the case where no WiFi adapter exists
if (!info) {
  console.log('No WiFi adapter found on this system');
} else if (info.isConnected) {
  // Display connection details when connected
  console.log(`Connected to: ${info.ssid}`);
  console.log(`Signal strength: ${info.signalBars}/5 bars`);
  console.log(`Adapter: ${info.adapterName}`);
  console.log(`Internet access level: ${info.connectivityLevel}`);
} else {
  // WiFi adapter exists but is not connected
  console.log('WiFi is disconnected');
}
```

@tab JavaScript

```js
const { getWifiInfo } = require('@eisland/windows-wifi-helper');

// Query the current WiFi status as a one-time snapshot
const info = getWifiInfo();

// Handle the case where no WiFi adapter exists
if (!info) {
  console.log('No WiFi adapter found on this system');
} else if (info.isConnected) {
  // Display connection details when connected
  console.log(`Connected to: ${info.ssid}`);
  console.log(`Signal strength: ${info.signalBars}/5 bars`);
  console.log(`Adapter: ${info.adapterName}`);
  console.log(`Internet access level: ${info.connectivityLevel}`);
} else {
  // WiFi adapter exists but is not connected
  console.log('WiFi is disconnected');
}
```

:::

## Notes

:::note
The `WifiInfo` object is a snapshot of the network state at the moment it was queried or emitted. It does not update in place. To track changes over time, use the [`WifiMonitor`](wifi-monitor.md) class which emits a fresh `WifiInfo` on every state change.
:::

:::note
The `connectivityLevel` property uses the [`ConnectivityLevel`](connectivity-level.md) enum. A value of `ConstrainedInternetAccess` (2) typically indicates a captive portal (e.g., a hotel or airport WiFi login page) where you must complete authentication before gaining full internet access.
:::

:::tip
If you only care about whether the device can reach the internet, check `connectivityLevel === ConnectivityLevel.InternetAccess` rather than relying solely on `isConnected`. A device can be "connected" to WiFi without actual internet access.
:::

## Danger Avoidance

:::danger
Do not access `ssid` without checking `isConnected` first. When `isConnected` is `false`, `ssid` is `null`. Dereferencing it (e.g., `info.ssid.length`) without a null check will throw a `TypeError` at runtime.
:::

:::danger
Do not assume `adapterName` is non-null. On systems with no WiFi hardware (e.g., a desktop with only Ethernet), `getWifiInfo()` returns `null` entirely. If you obtained a `WifiInfo` from a [`WifiMonitor`](wifi-monitor.md) event, `adapterName` may still be `null` if the WiFi adapter was removed or disabled while the monitor was running.
:::
