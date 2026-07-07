---
title: TotpSecurityService
---

# TotpSecurityService

:::info
`@Service` implementing TOTP (RFC 6238) verification with AES-256-GCM encrypted seed storage, rate limiting, failure lockout, and replay protection.
:::

## Overview

Provides a complete TOTP security layer. Seeds are encrypted at rest with AES-256-GCM and cached in Redis for performance. Verification includes per-user and per-IP rate limiting, configurable failure lockout windows, and replay detection.

## Key Methods

| Method | Description |
|---|---|
| `verifyTotpOrMessage(username, clientIp, code)` | Validate a 6-digit TOTP code; returns `null` on success or error message string |
| `getOrCreateTotpSeedForClient(username)` | Get or auto-generate Base32 seed for client QR code setup |
| `rotateTotpSeedForClient(username)` | Force-rotate seed; invalidates old authenticator app binding |

## Security Parameters

| Parameter | Env Key | Default | Description |
|---|---|---|---|
| TOTP Digits | (constant) | `6` | OTP digit count |
| TOTP Period | (constant) | `30s` | Time step in seconds |
| Window Steps | (constant) | `1` | Adjacent time steps checked (+/-1) |
| Fail Max Attempts | `TOTP_FAIL_MAX_ATTEMPTS` | `5` | Max failures before lockout |
| Fail Window | `TOTP_FAIL_WINDOW_SECONDS` | `600` | Lockout window in seconds |
| User Rate Limit | `TOTP_RATE_LIMIT_USER_PER_MINUTE` | `30` | Max verifications per user per window |
| IP Rate Limit | `TOTP_RATE_LIMIT_IP_PER_MINUTE` | `60` | Max verifications per IP per window |
| Rate Window | `TOTP_RATE_WINDOW_SECONDS` | `60` | Rate limit window in seconds |
| Replay Protect | `TOTP_REPLAY_PROTECT_SECONDS` | `120` | Same code cannot be reused within this window |
| Decrypted Cache | `TOTP_DECRYPTED_SECRET_CACHE_SECONDS` | `60` | Plaintext seed Redis TTL |
| Encrypted Cache | `TOTP_ENCRYPTED_SECRET_CACHE_SECONDS` | `86400` | Encrypted seed Redis TTL |

## Redis Key Schema (prefix `totp:security:`)

| Key Pattern | Purpose |
|---|---|
| `rate:user:{username}` | Per-user rate limit counter |
| `rate:ip:{clientIp}` | Per-IP rate limit counter |
| `fail:{username}` | Failure count for lockout |
| `replay:{username}:{counter}:{code}` | Replay protection token |
| `secret:plain:{username}` | Decrypted Base32 seed cache |
| `secret:enc:{username}` | Encrypted seed cache |

## Encryption

- Algorithm: AES-256-GCM (12-byte IV, 128-bit tag)
- Key source: `TOTP_AES_KEY_BASE64` (Base64-encoded 32-byte key)
- IV prepended to ciphertext before Base64 encoding

## Dependencies

- `totpSecurityRedisTemplate` -- all Redis operations
- `UserService` -- user lookup and TOTP secret persistence
