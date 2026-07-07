---
title: Feedback API
---

# Feedback API

:::info
Issue feedback endpoints under `/v1/`. Allows users to submit feedback and admins to manage and resolve issues.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/user/feedback/submit | Submit user feedback |
| GET | /v1/user/feedback/mine | List user's own feedback |
| GET | /v1/admin/feedback | List all feedback (admin) |
| PUT | /v1/admin/feedback/resolve | Resolve feedback (admin) |

:::tip
Users can only view their own feedback. Admins can view and resolve all feedback.
:::
