---
title: Auth API
---

# Auth API

:::info
Authentication endpoints under `/auth/`. Handles user/admin login, registration, password reset, and token refresh.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /auth/admin/login | Admin login |
| POST | /auth/user/login | User login (username/password) |
| POST | /auth/user/login/account | User login by account |
| POST | /auth/user/login/email | User login by email |
| POST | /auth/user/token/refresh | Refresh user token |
| POST | /auth/admin/register | Admin registration |
| POST | /auth/user/register | User registration |
| POST | /auth/user/password/reset | Reset user password |

:::warning
Admin registration is restricted and requires proper authorization.
:::
