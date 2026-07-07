---
title: TranslatePricingRequest
---

# TranslatePricingRequest

:::info
Request DTO for upserting translation pricing.
:::

## Definition

:::details Source — `AdminTmtController.java`
```java
public record TranslatePricingRequest(
    String serviceName,
    long priceFenPerMillion,
    boolean enabled
) {}
```
:::

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `serviceName` | String | Yes | Service identifier (e.g., `tencent-tmt`) |
| `priceFenPerMillion` | Long | Yes | Price per million characters (fen) |
| `enabled` | Boolean | Yes | Whether the service is active |

## Used By

- `PUT /v1/admin/tmt/pricing` — [Upsert TMT Pricing](../admin-tmt-api/upsert-tmt-pricing.md)
