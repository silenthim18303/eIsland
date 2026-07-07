---
title: PaymentChannel
---

# PaymentChannel

:::info
Enum representing supported payment channels with safe string parsing.
:::

## Overview

`PaymentChannel` is a simple enum that defines the two supported payment channels: WeChat Pay and Alipay. It provides a `from(String)` factory method for safe parsing from string values, defaulting to `WECHAT` for null or unrecognized inputs.

## Values

| Value | Description |
|---|---|
| `WECHAT` | WeChat Pay (default) |
| `ALIPAY` | Alipay |

## Methods

| Method | Description |
|---|---|
| `from(String value)` | Parse a string to PaymentChannel, defaulting to WECHAT |

## Usage

```java
PaymentChannel channel = PaymentChannel.from("ALIPAY"); // → ALIPAY
PaymentChannel channel = PaymentChannel.from(null);      // → WECHAT
PaymentChannel channel = PaymentChannel.from("unknown");  // → WECHAT
```

:::tip
The `from()` method is case-insensitive and trims whitespace before parsing.
:::
