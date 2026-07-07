---
title: AlipayProperties
---

# AlipayProperties

:::info
Alipay payment configuration properties bound from `payment.alipay.*`.
:::

## Overview

`AlipayProperties` is a Spring `@ConfigurationProperties` component that holds all Alipay-specific settings including gateway URL, app credentials, key paths, and callback URLs. It provides an `isConfigured()` check to verify that all required fields are populated before attempting API calls.

## Configuration Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `payment.alipay.enabled` | boolean | false | Whether Alipay payment is enabled |
| `payment.alipay.gateway-url` | String | `https://openapi.alipay.com/gateway.do` | Alipay gateway endpoint |
| `payment.alipay.app-id` | String | - | Alipay application ID |
| `payment.alipay.private-key-path` | String | - | Path to merchant private key file |
| `payment.alipay.public-key-path` | String | - | Path to Alipay public key file |
| `payment.alipay.notify-url` | String | - | Async notification callback URL |
| `payment.alipay.return-url` | String | - | Synchronous return URL after payment |
| `payment.alipay.sign-type` | String | RSA2 | Signature algorithm |
| `payment.alipay.charset` | String | UTF-8 | Character encoding |
| `payment.alipay.query-pending-batch-size` | int | 100 | Batch size for pending order reconciliation |

## Validation

`isConfigured()` returns `true` only when all of the following are non-blank:

- `enabled` is `true`
- `appId`
- `privateKeyPath`
- `publicKeyPath`
- `notifyUrl`

:::tip
The `queryPendingBatchSize` controls how many pending orders are reconciled per scheduled job cycle.
:::
