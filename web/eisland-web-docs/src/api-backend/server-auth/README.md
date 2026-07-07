---
title: Server Auth
icon: key
---

# Server Auth

:::info
The `server-auth` module handles user authentication, email verification, issue feedback, and admin email DLQ management.
:::

## Overview

The server-auth module provides authentication and verification services:

- **Authentication** — User/admin login, registration, password reset, token refresh
- **Email Verification** — Email code sending and verification with captcha
- **Issue Feedback** — User feedback submission and admin resolution
- **Admin Email DLQ** — Email notification dead letter queue management

:::tip
All admin endpoints require `ROLE_ADMIN` authorization. User endpoints require valid JWT authentication.
:::

## Module Structure

| Layer | Description |
|---|---|
| [Auth API](./auth-api/) | Login, registration, and password reset endpoints |
| [Email Verification API](./email-verification-api/) | Email code sending and verification |
| [Feedback API](./feedback-api/) | User feedback submission and management |
| [Admin Email DLQ API](./admin-email-dlq-api/) | Email notification DLQ management |
