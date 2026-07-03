---
watermark: true
title: WifiInfo
icon: fa6-solid:table
---

# WifiInfo

:::info
WiFi connection status data returned by query functions and monitor events.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | `boolean` | Whether WiFi is currently connected |
| `ssid` | `string \| null` | Network name (SSID), `null` when disconnected |
| `signalBars` | `number` | Signal strength 0–5 bars, `-1` if unavailable |
| `connectivityLevel` | [ConnectivityLevel](connectivity-level.md) | Degree of internet access |
| `adapterName` | `string \| null` | Network adapter ID, `null` if no WiFi adapter |
| `isWifiAdapter` | `boolean` | Whether the adapter is WiFi (IANA type 71) |

:::note
The `connectivityLevel` field uses the [ConnectivityLevel](connectivity-level.md) enum to indicate the degree of internet access.
:::
