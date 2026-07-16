---
title: Auth API
icon: shield-halved
---

# Auth API

:::info
Authentication endpoints under `/auth/`. Handles user/admin login, registration, password reset, OAuth (GitHub, Microsoft, WeChat, Gitee, KOOK), and token refresh.
:::

## Endpoints

### Authentication

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

### OAuth

| Method | Path | Description |
|---|---|---|
| GET | /auth/oauth/providers | List available OAuth providers |
| GET | /auth/oauth/github/authorize | Get GitHub authorization URL |
| GET | /auth/oauth/github/callback | GitHub OAuth callback |
| GET | /auth/oauth/microsoft/authorize | Get Microsoft authorization URL |
| GET | /auth/oauth/microsoft/callback | Microsoft OAuth callback |
| GET | /auth/oauth/wechat/authorize | Get WeChat authorization URL |
| GET | /auth/oauth/wechat/callback | WeChat OAuth callback |
| POST | /auth/oauth/wechat/bind-email | Bind email for WeChat user (legacy) |
| GET | /auth/oauth/gitee/authorize | Get Gitee authorization URL |
| GET | /auth/oauth/gitee/callback | Gitee OAuth callback |
| GET | /auth/oauth/kook/authorize | Get KOOK authorization URL |
| GET | /auth/oauth/kook/callback | KOOK OAuth callback |
| POST | /auth/oauth/bind-email | Bind email for any OAuth provider (generic) |
| GET | /auth/oauth/poll | Poll for OAuth result readiness |
| GET | /auth/oauth/consume | Consume OAuth result (one-time read) |
| POST | /auth/oauth/set-password | Set password for new OAuth user |
| POST | /auth/oauth/bind | Bind OAuth to existing account |

:::warning
Admin registration is restricted and requires proper authorization.
:::

:::tip
OAuth uses a polling flow: the client opens the provider's authorization URL in the default browser, then polls `/auth/oauth/poll` until the callback completes. The result is consumed via `/auth/oauth/consume`.
:::

:::note
WeChat and KOOK do not return user email. When the callback returns `SET_PASSWORD` with no email, the client should redirect to the bind-email flow and call `POST /auth/oauth/bind-email` (generic) after the user provides and verifies their email.
:::
