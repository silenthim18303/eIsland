---
title: UploadRateLimiter
---

# UploadRateLimiter

:::info
Redis-based dual-scope rate limiter for user avatar uploads, enforcing limits by both IP and account.
:::

## Overview

`UploadRateLimiter` enforces upload frequency limits using Redis INCR+EXPIRE counters. It tracks attempts independently by IP address and account name, blocking uploads when either scope exceeds the threshold.

## Rate Limit Rules

| Scope | Max Attempts | Window | Redis Key Pattern |
|---|---|---|---|
| IP | 3 | 1 hour | `upload:limit:user-avatar:ip:{ip}` |
| Account | 3 | 1 hour | `upload:limit:user-avatar:account:{account}` |

## Methods

| Method | Description |
|---|---|
| `recordUserAvatarUploadAttempt(ip, account)` | Increment counters and return rate limit result |

## Result Record

| Field | Type | Description |
|---|---|---|
| `blocked` | `boolean` | Whether the request is blocked |
| `scope` | `String` | Blocking scope: `"ip"`, `"account"`, or `""` (allowed) |
| `retryAfterSeconds` | `long` | Seconds until the rate limit window expires |

## Evaluation Order

```
1. Check IP counter → if exceeded, return blockedByIp
2. Check account counter → if exceeded, return blockedByAccount
3. Both under limit → return allowed
```

:::tip
Redis failures during rate limiting are fail-open (return 0 / allowed) to avoid blocking legitimate uploads due to infrastructure issues.
:::
