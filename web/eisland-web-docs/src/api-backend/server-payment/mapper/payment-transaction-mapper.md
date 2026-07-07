---
title: PaymentTransactionMapper
---

# PaymentTransactionMapper

:::info
MyBatis mapper interface for payment transaction persistence.
:::

## Overview

`PaymentTransactionMapper` provides a single `insertIgnore` method for inserting payment transaction records. The `INSERT IGNORE` semantics ensure that duplicate transaction records from repeated payment provider notifications are silently skipped.

## Methods

| Method | Return Type | Description |
|---|---|---|
| `insertIgnore(tx)` | int | Insert a transaction record, ignoring duplicates |

## Parameters

| Param | Type | Description |
|---|---|---|
| `tx` | PaymentTransaction | Transaction entity to insert |

:::tip
The `INSERT IGNORE` pattern is critical for idempotent payment processing — the same transaction may be notified multiple times by the payment provider.
:::
