---
title: EmailDispatchDlqLogMapper
---

# EmailDispatchDlqLogMapper

:::info
MyBatis mapper interface for email dispatch DLQ log insert and admin query operations.
:::

## Overview

`EmailDispatchDlqLogMapper` provides the data access layer for `EmailDispatchDlqLog`. Used by `EmailVerificationService` to persist DLQ log entries and by `AdminEmailDlqController` for admin querying.

## Methods

| Method | Description | Returns |
|---|---|---|
| `insert(logItem)` | Insert a new DLQ log entry | `int` (affected rows) |
| `adminList(traceId, email, limit)` | Query DLQ logs with optional trace ID and email filters | `List<EmailDispatchDlqLog>` |

## Query Parameters

### `adminList`

| Parameter | Type | Description |
|---|---|---|
| `traceId` | `String` | Optional filter by trace ID (null to skip) |
| `email` | `String` | Optional filter by email (null to skip) |
| `limit` | `int` | Maximum results to return (clamped to 1--200 by service layer) |
