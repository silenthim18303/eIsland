---
title: SliderCaptchaService
---

# SliderCaptchaService

:::info
`@Service` implementing a builtin slider captcha with Redis-backed challenge storage, token-bucket rate limiting, and brute-force protection.
:::

## Overview

Manages the slider captcha lifecycle: challenge creation with random target values, Redis-backed challenge storage with TTL, token-bucket rate limiting via Lua scripts, send-sign token verification, and value-based verification with tolerance. Supports per-account and per-IP rate limiting and pending challenge caps.

## Key Methods

| Method | Description |
|---|---|
| `currentConfig()` | Return current captcha configuration (enabled, provider, value range, tolerance, TTL) |
| `createChallenge(account, userIp)` | Generate a random target value, store challenge in Redis, return challenge with captcha sign |
| `consumeSendSign(signToken, account, userIp, challengeId)` | Validate and consume a one-time send-sign token |
| `verify(ticket, randstr, userIp)` | Verify slider answer against stored target with tolerance |

## Records

| Record | Fields | Description |
|---|---|---|
| `CaptchaConfig` | `enabled`, `provider`, `minValue`, `maxValue`, `tolerance`, `challengeTtlSeconds` | Current captcha configuration |
| `CaptchaChallenge` | `challengeId`, `minValue`, `maxValue`, `targetValue`, `tolerance`, `captchaSign` | Challenge returned to client |
| `VerifyResult` | `ok`, `code`, `message` | Verification result |

## Rate Limiting

| Dimension | Default Limit | Window | Key Pattern |
|---|---|---|---|
| Create per account | 12/min | 60s | `verify:slider:rate:create:account:{account}` |
| Create per IP | 24/min | 60s | `verify:slider:rate:create:ip:{ip}` |
| Verify per IP | 60/min | 60s | `verify:slider:rate:verify:ip:{ip}` |
| Verify fail per account | 3 failures | 600s | `verify:slider:fail:account:{account}` |
| Verify fail per IP | 3 failures | 600s | `verify:slider:fail:ip:{ip}` |

## Pending Challenge Caps

| Dimension | Max |
|---|---|
| Per account | 3 |
| Per IP | 5 |

## Token Bucket

Rate limiting uses a Redis Lua script implementing a token bucket algorithm with configurable capacity, refill rate, and TTL.

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Enabled | `captcha.slider.enabled` | `false` | Enable/disable slider captcha |
| Provider | `captcha.slider.provider` | `builtin` | Captcha provider |
| Min Value | `captcha.slider.builtin.min-value` | `0` | Minimum slider value |
| Max Value | `captcha.slider.builtin.max-value` | `100` | Maximum slider value |
| Tolerance | `captcha.slider.builtin.tolerance` | `0` | Acceptable deviation from target |
| Challenge TTL | `captcha.slider.builtin.challenge-ttl-seconds` | `120` | Challenge expiry in seconds |
| Send Sign TTL | `captcha.slider.builtin.send-sign-ttl-seconds` | `120` | Send-sign token expiry |
| Rate Limit Window | `captcha.slider.builtin.rate-limit-window-seconds` | `60` | Token bucket refill window |
| Verify Fail Window | `captcha.slider.builtin.verify-fail-window-seconds` | `600` | Verify failure counter window |

## Custom Exceptions

| Exception | Description |
|---|---|
| `TooManyPendingChallengesException` | Account or IP has too many unresolved challenges |
| `TooManyRequestsException` | Rate limit exceeded; includes `retryAfterSeconds()` |
