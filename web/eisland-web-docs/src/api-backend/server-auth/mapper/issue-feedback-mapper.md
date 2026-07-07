---
title: IssueFeedbackMapper
---

# IssueFeedbackMapper

:::info
MyBatis mapper interface for issue feedback CRUD operations with user and admin query support.
:::

## Overview

`IssueFeedbackMapper` provides the data access layer for issue feedback records. Supports user submission, user/admin listing with pagination, counting, and admin resolution.

## Methods

| Method | Description | Returns |
|---|---|---|
| `insertFeedback(...)` | Insert a new feedback record | `int` (affected rows) |
| `listMine(username, status, offset, limit)` | List user's own feedback with pagination | `List<Map<String, Object>>` |
| `countMine(username, status)` | Count user's own feedback | `long` |
| `listAdmin(status, keyword, offset, limit)` | Admin: list all feedback with keyword search | `List<Map<String, Object>>` |
| `countAdmin(status, keyword)` | Admin: count all feedback | `long` |
| `resolve(id, status, adminReply, resolvedAt, updatedAt)` | Admin: resolve or reject feedback | `int` (affected rows) |

## Insert Parameters

| Parameter | Type | Description |
|---|---|---|
| `username` | `String` | Normalized lowercase username |
| `feedbackType` | `String` | Feedback type (e.g. `"general"`) |
| `title` | `String` | Feedback title |
| `content` | `String` | Feedback content |
| `contact` | `String` | Optional contact info |
| `feedbackLogUrl` | `String` | Optional log file URL |
| `feedbackScreenshotUrl` | `String` | Optional screenshot URL |
| `clientVersion` | `String` | Client version |
| `status` | `String` | Initial status (`"pending"`) |
| `createdAt` | `LocalDateTime` | Creation timestamp |
| `updatedAt` | `LocalDateTime` | Update timestamp |

## Resolve Parameters

| Parameter | Type | Description |
|---|---|---|
| `id` | `Long` | Feedback ID |
| `status` | `String` | New status (`"resolved"` or `"rejected"`) |
| `adminReply` | `String` | Admin reply text (max 1000 chars) |
| `resolvedAt` | `LocalDateTime` | Resolution timestamp (null if rejected) |
| `updatedAt` | `LocalDateTime` | Update timestamp |
