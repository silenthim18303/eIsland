---
title: AuthRateLimiter
---

# AuthRateLimiter

:::info
Token-bucket rate limiter for authentication endpoints using Redis Lua scripts.
:::

## Overview

Provides per-IP rate limiting for login, registration, and password reset endpoints. Uses Redis Lua scripts for atomic token-bucket operations.

## Rate Limit Tiers

| Endpoint | Limit | Window |
|---|---|---|
| Login | 5 attempts | per minute |
| Registration | 3 attempts | per hour |
| Password Reset | 3 attempts | per hour |
