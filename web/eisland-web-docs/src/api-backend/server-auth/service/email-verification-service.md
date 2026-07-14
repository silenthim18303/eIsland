---
title: EmailVerificationService
---

# EmailVerificationService

:::info
`@Service` that orchestrates email verification code generation, multi-layer rate limiting, SHA-256 hashed storage, and async dispatch via RabbitMQ.
:::

## Overview

Manages the full email verification lifecycle: code generation with cryptographic hashing, multi-dimensional rate limiting (cooldown, IP hourly, email hourly, email daily), verification with brute-force protection, and DLQ log management. Codes are stored as SHA-256 hashes (with pepper) in Redis and dispatched asynchronously via RabbitMQ.

## Scenes

| Scene | Description |
|---|---|
| `REGISTER` | Account registration |
| `LOGIN` | Email-based login |
| `RESET_PASSWORD` | Password reset |
| `CHANGE_EMAIL` | Email address change |
| `UNREGISTER` | Account deletion |
| `BIND_EMAIL` | Email binding for OAuth (WeChat) |

## Key Methods

| Method | Description |
|---|---|
| `sendCode(SendCodeCommand)` | Generate a 6-digit code, hash it, store in Redis, publish to MQ for email dispatch |
| `verifyCode(VerifyCodeCommand)` | Verify a code against the stored hash; supports one-time consumption |
| `logDispatchDlq(traceId, email, scene, retryCount, errorMessage)` | Persist a DLQ log entry to MySQL |
| `adminListDispatchDlq(traceId, email, limit)` | Admin query of DLQ logs (max 200) |

## Records

| Record | Fields | Description |
|---|---|---|
| `SendCodeCommand` | `email`, `scene`, `clientIp` | Send code request parameters |
| `VerifyCodeCommand` | `email`, `scene`, `code`, `consume` | Verify code request parameters |
| `SendCodeResult` | `ok`, `code`, `message`, `retryAfterSeconds` | Send code result |
| `VerifyCodeResult` | `ok`, `code`, `message` | Verify code result |

## Rate Limiting

| Dimension | Limit | Window | Key Pattern |
|---|---|---|---|
| Per email+scene cooldown | 1 request | 60 seconds | `verify:cooldown:{scene}:{email}` |
| Per IP | 3 requests | 1 hour | `verify:rate:ip:{ip}` |
| Per email (hourly) | 3 requests | 1 hour | `verify:rate:email:hour:{email}` |
| Per email (daily) | 30 requests | Until end of day (UTC+8) | `verify:rate:email:day:{email}` |
| Verify attempts | 5 failures | Code TTL (5 min) | `verify:attempts:{scene}:{email}` |

## Security

| Feature | Implementation |
|---|---|
| Code Storage | SHA-256 hash with configurable pepper (`VERIFY_CODE_PEPPER`) |
| Hash Input | `{pepper}|{scene}|{email}|{code}` |
| Code Length | 6 digits |
| Code TTL | 5 minutes |
| Brute-force Lock | 5 failed attempts invalidates the code |

## Dependencies

- `verificationRedisTemplate` -- rate limiting and code storage
- `RabbitTemplate` -- async email dispatch
- `EmailDispatchDlqLogMapper` -- DLQ log persistence

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Verify Code Pepper | `VERIFY_CODE_PEPPER` | `pyisland-verify-pepper` | Secret pepper for SHA-256 hashing |
