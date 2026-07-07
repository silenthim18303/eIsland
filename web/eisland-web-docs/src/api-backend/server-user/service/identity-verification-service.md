---
title: IdentityVerificationService
---

# IdentityVerificationService

:::info
`@Service` orchestrating Alipay-based real-name identity verification with AES-256-GCM encrypted storage, rate limiting, and async material upload via RabbitMQ.
:::

## Overview

Manages the full identity verification lifecycle: initialization, certification URL generation, result querying, encrypted PII storage, and facial material upload to object storage. Uses Redis for per-user rate limiting and verified-status caching.

## Key Methods

| Method | Description |
|---|---|
| `startVerification(username, certName, certNo)` | Initialize Alipay certification, encrypt and store PII, return `certifyUrl` for frontend redirect |
| `queryAndUpdate(username, certifyId)` | Query Alipay for result; update DB status; publish material upload if passed |
| `isVerified(username)` | Check if user has a passed verification (Redis-cached, 1-hour TTL) |
| `listRecords(username, limit)` | List user's verification records (max 50) |
| `getIdentityInfo(username)` | Admin: decrypt name, mask ID number (first 4 + last 4) |

## Records

| Record | Fields | Description |
|---|---|---|
| `StartResult` | `certifyId`, `certifyUrl`, `outerOrderNo` | Returned after successful initialization |
| `VerifyResult` | `passed`, `message` | Returned after query |
| `IdentityInfo` | `certName`, `maskedCertNo`, `status`, `verifiedAt`, `updatedAt` | Admin view of identity info |

## Security

| Feature | Implementation |
|---|---|
| PII Encryption | AES-256-GCM with random 12-byte IV; key from `IDENTITY_AES_KEY_BASE64` (32 bytes) |
| Rate Limiting | 3 attempts per 5-minute window per user (Redis counter) |
| Verified Cache | 1-hour TTL on `identity:verified:{username}` key |
| Order Number | Format: `IDV` + `yyyyMMddHHmmss` + 8-char UUID suffix |

## Material Upload Flow

1. On passed verification, Alipay returns `materialInfo` (facial photo JSON).
2. Service publishes `IdentityMaterialMessage` to RabbitMQ (`eisland.identity.material.exchange`).
3. `IdentityMaterialUploadConsumer` asynchronously uploads to COS/OSS and writes URL back to DB.

## Dependencies

- `AlipayIdentityClient` -- Alipay SDK calls
- `IdentityVerificationMapper` -- database access
- `RabbitTemplate` -- async material upload publishing
- `identityRedisTemplate` -- rate limiting and verified caching
