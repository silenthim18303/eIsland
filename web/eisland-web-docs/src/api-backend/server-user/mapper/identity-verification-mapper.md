---
title: IdentityVerificationMapper
---

# IdentityVerificationMapper

:::info
MyBatis `@Mapper` interface for the identity verification records table.
:::

## Methods

| Method | Return | Description |
|---|---|---|
| `insert(record)` | `int` | Create new verification record |
| `selectByCertifyId(certifyId)` | `IdentityVerification` | Lookup by Alipay certify_id |
| `selectByOuterOrderNo(outerOrderNo)` | `IdentityVerification` | Lookup by merchant order number |
| `selectByUsername(username, limit)` | `List<IdentityVerification>` | List user's records (newest first) |
| `selectLatestPassedByUsername(username)` | `IdentityVerification` | Get user's latest passed verification |
| `updateStatus(certifyId, status, materialInfoUrl, updatedAt)` | `int` | Update verification status and optional material URL |
| `updateMaterialUrl(certifyId, materialInfoUrl, updatedAt)` | `int` | Update material URL only (async upload callback) |
