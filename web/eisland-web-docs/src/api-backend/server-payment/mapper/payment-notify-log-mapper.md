---
title: PaymentNotifyLogMapper
---

# PaymentNotifyLogMapper

:::info
MyBatis mapper interface for payment notification log persistence.
:::

## Overview

`PaymentNotifyLogMapper` provides a single `insertIgnore` method for inserting payment notification log records. The `INSERT IGNORE` semantics prevent duplicate log entries from repeated payment provider callbacks.

## Methods

| Method | Return Type | Description |
|---|---|---|
| `insertIgnore(notifyLog)` | int | Insert a notification log record, ignoring duplicates |

## Parameters

| Param | Type | Description |
|---|---|---|
| `notifyLog` | PaymentNotifyLog | Notification log entity to insert |

:::tip
Notification logs serve as an audit trail for all payment callbacks, regardless of whether they resulted in successful order completion.
:::
