---
title: WechatPayNotifyService
---

# WechatPayNotifyService

:::info
WeChat Pay v3 notification signature verification, AES-GCM decryption, and parsing service.
:::

## Overview

`WechatPayNotifyService` handles incoming WeChat Pay v3 async notifications. It verifies the SHA256withRSA signature against the WeChat public key or platform certificate, decrypts the AES-GCM encrypted resource payload using the API v3 key, and parses the transaction data into a structured `NotifyData` record.

## Methods

| Method | Description |
|---|---|
| `parse(body, timestamp, nonce, signature, serial)` | Parse and verify a WeChat Pay notification |

## NotifyData Record

| Field | Type | Description |
|---|---|---|
| `notifyId` | String | Notification ID from WeChat |
| `eventType` | String | Event type (e.g. `TRANSACTION.SUCCESS`) |
| `outTradeNo` | String | Merchant order number |
| `transactionId` | String | WeChat transaction ID |
| `tradeState` | String | Trade state (e.g. `SUCCESS`) |
| `successTime` | OffsetDateTime | Payment success time |
| `verifyOk` | boolean | Whether signature verification passed |
| `rawBody` | String | Raw notification body |

| Helper Method | Description |
|---|---|
| `success()` | Returns `true` if tradeState is `SUCCESS` |

## Verification Logic

```
1. Build sign message: timestamp + "\n" + nonce + "\n" + body + "\n"
2. If publicKeyPath is configured:
   a. Verify serial matches configured publicKeyId
   b. Verify signature against loaded public key
3. Else if platformCertPath is configured:
   a. Load X.509 certificate
   b. Verify signature against certificate public key
4. Else: reject (return false)
```

## Decryption

The encrypted `resource` field is decrypted using AES-256-GCM:

| Parameter | Source |
|---|---|
| Key | `WechatPayProperties.apiV3Key` (32 bytes) |
| Nonce | `resource.nonce` field |
| AAD | `resource.associated_data` field |
| Ciphertext | `resource.ciphertext` field (Base64) |

:::warning
If neither `publicKeyPath` nor `platformCertPath` is configured, all notifications are rejected with a logged error.
:::
