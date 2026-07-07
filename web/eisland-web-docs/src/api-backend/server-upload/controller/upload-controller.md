---
title: Upload API
---

# Upload API

:::info
File upload endpoints under `/v1/upload/`. Requires JWT authentication.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/upload/admin-avatar | Upload admin avatar |
| POST | /v1/upload/user-avatar | Upload user avatar |
| POST | /v1/upload/feedback-log | Upload feedback log |
| POST | /v1/upload/feedback-screenshot | Upload feedback screenshot |

:::warning
Uploaded files are validated for size and type. Refer to the API documentation for specific limits.
:::
