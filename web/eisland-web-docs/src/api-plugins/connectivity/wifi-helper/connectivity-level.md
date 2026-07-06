---
watermark: true
title: ConnectivityLevel
icon: fa6-solid:list
---

# ConnectivityLevel

:::info
`ConnectivityLevel` is a `const enum` that represents the degree of internet access on the current network connection. It is returned as the `connectivityLevel` field of [`WifiInfo`](./wifi-info.md) from both [`getWifiInfo()`](./get-wifi-info.md) and [`WifiMonitor`](./wifi-monitor.md) events. The four levels progress from no connection (`0`) to full internet access (`3`), following the Windows `NetworkConnectivityLevel` classification.
:::

## Enum Introduction

`ConnectivityLevel` is a numeric enum defined as a TypeScript `const enum`. This means TypeScript compiles the enum member references directly into their numeric values at build time, producing zero runtime overhead. The enum is used throughout the `@eisland/windows-wifi-helper` package to describe how connected the device currently is to a network and whether that network provides internet access.

You will encounter this type in the `connectivityLevel` property of every [`WifiInfo`](./wifi-info.md) object -- whether returned by [`getWifiInfo()`](./get-wifi-info.md) or emitted through [`WifiMonitor`](./wifi-monitor.md) events.

## Values

| Value | Name | Description |
|-------|------|-------------|
| `0` | `None` | No network connection at all |
| `1` | `LocalAccess` | Local network access only (intranet / LAN) -- no route to the internet |
| `2` | `ConstrainedInternetAccess` | Internet access is available but constrained (e.g., a captive portal such as a hotel or airport Wi-Fi login page) |
| `3` | `InternetAccess` | Full, unconstrained internet access |

:::note
The levels are ordered by ascending connectivity. `None` (0) is the weakest and `InternetAccess` (3) is the strongest. You can use numeric comparisons like `if (info.connectivityLevel >= ConnectivityLevel.InternetAccess)` to check for at least a given level.
:::

## Usage

You typically do not instantiate or assign `ConnectivityLevel` values directly. Instead, you read the `connectivityLevel` field from a [`WifiInfo`](./wifi-info.md) object and branch your logic based on its value. The two common patterns are:

1. **One-time check** -- call [`getWifiInfo()`](./get-wifi-info.md) and read `connectivityLevel` from the returned snapshot.
2. **Continuous monitoring** -- listen to [`WifiMonitor`](./wifi-monitor.md) events and react whenever the connectivity level changes.

:::tip
When you only care whether the device has internet access, compare against `ConnectivityLevel.InternetAccess` (3) rather than checking for all other levels individually. This keeps the code concise and forward-compatible.
:::

:::note
Because `ConnectivityLevel` is a `const enum`, TypeScript inlines the member values at compile time. JavaScript consumers should use the raw numeric values (`0`, `1`, `2`, `3`) directly, as there is no runtime enum object to reference.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getWifiInfo, ConnectivityLevel } from '@eisland/windows-wifi-helper';

// Take a one-time snapshot of the current WiFi state
const info = getWifiInfo();

// getWifiInfo() returns null if no WiFi adapter is present
if (info) {
  // Branch on the connectivity level enum
  switch (info.connectivityLevel) {
    case ConnectivityLevel.InternetAccess:
      // Level 3 -- full internet access, safe to make network requests
      console.log('Full internet access');
      break;
    case ConnectivityLevel.ConstrainedInternetAccess:
      // Level 2 -- likely a captive portal; user may need to log in
      console.log('Captive portal detected -- login may be required');
      break;
    case ConnectivityLevel.LocalAccess:
      // Level 1 -- LAN only, no route to the public internet
      console.log('Local network only -- no internet');
      break;
    case ConnectivityLevel.None:
      // Level 0 -- completely offline
      console.log('No network connection');
      break;
  }
}
```

@tab JavaScript

```js
const { getWifiInfo } = require('@eisland/windows-wifi-helper');

// Take a one-time snapshot of the current WiFi state
const info = getWifiInfo();

// getWifiInfo() returns null if no WiFi adapter is present
if (info) {
  // ConnectivityLevel is a const enum -- use raw numeric values in JS
  // 0 = None, 1 = LocalAccess, 2 = ConstrainedInternetAccess, 3 = InternetAccess
  switch (info.connectivityLevel) {
    case 3:
      // Level 3 -- full internet access, safe to make network requests
      console.log('Full internet access');
      break;
    case 2:
      // Level 2 -- likely a captive portal; user may need to log in
      console.log('Captive portal detected -- login may be required');
      break;
    case 1:
      // Level 1 -- LAN only, no route to the public internet
      console.log('Local network only -- no internet');
      break;
    case 0:
      // Level 0 -- completely offline
      console.log('No network connection');
      break;
  }
}
```

:::

::: code-tabs

@tab TypeScript

```ts
import { WifiMonitor, ConnectivityLevel } from '@eisland/windows-wifi-helper';

// Create a real-time WiFi monitor
const monitor = new WifiMonitor();

// React whenever the WiFi state changes
monitor.on('wifi-changed', (info) => {
  // Only proceed when we have full internet connectivity
  if (info.connectivityLevel === ConnectivityLevel.InternetAccess) {
    console.log(`Connected to ${info.ssid} with full internet access`);
  }
});

// Start listening for network status changes
monitor.start();

// Later, when monitoring is no longer needed:
monitor.stop();
```

@tab JavaScript

```js
const { WifiMonitor } = require('@eisland/windows-wifi-helper');

// Create a real-time WiFi monitor
const monitor = new WifiMonitor();

// React whenever the WiFi state changes
monitor.on('wifi-changed', (info) => {
  // ConnectivityLevel.InternetAccess === 3
  if (info.connectivityLevel === 3) {
    console.log(`Connected to ${info.ssid} with full internet access`);
  }
});

// Start listening for network status changes
monitor.start();

// Later, when monitoring is no longer needed:
monitor.stop();
```

:::

## Notes

:::note
`ConstrainedInternetAccess` (2) typically means the device is behind a captive portal -- a Wi-Fi network that requires user authentication or acceptance of terms before granting full access (common in hotels, airports, and coffee shops). The network technically has a route to the internet, but HTTP requests are intercepted and redirected to a login page.
:::

:::tip
If your feature relies on actual internet connectivity (e.g., syncing data, loading remote content), always check for `ConnectivityLevel.InternetAccess` (3) specifically. Do not assume that a non-`None` level means the internet is reachable -- `LocalAccess` and `ConstrainedInternetAccess` will both cause network requests to fail or return unexpected results.
:::

:::note
The numeric values (`0`-`3`) follow the Windows `NetworkConnectivityLevel` enumeration. If you are porting logic from native Win32 or UWP code, the mapping is identical.
:::

## Danger Avoidance

:::danger
Because `ConnectivityLevel` is a TypeScript `const enum`, importing it in a JavaScript file (or in a TypeScript project with `isolatedModules` enabled) will produce a runtime error -- `ConnectivityLevel` is not a real object at runtime. In JavaScript, always use the raw numeric values (`0`, `1`, `2`, `3`). If you need to use the enum by name, ensure `isolatedModules` is **disabled** in your `tsconfig.json`, or define your own local constants as an alias.
:::

:::danger
Do not call [`WifiMonitor.start()`](./wifi-monitor.md) without a corresponding `stop()` call. The monitor registers a native WinRT event listener through DLL FFI. Failing to stop the monitor leaks that listener and keeps a handle open to the system network status callback, which can prevent clean process exit and accumulate resource leaks in long-running applications.
:::
