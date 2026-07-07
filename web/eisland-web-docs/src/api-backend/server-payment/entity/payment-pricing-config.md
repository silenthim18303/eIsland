---
title: PaymentPricingConfig
---

# PaymentPricingConfig

:::info
Singleton entity storing payment pricing and plan feature descriptions.
:::

## Overview

`PaymentPricingConfig` is a singleton entity (always `id = 1`) that stores the Pro month pricing amount and plan descriptions/features for both Free and Pro tiers. It serves as the persistent backing store for pricing data, with Redis and in-memory volatile fields acting as caches.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | Long | Singleton primary key (always 1) |
| `proMonthAmountFen` | Integer | Pro month subscription price in fen |
| `freeDesc` | String | Free plan description text |
| `freeFeaturesText` | String | Free plan features (newline-separated) |
| `proDesc` | String | Pro plan description text |
| `proFeaturesText` | String | Pro plan features (newline-separated) |
| `updatedAt` | LocalDateTime | Last update time |

## Cache Strategy

```
Memory (volatile fields) → Redis → MySQL
```

1. Read: Check Redis → fallback to DB → update Redis and memory
2. Write: Write to DB → update Redis and memory

## Default Values

| Field | Default |
|---|---|
| `proMonthAmountFen` | 1500 (15.00 CNY) |
| `freeDesc` | 基础功能可用，适合轻度日常使用。 |
| `freeFeatures` | 基础灵动岛组件, 常规设置与个性化, 社区公开内容浏览 |
| `proDesc` | 完整高级能力与持续更新支持。 |
| `proFeatures` | 全部 Free 权益, Pro 专属功能与扩展, 优先体验新功能 |

:::warning
The singleton row is auto-created on first read if it does not exist in the database.
:::
