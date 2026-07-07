---
title: VerificationRedisConfig
---

# VerificationRedisConfig

:::info
Spring `@Configuration` that defines four dedicated Redis connections and `StringRedisTemplate` instances for verification codes, slider captcha, auth security, and issue feedback rate limiting.
:::

## Overview

Provides isolated Redis connections across four separate databases to prevent key collisions between subsystems. Each subsystem gets its own `LettuceConnectionFactory` and `StringRedisTemplate` bean pair.

## Beans

| Bean Name | Type | Database | Description |
|---|---|---|---|
| `verificationRedisConnectionFactory` | `LettuceConnectionFactory` | DB 2 | Connection factory for email verification codes |
| `verificationRedisTemplate` | `StringRedisTemplate` | DB 2 | Redis template for verification code operations |
| `sliderCaptchaRedisConnectionFactory` | `LettuceConnectionFactory` | DB 4 | Connection factory for slider captcha |
| `sliderCaptchaRedisTemplate` | `StringRedisTemplate` | DB 4 | Redis template for slider captcha operations |
| `authSecurityRedisConnectionFactory` | `LettuceConnectionFactory` | DB 6 | Connection factory for auth security (replay protection) |
| `authSecurityRedisTemplate` | `StringRedisTemplate` | DB 6 | Redis template for auth security operations |
| `issueFeedbackRedisConnectionFactory` | `LettuceConnectionFactory` | DB 8 | Connection factory for issue feedback rate limiting |
| `issueFeedbackRedisTemplate` | `StringRedisTemplate` | DB 8 | Redis template for issue feedback operations |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Host | `REDIS_HOST` | `127.0.0.1` | Redis server hostname |
| Port | `REDIS_PORT` | `6379` | Redis server port |
| Password | `REDIS_PASSWORD` | (empty) | Redis authentication password |
| Verify DB | `REDIS_VERIFY_DATABASE` | `2` | Redis DB index for verification codes |
| Slider Captcha DB | `REDIS_SLIDER_CAPTCHA_DATABASE` | `4` | Redis DB index for slider captcha |
| Auth Security DB | `REDIS_AUTH_SECURITY_DATABASE` | `6` | Redis DB index for auth security |
| Issue Feedback DB | `REDIS_ISSUE_FEEDBACK_DATABASE` | `8` | Redis DB index for issue feedback |

:::tip
The `verificationRedisConnectionFactory` and `verificationRedisTemplate` beans are marked `@Primary` so they serve as the default Redis beans when no qualifier is specified.
:::
