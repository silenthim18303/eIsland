---
title: WechatPayProperties
---

# WechatPayProperties

:::info
WeChat Pay v3 configuration properties bound from `payment.wechat.*`.
:::

## Overview

`WechatPayProperties` is a Spring `@ConfigurationProperties` component that holds all WeChat Pay v3-specific settings including merchant ID, API v3 key, certificate paths, and callback URL. It provides an `isConfigured()` check to verify that all required fields are populated before attempting API calls.

## Configuration Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `payment.wechat.enabled` | boolean | false | Whether WeChat Pay is enabled |
| `payment.wechat.mch-id` | String | - | WeChat Pay merchant ID |
| `payment.wechat.app-id` | String | - | WeChat application ID |
| `payment.wechat.api-v3-key` | String | - | API v3 key for decrypting notifications |
| `payment.wechat.private-key-path` | String | - | Path to merchant private key file (PKCS#8) |
| `payment.wechat.serial-no` | String | - | Merchant certificate serial number |
| `payment.wechat.notify-url` | String | - | Async notification callback URL |
| `payment.wechat.public-key-id` | String | - | Public key ID for signature verification |
| `payment.wechat.public-key-path` | String | - | Path to WeChat public key file |
| `payment.wechat.platform-cert-path` | String | - | Path to platform certificate (fallback for verification) |
| `payment.wechat.order-expire-minutes` | int | 15 | Order expiration time in minutes |
| `payment.wechat.query-pending-batch-size` | int | 100 | Batch size for pending order reconciliation |

## Validation

`isConfigured()` returns `true` only when all of the following are non-blank:

- `enabled` is `true`
- `mchId`
- `appId`
- `apiV3Key`
- `privateKeyPath`
- `serialNo`
- `notifyUrl`

:::tip
The `orderExpireMinutes` controls how long a WeChat Pay native order QR code remains valid.
:::
