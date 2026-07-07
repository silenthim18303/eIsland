---
title: Email Verification API
---

# Email Verification API

:::info
Email verification endpoints under `/auth/user/email-code/`. Handles email code sending and verification with captcha protection.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /auth/user/email-code/captcha-config | Get captcha configuration |
| POST | /auth/user/email-code/captcha-challenge | Submit captcha challenge |
| POST | /auth/user/email-code/send | Send email verification code |
| POST | /auth/user/email-code/verify | Verify email code |

:::tip
The captcha challenge must be completed before sending verification codes to prevent abuse.
:::
