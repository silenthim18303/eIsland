---
title: IssueFeedbackService
---

# IssueFeedbackService

:::info
`@Service` for user issue feedback submission, listing, and admin resolution with Redis-backed rate limiting and static asset URL rewriting.
:::

## Overview

Manages the issue feedback lifecycle: user submission with input sanitization and rate limiting, user/admin listing with pagination and status filtering, and admin resolution with reply. Supports optional log file and screenshot attachments with CDN URL rewriting.

## Key Methods

| Method | Description |
|---|---|
| `submit(username, userIp, feedbackType, title, content, contact, feedbackLogUrl, feedbackScreenshotUrl, clientVersion)` | Submit new feedback (rate-limited to 3/hour per user+IP) |
| `listMine(username, status, page, pageSize, requestedNode, proUser)` | List user's own feedback with pagination |
| `countMine(username, status)` | Count user's own feedback |
| `listAdmin(status, keyword, page, pageSize, requestedNode, proUser)` | Admin: list all feedback with keyword search |
| `countAdmin(status, keyword)` | Admin: count all feedback |
| `resolve(id, status, adminReply)` | Admin: resolve or reject feedback with reply |

## Feedback Statuses

| Status | Description |
|---|---|
| `pending` | Newly submitted, awaiting review |
| `resolved` | Admin resolved the feedback |
| `rejected` | Admin rejected the feedback |

## Rate Limiting

| Dimension | Limit | Window |
|---|---|---|
| Per user+IP | 3 submissions | 1 hour |

## Input Sanitization

| Field | Max Length | Notes |
|---|---|---|
| `title` | 120 chars | Required, blank rejected |
| `content` | 5000 chars | Required, blank rejected |
| `contact` | 150 chars | Optional |
| `feedbackLogUrl` | 500 chars | Optional |
| `feedbackScreenshotUrl` | 500 chars | Optional |
| `clientVersion` | 50 chars | Optional |
| `feedbackType` | 40 chars | Defaults to `"general"` |

## Dependencies

- `IssueFeedbackMapper` -- database access
- `issueFeedbackRedisTemplate` -- rate limiting
- `StaticAssetUrlService` -- CDN URL rewriting for attachments
