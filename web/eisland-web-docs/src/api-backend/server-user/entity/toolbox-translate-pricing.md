---
title: ToolboxTranslatePricing
---

# ToolboxTranslatePricing

:::info
Entity representing translation service pricing configuration in the toolbox.
:::

## Overview

Defines per-service pricing for the translation toolbox feature. Prices are specified in fen (1/100 yuan) per million tokens.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `serviceName` | `String` | Translation service identifier |
| `priceFenPerMillion` | `Long` | Price in fen per million tokens |
| `enabled` | `Boolean` | Whether this pricing tier is active |
| `updatedAt` | `LocalDateTime` | Last modification timestamp |

## Database Table

Corresponds to `toolbox_translate_pricing`.
