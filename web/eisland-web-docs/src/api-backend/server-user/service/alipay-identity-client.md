---
title: AlipayIdentityClient
---

# AlipayIdentityClient

:::info
`@Component` wrapping the Alipay identity verification SDK with three core operations: initialize, certify (get URL), and query result.
:::

## Overview

Encapsulates all Alipay `alipay.user.certify.open.*` API calls. Reads private/public keys from PEM files on each request, strips headers, and constructs a `DefaultAlipayClient` instance.

## Methods

| Method | Description |
|---|---|
| `isAvailable()` | Returns `true` if `AlipayIdentityProperties.isConfigured()` |
| `initialize(outerOrderNo, certName, certNo)` | Call `alipay.user.certify.open.initialize` with `FACE` biz code; returns `certifyId` |
| `certify(certifyId)` | Call `alipay.user.certify.open.certify` (page-execute GET); returns certification URL |
| `query(certifyId)` | Call `alipay.user.certify.open.query`; returns pass/fail and optional `materialInfo` |

## Records

| Record | Fields | Description |
|---|---|---|
| `InitializeResult` | `certifyId` | Alipay-issued certification ID |
| `CertifyResult` | `certifyUrl` | URL for frontend to redirect user to Alipay |
| `QueryResult` | `passed`, `subCode`, `subMsg`, `materialInfo` | Query result with optional facial material JSON |

## Configuration

All configuration comes from `AlipayIdentityProperties` (prefix `identity.alipay`).

| Property | Used For |
|---|---|
| `appId` | Application identification |
| `privateKeyPath` | RSA2 private key file for signing |
| `publicKeyPath` | Alipay public key file for verification |
| `gatewayUrl` | API endpoint |
| `returnUrl` | Post-certification redirect URL |
| `signType` / `charset` | Signing configuration |

## Dependencies

- `AlipayIdentityProperties` -- configuration binding
- Alipay SDK (`com.alipay.api`) -- API execution
