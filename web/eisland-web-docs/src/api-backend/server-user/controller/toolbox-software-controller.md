---
title: Toolbox Software API
---

# Toolbox Software API

:::info
Toolbox software management endpoints under `/v1/`. User endpoints require JWT authentication. Admin endpoints require `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/toolbox/software/list | List enabled software (user) |
| GET | /v1/admin/toolbox/software/list | List all software (admin) |
| POST | /v1/admin/toolbox/software | Create software (admin) |
| PUT | /v1/admin/toolbox/software | Update software (admin) |
| DELETE | /v1/admin/toolbox/software | Delete software (admin) |

:::tip
Users can only see enabled software. Admins can manage all software entries.
:::
