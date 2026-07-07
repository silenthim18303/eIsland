---
title: User API
---

# User API

:::info
User profile and account management endpoints under `/v1/user/`. Requires JWT authentication with USER, PRO, or ADMIN role.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/user/profile | Get user profile |
| PUT | /v1/user/profile | Update user profile |
| POST | /v1/user/profile/password | Update password |
| GET | /v1/user/profile/password/totp-seed | Get TOTP seed for password change |
| POST | /v1/user/profile/password/totp-seed/rotate | Rotate TOTP seed (admin only) |
| POST | /v1/user/logout | Logout |
| DELETE | /v1/user/account | Delete account (unregister) |
| GET | /v1/user/update-source | Get update source URL (PRO only) |

:::warning
Account deletion is irreversible. Users should be warned before proceeding.
:::
