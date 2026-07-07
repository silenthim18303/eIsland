---
title: PaymentRedisConfig
---

# PaymentRedisConfig

:::info
Redis DB10 configuration for the payment domain.
:::

## Overview

`PaymentRedisConfig` creates a dedicated `LettuceConnectionFactory` and `StringRedisTemplate` bean for the payment module, isolated on Redis DB 10 by default. This prevents key collisions with other modules.

## Configuration

| Property | Env Variable | Default | Description |
|---|---|---|---|
| Host | `REDIS_HOST` | 127.0.0.1 | Redis server host |
| Port | `REDIS_PORT` | 6379 | Redis server port |
| Password | `REDIS_PASSWORD` | (empty) | Redis authentication password |
| Database | `REDIS_PAYMENT_DATABASE` | 10 | Redis DB number for payment |

## Beans

| Bean Name | Type | Description |
|---|---|---|
| `paymentRedisConnectionFactory` | `LettuceConnectionFactory` | Dedicated connection factory for payment DB |
| `paymentRedisTemplate` | `StringRedisTemplate` | Redis template injected into payment services |

## Key Patterns

| Key Pattern | TTL | Purpose |
|---|---|---|
| `payment:pricing:pro-month:amount-fen` | None | Pro month pricing cache |
| `payment:pricing:free:desc` | None | Free plan description |
| `payment:pricing:free:features` | None | Free plan features |
| `payment:pricing:pro:desc` | None | Pro plan description |
| `payment:pricing:pro:features` | None | Pro plan features |
| `payment:order:channel:{outTradeNo}` | 30 days | Order payment channel mapping |
| `payment:order:receipt-email:{outTradeNo}` | Order expire + 60 min | Receipt email binding |
| `payment:notify:done:{channel}:{outTradeNo}:{txId}` | 30 days | Notify deduplication |
| `payment:user:active-order:{username}` | Order expire + 5 min | Active order lock per user |
| `payment:order:op-lock:{outTradeNo}` | 15 seconds | Order operation lock |

:::warning
The payment Redis DB is intentionally isolated from the main application DB to avoid interference.
:::
