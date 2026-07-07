---
title: AlipayIdentityProperties
---

# AlipayIdentityProperties

:::info
A `@ConfigurationProperties` component that binds Alipay identity verification SDK configuration from the `identity.alipay` prefix.
:::

## Overview

Holds the credentials and endpoints required to integrate with Alipay's real-name identity verification (FACE) service. Reuses the Alipay payment application's appId, private key, and public key, with a dedicated `returnUrl` for identity flow.

## Properties

| Field | YAML Key | Default | Description |
|---|---|---|---|
| `enabled` | `identity.alipay.enabled` | `false` | Master switch for the identity verification feature |
| `gatewayUrl` | `identity.alipay.gateway-url` | `https://openapi.alipay.com/gateway.do` | Alipay API gateway URL |
| `appId` | `identity.alipay.app-id` | (empty) | Alipay application ID |
| `privateKeyPath` | `identity.alipay.private-key-path` | (empty) | File path to the RSA2 private key (PEM) |
| `publicKeyPath` | `identity.alipay.public-key-path` | (empty) | File path to the Alipay public key (PEM) |
| `signType` | `identity.alipay.sign-type` | `RSA2` | Signature algorithm |
| `charset` | `identity.alipay.charset` | `UTF-8` | Character encoding |
| `returnUrl` | `identity.alipay.return-url` | (empty) | Callback URL after identity verification completes |

## Methods

| Method | Return | Description |
|---|---|---|
| `isConfigured()` | `boolean` | Returns `true` when `enabled` is true **and** `appId`, `privateKeyPath`, `publicKeyPath` are all non-blank |
