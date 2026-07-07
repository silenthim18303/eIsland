---
title: User Admin API
---

# User Admin API

:::info
Admin user management endpoints under `/v1/admin/users/`. Requires `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/admin/users | List all users |
| PUT | /v1/admin/users/role | Update user role |
| PUT | /v1/admin/users/enabled | Enable/disable user |
| PUT | /v1/admin/users/ban | Ban/unban user |

:::warning
Role changes and bans take effect immediately. Admins should exercise caution when modifying user roles.
:::
