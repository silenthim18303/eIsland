---
title: PaymentPricingConfigMapper
---

# PaymentPricingConfigMapper

:::info
MyBatis mapper interface for payment pricing configuration CRUD.
:::

## Overview

`PaymentPricingConfigMapper` provides database access for the singleton `PaymentPricingConfig` entity (id = 1). It supports select, insert, and full update operations for pricing and plan feature data.

## Methods

| Method | Return Type | Description |
|---|---|---|
| `selectById(id)` | PaymentPricingConfig | Load pricing config by ID |
| `insert(config)` | int | Insert a new pricing config row |
| `update(id, proMonthAmountFen, freeDesc, freeFeaturesText, proDesc, proFeaturesText, updatedAt)` | int | Update all pricing fields |

## Parameters

### update

| Param | Type | Description |
|---|---|---|
| `id` | Long | Config ID (always 1) |
| `proMonthAmountFen` | Integer | Pro month price in fen |
| `freeDesc` | String | Free plan description |
| `freeFeaturesText` | String | Free plan features (newline-separated) |
| `proDesc` | String | Pro plan description |
| `proFeaturesText` | String | Pro plan features (newline-separated) |
| `updatedAt` | LocalDateTime | Current timestamp |

:::tip
This mapper always operates on a singleton row with `id = 1`. The row is auto-created by `PaymentService` if it does not exist.
:::
