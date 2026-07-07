---
title: IdentityMaterialUploadConsumer
---

# IdentityMaterialUploadConsumer

:::info
RabbitMQ `@Component` consumer that asynchronously uploads identity verification facial material to COS/OSS object storage, with retry and dead-letter queue support.
:::

## Overview

Consumes `IdentityMaterialMessage` from the main queue, uploads the facial material JSON to multiple storage providers (COS and OSS), and writes the primary URL back to the database. Failed messages are retried up to 3 times via a retry queue before being routed to the dead-letter queue (DLQ).

## IdentityMaterialMessage

A Java `record` carrying the message payload:

| Field | Type | Description |
|---|---|---|
| `username` | `String` | User whose material is being uploaded |
| `certifyId` | `String` | Alipay certification ID |
| `materialInfo` | `String` | Facial material JSON from Alipay |
| `lastError` | `String` | Error message from previous failed attempt (null on first attempt) |

## Message Flow

```
IdentityVerificationService
    --> RabbitMQ (main queue)
        --> IdentityMaterialUploadConsumer.onMessage()
            --> Upload to COS + OSS
            --> Update DB material_url
            --> On failure: retry queue (up to 3x)
                --> On exhausted: DLQ
                    --> IdentityMaterialUploadConsumer.onDeadLetter() (logging only)
```

## Upload Strategy

| Step | Description |
|---|---|
| 1 | Parse material JSON content |
| 2 | Upload to each target provider (COS, OSS) independently |
| 3 | Use first successful URL as `primaryUrl` |
| 4 | Update `identity_verification.material_info_url` in DB |
| 5 | If all providers fail, throw exception to trigger retry |

## Object Key Format

```
identity-material/{username}/{certifyId}.json
```

## Retry Configuration

| Parameter | Value | Description |
|---|---|---|
| Max Retries | 3 | Hardcoded in consumer |
| Retry Delay | 10,000 ms | Configured on retry queue TTL |
| Retry Header | `x-identity-material-retry-count` | Tracks attempt number |

## DLQ Handling

The `onDeadLetter()` listener logs the failed message with username, certifyId, retry count, and last error. No automatic recovery is performed -- DLQ records require manual investigation.

## Dependencies

- `ObjectStorageRouter` -- multi-provider storage access
- `IdentityVerificationMapper` -- database URL update
- `RabbitTemplate` -- retry and DLQ message routing
