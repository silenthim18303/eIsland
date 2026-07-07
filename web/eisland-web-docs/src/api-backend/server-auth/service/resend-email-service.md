---
title: ResendEmailService
---

# ResendEmailService

:::info
`@Service` that sends verification code emails via the Resend API with scene-specific subjects and HTML templates.
:::

## Overview

Wraps the Resend SDK to deliver verification code emails. Builds scene-specific email subjects and HTML bodies containing the verification code, scene label, and trace ID for debugging.

## Key Methods

| Method | Description |
|---|---|
| `sendVerificationCode(email, scene, code, traceId)` | Send a verification code email via Resend API |

## Email Subjects by Scene

| Scene | Subject |
|---|---|
| `REGISTER` | eIsland 注册验证码 |
| `LOGIN` | eIsland 登录验证码 |
| `RESET_PASSWORD` | eIsland 重置密码验证码 |
| `CHANGE_EMAIL` | eIsland 更换邮箱验证码 |
| `UNREGISTER` | eIsland 注销账号验证码 |

## Email Template

The HTML template includes:
- Scene label (e.g. "注册账号", "登录账号")
- Verification code (5-minute validity)
- Trace ID for debugging

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| API Key | `resend.api-key` | (empty) | Resend API key (required) |
| From Address | `resend.from` | (empty) | Sender email address (required) |

:::warning
Throws `IllegalStateException` if `resend.api-key` or `resend.from` is missing.
:::

## Dependencies

- Resend Java SDK (`com.resend.Resend`)
