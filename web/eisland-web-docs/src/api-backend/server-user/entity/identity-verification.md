---
title: IdentityVerification
---

# IdentityVerification

:::info
Entity representing a real-name identity verification record linked to the Alipay FACE certification flow.
:::

## Overview

Each record tracks one identity verification attempt. Personal information (name and ID number) is stored as AES-256-GCM ciphertext. The record progresses through status states from INIT to either PASSED or FAILED.

## Status Constants

| Constant | Value | Description |
|---|---|---|
| `STATUS_INIT` | `"INIT"` | Initial state |
| `STATUS_CERTIFYING` | `"CERTIFYING"` | Certification in progress (user redirected to Alipay) |
| `STATUS_PASSED` | `"PASSED"` | Verification successful |
| `STATUS_FAILED` | `"FAILED"` | Verification failed |

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `username` | `String` | Associated user |
| `outerOrderNo` | `String` | Merchant order number (format: `IDV` + timestamp + UUID suffix) |
| `certifyId` | `String` | Alipay-issued certification ID |
| `certNameCiphertext` | `String` | AES-256-GCM encrypted real name (Base64) |
| `certNoCiphertext` | `String` | AES-256-GCM encrypted ID number (Base64) |
| `status` | `String` | Current verification status |
| `materialInfoUrl` | `String` | Object storage URL for facial material JSON |
| `createdAt` | `LocalDateTime` | Record creation time |
| `updatedAt` | `LocalDateTime` | Last status update time |
